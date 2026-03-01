import { z } from 'zod';
import { GmailClient } from '../gmail/GmailClient.js';
import { GmailLabel } from '../gmail/types.js';

export const gmail_get_label = {
  name: 'gmail_get_label',
  description: 'Get details of a specific Gmail label including ID, name, type, and message counts.',
  readOnlyHint: true,
  idempotentHint: true,
  inputSchema: z.object({
    labelId: z.string().min(1).describe(
      'The ID of the label to retrieve (e.g., "INBOX", "SENT", or custom label IDs). '
      + 'Use gmail_list_labels to see all available label IDs.'
    ),
  }),

  async handler(args: {
    labelId: string;
  }, client: GmailClient): Promise<{
    content: Array<{ type: string; text: string }>;
    data?: GmailLabel;
  }> {
    if (!args.labelId || !/^[\w-]+$/.test(args.labelId)) {
      throw new Error(
        'Invalid labelId format. Label ID should be a string of alphanumeric characters and hyphens. '
        + 'Example: "INBOX", "Label_123"'
      );
    }

    try {
      const label = await client.getLabel(args.labelId);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(label, null, 2),
        }],
        data: label,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(
          `Label not found: ${args.labelId}. ` +
          'Use gmail_list_labels to see all available labels.'
        );
      }
      throw new Error(
        `Failed to get label: ${error.message}. ` +
        'Ensure the label exists and you have permission to access it.'
      );
    }
  },
};

export const getLabel = gmail_get_label;
