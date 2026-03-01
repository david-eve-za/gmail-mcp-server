import { OAuth2Manager } from '../../src/auth/OAuth2Manager';
import fs from 'fs';

describe('OAuth2Manager', () => {
  const testTokenPath = '/tmp/.test-tokens.json';

  afterEach(() => {
    if (fs.existsSync(testTokenPath)) {
      fs.unlinkSync(testTokenPath);
    }
  });

  it('should save token to file', async () => {
    const manager = new OAuth2Manager(testTokenPath);
    await manager.saveToken({
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expiry_date: Date.now() + 3600000,
    });

    expect(fs.existsSync(testTokenPath)).toBe(true);
  });

  it('should load token from file', async () => {
    const manager = new OAuth2Manager(testTokenPath);
    const token = {
      access_token: 'test_access_token',
      refresh_token: 'test_refresh_token',
      expiry_date: Date.now() + 3600000,
    };
    await manager.saveToken(token);

    const loaded = await manager.loadToken();
    expect(loaded).toEqual(token);
  });
});
