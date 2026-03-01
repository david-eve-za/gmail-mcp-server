import { gmail_search_messages } from '../../src/tools/searchMessages';

describe('gmail_search_messages tool', () => {
  it('should have correct name and description', () => {
    expect(gmail_search_messages.name).toBe('gmail_search_messages');
    expect(gmail_search_messages.description).toBeDefined();
  });

  it('should have input schema defined', () => {
    expect(gmail_search_messages.inputSchema).toBeDefined();
  });
});
