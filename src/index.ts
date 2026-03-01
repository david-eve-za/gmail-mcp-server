import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OAuth2Manager } from './auth/OAuth2Manager.js';
import { validateConfig, OAUTH2_CONFIG } from './auth/config.js';
import { GmailClient } from './gmail/GmailClient.js';

async function main() {
  try {
    validateConfig();

    const oauth2Manager = new OAuth2Manager(
      OAUTH2_CONFIG.tokenPath,
      OAUTH2_CONFIG.clientId,
      OAUTH2_CONFIG.clientSecret,
      OAUTH2_CONFIG.redirectUri
    );

    const gmailClient = new GmailClient(oauth2Manager);

    const server = new Server(
      {
        name: 'gmail-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'gmail_list_messages',
          description: 'List messages from Gmail folders/labels with pagination support. Returns message summaries including ID, thread ID, snippet, date, sender, and subject.',
          inputSchema: {
            type: 'object',
            properties: {
              labelIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Label IDs to filter messages (e.g., "INBOX", "SENT", "DRAFT"). Defaults to "INBOX". Use gmail_list_labels to see all available labels.',
              },
              maxResults: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 20,
                description: 'Maximum number of messages to return (1-100). Default is 20.',
              },
              pageToken: {
                type: 'string',
                description: 'Page token for pagination. Use the nextPageToken from previous response to get next page of results.',
              },
              includeSpamTrash: {
                type: 'boolean',
                default: false,
                description: 'Include messages from SPAM and TRASH. Default is false.',
              },
            },
          },
        },
        {
          name: 'gmail_get_message',
          description: 'Get complete details of a specific Gmail message including subject, sender, date, body content, and attachments.',
          inputSchema: {
            type: 'object',
            required: ['messageId'],
            properties: {
              messageId: {
                type: 'string',
                description: 'The ID of the message to retrieve (e.g., "1234567890abcdef"). Use the ID returned by gmail_list_messages or gmail_search_messages.',
              },
              format: {
                type: 'string',
                enum: ['full', 'metadata', 'minimal'],
                default: 'metadata',
                description: 'Format of the message response. "full" includes full body content, "metadata" includes just headers, "minimal" includes just the ID and thread ID.',
              },
            },
          },
        },
        {
          name: 'gmail_search_messages',
          description: 'Search Gmail messages using Gmail search syntax. Supports searching by keywords, sender, date, labels, and more.',
          inputSchema: {
            type: 'object',
            required: ['query'],
            properties: {
              query: {
                type: 'string',
                description: 'Search query using Gmail search syntax. Examples: "from:john@example.com", "subject:meeting", "important", "has:attachment", "before:2024/01/01", "label:work", "to:me". Combine multiple criteria with spaces.',
              },
              maxResults: {
                type: 'number',
                minimum: 1,
                maximum: 100,
                default: 20,
                description: 'Maximum number of search results to return (1-100). Default is 20.',
              },
              pageToken: {
                type: 'string',
                description: 'Page token for pagination. Use the nextPageToken from previous search to get more results.',
              },
            },
          },
        },
        {
          name: 'gmail_list_labels',
          description: 'List all Gmail labels including system labels (INBOX, SENT, DRAFT, SPAM, TRASH) and user-created labels with their message counts.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'gmail_get_label',
          description: 'Get details of a specific Gmail label including ID, name, type, and message counts.',
          inputSchema: {
            type: 'object',
            required: ['labelId'],
            properties: {
              labelId: {
                type: 'string',
                description: 'The ID of the label to retrieve (e.g., "INBOX", "SENT", or custom label IDs). Use gmail_list_labels to see all available label IDs.',
              },
            },
          },
        },
      ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const name = request.params.name;
      const args = request.params.arguments || {};

      switch (name) {
        case 'gmail_list_messages': {
          const { listMessages } = await import('./tools/listMessages.js');
          return await listMessages.handler(args, gmailClient);
        }
        case 'gmail_get_message': {
          const { getMessage } = await import('./tools/getMessage.js');
          return await getMessage.handler(args, gmailClient);
        }
        case 'gmail_search_messages': {
          const { searchMessages } = await import('./tools/searchMessages.js');
          return await searchMessages.handler(args, gmailClient);
        }
        case 'gmail_list_labels': {
          const { listLabels } = await import('./tools/listLabels.js');
          return await listLabels.handler(args, gmailClient);
        }
        case 'gmail_get_label': {
          const { getLabel } = await import('./tools/getLabel.js');
          return await getLabel.handler(args, gmailClient);
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Gmail MCP Server started successfully');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
