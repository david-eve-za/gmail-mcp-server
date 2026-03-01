import { z } from 'zod';
import { GmailClient } from '../gmail/GmailClient.js';
import { MessageDetail } from '../gmail/types.js';

export const gmail_get_message = {
  name: 'gmail_get_message',
  description: 'Get complete details of a specific Gmail message including subject, sender, date, body content, and attachments.',
  readOnlyHint: true,
  idempotentHint: true,
  inputSchema: z.object({
    messageId: z.string().min(1).describe(
      'The ID of the message to retrieve (e.g., "1234567890abcdef"). '
      + 'Use the ID returned by gmail_list_messages or gmail_search_messages.'
    ),
    format: z.enum(['full', 'metadata', 'minimal']).optional().default('metadata').describe(
      'Format of the message response. "full" includes full body content, '
      + '"metadata" includes just headers, "minimal" includes just the ID and thread ID.'
    ),
  }),

  async handler(args: {
    messageId: string;
    format?: 'full' | 'metadata' | 'minimal';
  }, client: GmailClient): Promise<{
    content: Array<{ type: string; text: string }>;
    data?: MessageDetail;
  }> {
    if (!args.messageId || !/^\w+$/.test(args.messageId)) {
      throw new Error(
        'Invalid messageId format. Message ID should be a string of alphanumeric characters. '
        + 'Example: "1234567890abcdef"'
      );
    }

    try {
      const message = await client.getMessage(args.messageId, args.format);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(message, null, 2),
        }],
        data: message,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          `Message not found: ${args.messageId}. ` +
          `Ensure the message ID is correct and you have access to this message.`
        );
      }
      throw new Error(
        `Failed to get message: ${error.message}. ` +
        `Check that the message exists and you have permission to access it.`
      );
    }
  },
};

export const getMessage = gmail_get_message;
