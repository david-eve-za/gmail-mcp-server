import { google } from 'googleapis';
import { OAuth2Manager } from '../auth/OAuth2Manager.js';
import {
  GmailMessage,
  GmailThread,
  GmailLabel,
  MessageSummary,
  MessageDetail,
  AttachmentInfo,
} from './types.js';
import { base64ToString } from '../utils/base64.js';

export interface ListMessagesOptions {
  labelIds?: string[];
  maxResults?: number;
  pageToken?: string;
  query?: string;
  includeSpamTrash?: boolean;
}

export class GmailClient {
  private gmail: any;
  private oauth2Manager: OAuth2Manager;

  constructor(oauth2Manager: OAuth2Manager) {
    this.oauth2Manager = oauth2Manager;
    this.gmail = google.gmail({ version: 'v1' });
  }

  private async getAuthHeader(): Promise<string> {
    const accessToken = await this.oauth2Manager.getAccessToken();
    return `Bearer ${accessToken}`;
  }

  async listMessages(options: ListMessagesOptions = {}): Promise<MessageSummary[]> {
    const authHeader = await this.getAuthHeader();

    const response = await this.gmail.users.messages.list({
      auth: { getAccessToken: () => Promise.resolve(authHeader) },
      userId: 'me',
      labelIds: options.labelIds,
      maxResults: options.maxResults || 20,
      pageToken: options.pageToken,
      q: options.query,
      includeSpamTrash: options.includeSpamTrash || false,
    });

    if (!response.data.messages) {
      return [];
    }

    const messages = response.data.messages;
    const summaries: MessageSummary[] = [];

    for (const msg of messages) {
      const authHeader = await this.getAuthHeader();
      const msgResponse = await this.gmail.users.messages.get({
        auth: { getAccessToken: () => Promise.resolve(authHeader) },
        userId: 'me',
        id: msg.id || '',
        format: 'metadata',
      });
      const gmailMessage = msgResponse.data as GmailMessage;

      summaries.push({
        id: gmailMessage.id,
        threadId: gmailMessage.threadId,
        snippet: gmailMessage.snippet || '',
        date: this.getHeaderValue(gmailMessage.payload?.headers || [], 'Date'),
        from: this.getHeaderValue(gmailMessage.payload?.headers || [], 'From'),
        subject: this.getHeaderValue(gmailMessage.payload?.headers || [], 'Subject'),
        labels: gmailMessage.labelIds || [],
      });
    }

    return summaries;
  }

  async getMessage(messageId: string, format: 'full' | 'metadata' | 'minimal' = 'metadata'):
  Promise<MessageDetail> {
    const authHeader = await this.getAuthHeader();

    const response = await this.gmail.users.messages.get({
      auth: { getAccessToken: () => Promise.resolve(authHeader) },
      userId: 'me',
      id: messageId,
      format: format,
    });

    const message = response.data as GmailMessage;
    const headers = message.payload?.headers || [];
    const body = this.extractBody(message.payload);
    const attachments = this.extractAttachments(message.payload);

    return {
      id: message.id,
      threadId: message.threadId,
      snippet: message.snippet || '',
      date: this.getHeaderValue(headers, 'Date'),
      from: this.getHeaderValue(headers, 'From'),
      subject: this.getHeaderValue(headers, 'Subject'),
      labels: response.data.labelIds || [],
      body,
      attachments,
    };
  }

  async searchMessages(query: string, maxResults: number = 20): Promise<MessageSummary[]> {
    return this.listMessages({
      query,
      maxResults,
    });
  }

  async listLabels(): Promise<GmailLabel[]> {
    const authHeader = await this.getAuthHeader();

    const response = await this.gmail.users.labels.list({
      auth: { getAccessToken: () => Promise.resolve(authHeader) },
      userId: 'me',
    });

    return response.data.labels || [];
  }

  async getLabel(labelId: string): Promise<GmailLabel> {
    const authHeader = await this.getAuthHeader();

    const response = await this.gmail.users.labels.get({
      auth: { getAccessToken: () => Promise.resolve(authHeader) },
      userId: 'me',
      id: labelId,
    });

    return response.data;
  }

  private getHeaderValue(headers: Array<{ name: string; value: string }>, name: string): string {
    const header = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  }

  private extractBody(payload: any): string {
    if (!payload) return '';

    if (payload.body?.data) {
      return base64ToString(payload.body.data);
    }

    if (payload.parts) {
      const textPart = payload.parts.find((part: any) =>
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      return textPart?.body?.data ? base64ToString(textPart.body.data) : '';
    }

    return '';
  }

  private extractAttachments(payload: any): AttachmentInfo[] {
    const attachments: AttachmentInfo[] = [];

    const traverse = (part: any) => {
      if (part.body?.attachmentId && part.filename) {
        attachments.push({
          id: part.body.attachmentId,
          filename: part.filename,
          size: part.body.size || 0,
          mimeType: part.mimeType,
        });
      }

      if (part.parts) {
        part.parts.forEach(traverse);
      }
    };

    traverse(payload);
    return attachments;
  }
}
