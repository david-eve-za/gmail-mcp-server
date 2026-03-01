import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface TokenStorage {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope?: string;
  token_type?: string;
}

export class OAuth2Manager {
  private oauth2Client: OAuth2Client;
  private tokenPath: string;

  constructor(tokenPath: string, clientId?: string, clientSecret?: string, redirectUri?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );
    this.tokenPath = tokenPath;
  }

  async getAccessToken(): Promise<string> {
    const storedToken = await this.loadToken();

    if (!storedToken) {
      throw new Error('No token found. Please authenticate first.');
    }

    const now = Date.now();

    if (storedToken.expiry_date && storedToken.expiry_date < now) {
      await this.refreshAccessToken(storedToken.refresh_token);
      const newToken = await this.loadToken();
      return newToken!.access_token;
    }

    return storedToken.access_token;
  }

  async loadToken(): Promise<TokenStorage | null> {
    try {
      const tokenData = await fs.readFile(this.tokenPath, 'utf-8');
      return JSON.parse(tokenData) as TokenStorage;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async saveToken(token: TokenStorage): Promise<void> {
    await this.ensureTokenDirectory();
    await fs.writeFile(this.tokenPath, JSON.stringify(token, null, 2));
    this.oauth2Client.setCredentials(token);
  }

  async refreshAccessToken(refreshToken: string): Promise<void> {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const credentials = await this.oauth2Client.getAccessToken();

    if (!credentials.token) {
      throw new Error('Failed to refresh access token');
    }

    const existingToken = await this.loadToken();
    if (!existingToken) {
      throw new Error('No token found to refresh');
    }

    const newToken: TokenStorage = {
      ...existingToken,
      access_token: credentials.token,
      expiry_date: Date.now() + 3600000,
    };

    await this.saveToken(newToken);
  }

  getAuthorizationUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
      prompt: 'consent',
    });
  }

  async exchangeCodeForToken(code: string): Promise<TokenStorage> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Failed to exchange code for token');
    }

    const token: TokenStorage = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expiry_date: tokens.expiry_date || Date.now() + 3600000,
      scope: tokens.scope,
      token_type: tokens.token_type || undefined,
    };

    await this.saveToken(token);
    return token;
  }

  private async ensureTokenDirectory(): Promise<void> {
    const dir = path.dirname(this.tokenPath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}
