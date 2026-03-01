# Gmail MCP Server

A Model Context Protocol (MCP) server that provides read-only access to Gmail via Google Gmail API.

## Features

- List messages from Gmail folders/labels
- Read complete message details including body and attachments
- Search messages using Gmail search syntax
- View all Gmail labels and their statistics
- Read-only access with OAuth2 authentication

## Prerequisites

1. Node.js 18+ and npm
2. Google Cloud project with Gmail API enabled
3. OAuth2 credentials (client ID and client secret)

## Setup

### 1. Get Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Gmail API: APIs & Services > Library > Gmail API > Enable
4. Create OAuth2 credentials:
   - APIs & Services > Credentials > Create Credentials > OAuth client ID
   - Application type: Desktop app
   - Name: Gmail MCP Server
5. Copy the Client ID and Client Secret

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file:

```env
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:8080/oauth2callback
```

### 4. Build the Project

```bash
npm run build
```

### 5. Test with MCP Inspector

```bash
npm run inspect
```

This will:
1. Check for existing tokens in `~/.gmail-mcp/tokens.json`
2. If not found, open browser for OAuth2 authorization
3. Authorize the application to access Gmail
4. Start the MCP Inspector for testing

## Usage

The server provides the following tools:

### gmail_list_messages
List messages from Gmail folders/labels.

Parameters:
- `labelIds` (optional): Array of label IDs (default: ["INBOX"])
- `maxResults` (optional): Number of messages to return (default: 20, max: 100)
- `pageToken` (optional): Pagination token
- `includeSpamTrash` (optional): Include spam/trash (default: false)

### gmail_get_message
Get complete message details.

Parameters:
- `messageId` (required): Message ID
- `format` (optional): "full", "metadata", or "minimal" (default: "metadata")

### gmail_search_messages
Search messages using Gmail search syntax.

Parameters:
- `query` (required): Search query (e.g., "from:john@example.com", "subject:meeting")
- `maxResults` (optional): Number of results (default: 20)
- `pageToken` (optional): Pagination token

### gmail_list_labels
List all Gmail labels.

No parameters required.

### gmail_get_label
Get details of a specific label.

Parameters:
- `labelId` (required): Label ID

## Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Security

- Tokens are stored locally in `~/.gmail-mcp/tokens.json`
- Only read-only Gmail access is requested
- No credentials are shared or transmitted

## License

MIT
