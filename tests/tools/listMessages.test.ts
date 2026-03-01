import { gmail_list_messages } from '../../src/tools/listMessages';

describe('gmail_list_messages tool', () => {
  it('should have correct name and description', () => {
    expect(gmail_list_messages.name).toBe('gmail_list_messages');
    expect(gmail_list_messages.description).toBeDefined();
  });

  it('should have input schema defined', () => {
    expect(gmail_list_messages.inputSchema).toBeDefined();
  });
});
