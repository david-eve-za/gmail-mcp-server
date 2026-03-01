import { gmail_get_message } from '../../src/tools/getMessage';

describe('gmail_get_message tool', () => {
  it('should have correct name and description', () => {
    expect(gmail_get_message.name).toBe('gmail_get_message');
    expect(gmail_get_message.description).toBeDefined();
  });

  it('should have input schema defined', () => {
    expect(gmail_get_message.inputSchema).toBeDefined();
  });
});
