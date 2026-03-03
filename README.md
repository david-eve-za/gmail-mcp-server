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
```

**Note**: The redirect URI is automatically generated using the first available port (default: 8080). You can optionally set `GMAIL_REDIRECT_URI` if you need a specific port.

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

## Configuration with MCP Clients

### Claude Desktop / Cline / OpenAI

1. Create or edit the config file:
   - **macOS/Linux**: `~/.config/claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the Gmail MCP server configuration:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": [
        "/absolute/path/to/gmail-mcp/build/index.js"
      ],
      "env": {
        "GMAIL_CLIENT_ID": "your_client_id.apps.googleusercontent.com",
        "GMAIL_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

**Note**: The redirect URI is automatically generated. You can optionally set `GMAIL_REDIRECT_URI` if you need a specific port.

### Gemini CLI / gemini-cli

1. Locate or create the Gemini configuration file:
   - **macOS/Linux**: `~/.config/gemini/config.json`
   - **Windows**: `%APPDATA%\gemini\config.json`

2. Add the MCP server configuration:

```json
{
  "mcp": {
    "servers": {
      "gmail": {
        "command": "node",
        "args": [
          "/absolute/path/to/gmail-mcp/build/index.js"
        ],
        "env": {
          "GMAIL_CLIENT_ID": "your_client_id.apps.googleusercontent.com",
          "GMAIL_CLIENT_SECRET": "your_client_secret"
        }
      }
    }
  }
}
```

3. Restart Gemini CLI

### openencode

1. Locate or create the opencode configuration file:
   - **macOS/Linux**: `~/.config/opencode/mcp.json`
   - **Windows**: `%APPDATA%\opencode\mcp.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": [
        "/absolute/path/to/gmail-mcp/build/index.js"
      ],
      "env": {
        "GMAIL_CLIENT_ID": "your_client_id.apps.googleusercontent.com",
        "GMAIL_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

3. Restart the opencode application

### Using npx (Recommended)

You can use npx directly without installing:

```bash
npx -y gmail-mcp-service
```

In your MCP client configuration:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": [
        "-y",
        "gmail-mcp-service"
      ],
      "env": {
        "GMAIL_CLIENT_ID": "your_client_id.apps.googleusercontent.com",
        "GMAIL_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

### Using npm global installation

If you prefer to install the package globally:

```bash
npm install -g @your-scope/gmail-mcp
```

Then in your MCP client configuration, use:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "npx",
      "args": [
        "@your-scope/gmail-mcp"
      ],
      "env": {
        "GMAIL_CLIENT_ID": "your_client_id.apps.googleusercontent.com",
        "GMAIL_CLIENT_SECRET": "your_client_secret"
      }
    }
  }
}
```

### First-time authorization

When you first use the Gmail MCP server with any client:

1. The server will check for existing tokens in `~/.gmail-mcp/tokens.json`
2. If no tokens are found, it will open your browser for OAuth2 authorization
3. Authorize the application to access your Gmail
4. Tokens are stored locally for future use
5. The server will then be available to your MCP client

## Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## CI/CD

This project uses GitHub Actions for continuous integration and automatic npm publishing.

### How it works

1. **CI Workflow** (`.github/workflows/ci.yml`):
   - Runs on every push and pull request to `main`
   - Tests on Node.js 18 and 20
   - Runs all tests and TypeScript compilation

2. **Publish Workflow** (`.github/workflows/publish.yml`):
   - Runs on push to `main` branch
   - Checks if version in `package.json` is newer than npm registry
   - If version changed:
     - Runs tests and build
     - Publishes to npm
     - Creates a GitHub release

### Setting up npm publishing

To enable automatic npm publishing:

1. Go to your GitHub repository **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add a secret named `NPM_TOKEN`
4. Use your npm authentication token as the value

**To create an npm token:**
1. Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token" → "Automation"
3. Copy the generated token
4. Add it as `NPM_TOKEN` in GitHub Actions secrets

### Releasing a new version

1. Update the version in `package.json`:
   ```bash
   npm version major  # or minor or patch
   ```

2. Commit and push to `main`:
   ```bash
   git commit -am "chore: bump version to X.Y.Z"
   git push origin main
   ```

3. GitHub Actions will automatically:
   - Run tests
   - Build the project
   - Publish to npm
   - Create a GitHub release

## Security

- Tokens are stored locally in `~/.gmail-mcp/tokens.json`
- Only read-only Gmail access is requested
- No credentials are shared or transmitted

## License

MIT
