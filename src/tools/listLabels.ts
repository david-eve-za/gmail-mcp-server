import { z } from 'zod';
import { GmailClient } from '../gmail/GmailClient.js';
import { GmailLabel } from '../gmail/types.js';

export const gmail_list_labels = {
  name: 'gmail_list_labels',
  description: 'List all Gmail labels including system labels (INBOX, SENT, DRAFT, SPAM, TRASH) and user-created labels with their message counts.',
  readOnlyHint: true,
  idempotentHint: true,
  inputSchema: z.object({}),

  async handler(args: {}, client: GmailClient): Promise<{
    content: Array<{ type: string; text: string }>;
    data?: GmailLabel[];
  }> {
    try {
      const labels = await client.listLabels();

      return {
        content: labels.map(label => ({
          type: 'text',
          text: JSON.stringify(label, null, 2),
        })),
        data: labels,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to list labels: ${error.message}. ` +
        'Ensure you are authenticated with proper Gmail permissions.'
      );
    }
  },
};
