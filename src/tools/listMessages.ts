import { z } from 'zod';
import { GmailClient } from '../gmail/GmailClient.js';
import { MessageSummary } from '../gmail/types.js';

export const gmail_list_messages = {
  name: 'gmail_list_messages',
  description: 'List messages from Gmail folders/labels with pagination support. Returns message summaries including ID, thread ID, snippet, date, sender, and subject.',
  readOnlyHint: true,
  inputSchema: z.object({
    labelIds: z.array(z.string()).optional().describe(
      'Label IDs to filter messages (e.g., "INBOX", "SENT", "DRAFT"). Defaults to "INBOX". '
      + 'Use gmail_list_labels to see all available labels.'
    ),
    maxResults: z.number().min(1).max(100).optional().default(20).describe(
      'Maximum number of messages to return (1-100). Default is 20.'
    ),
    pageToken: z.string().optional().describe(
      'Page token for pagination. Use the nextPageToken from previous response to get next page of results.'
    ),
    includeSpamTrash: z.boolean().optional().default(false).describe(
      'Include messages from SPAM and TRASH. Default is false.'
    ),
  }),

  async handler(args: {
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
    includeSpamTrash?: boolean;
  }, client: GmailClient): Promise<{
    content: Array<{ type: string; text: string }>;
    data?: MessageSummary[];
    _meta?: { nextPageToken?: string; resultSizeEstimate?: number };
  }> {
    try {
      const labelIds = args.labelIds || ['INBOX'];
      const messages = await client.listMessages({
        labelIds,
        maxResults: args.maxResults,
        pageToken: args.pageToken,
        includeSpamTrash: args.includeSpamTrash,
      });

      return {
        content: messages.map(msg => ({
          type: 'text',
          text: JSON.stringify(msg, null, 2),
        })),
        data: messages,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to list messages: ${error.message}. ` +
        `Ensure you have valid OAuth2 credentials and have authorized the application.`
      );
    }
  },
};

export const listMessages = gmail_list_messages;
