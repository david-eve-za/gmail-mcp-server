import dotenv from 'dotenv';

dotenv.config();

export const OAUTH2_CONFIG = {
  clientId: process.env.GMAIL_CLIENT_ID || '',
  clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
  redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:8080/oauth2callback',
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  tokenPath: `${process.env.HOME || ''}/.gmail-mcp/tokens.json`,
};

export function validateConfig(): void {
  if (!OAUTH2_CONFIG.clientId || !OAUTH2_CONFIG.clientSecret) {
    throw new Error(
      'Missing OAuth2 configuration. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env file.'
    );
  }
}
