import { z } from 'zod';
import { GmailClient } from '../gmail/GmailClient.js';
import { MessageSummary } from '../gmail/types.js';

export const gmail_search_messages = {
  name: 'gmail_search_messages',
  description: 'Search Gmail messages using Gmail search syntax. Supports searching by keywords, sender, date, labels, and more.',
  readOnlyHint: true,
  idempotentHint: true,
  inputSchema: z.object({
    query: z.string().min(1).describe(
      'Search query using Gmail search syntax. Examples: "from:john@example.com", '
      + '"subject:meeting", "important", "has:attachment", "before:2024/01/01", '
      + '"label:work", "to:me". Combine multiple criteria with spaces.'
    ),
    maxResults: z.number().min(1).max(100).optional().default(20).describe(
      'Maximum number of search results to return (1-100). Default is 20.'
    ),
    pageToken: z.string().optional().describe(
      'Page token for pagination. Use the nextPageToken from previous search to get more results.'
    ),
  }),

  async handler(args: {
    query: string;
    maxResults?: number;
    pageToken?: string;
  }, client: GmailClient): Promise<{
    content: Array<{ type: string; text: string }>;
    data?: MessageSummary[];
    _meta?: { nextPageToken?: string; resultSizeEstimate?: number };
  }> {
    if (!args.query.trim()) {
      throw new Error(
        'Search query cannot be empty. Please provide a search term or criteria.'
      );
    }

    try {
      const messages = await client.searchMessages(
        args.query,
        args.maxResults
      );

      return {
        content: messages.map(msg => ({
          type: 'text',
          text: JSON.stringify(msg, null, 2),
        })),
        data: messages,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to search messages: ${error.message}. ` +
        'Check your search query syntax and ensure you are authenticated.'
      );
    }
  },
};
