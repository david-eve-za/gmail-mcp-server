import { GmailClient } from '../../src/gmail/GmailClient';
import { OAuth2Manager } from '../../src/auth/OAuth2Manager';

describe('GmailClient', () => {
  describe('initialization', () => {
    it('should create GmailClient instance', () => {
      const mockOAuth2Manager = {
        getAccessToken: () => Promise.resolve('test_token'),
      } as OAuth2Manager;
      const gmailClient = new GmailClient(mockOAuth2Manager);
      expect(gmailClient).toBeInstanceOf(GmailClient);
    });
  });
});
