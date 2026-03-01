import { gmail_get_label } from '../../src/tools/getLabel';

describe('gmail_get_label tool', () => {
  it('should have correct name and description', () => {
    expect(gmail_get_label.name).toBe('gmail_get_label');
    expect(gmail_get_label.description).toBeDefined();
  });

  it('should have input schema defined', () => {
    expect(gmail_get_label.inputSchema).toBeDefined();
  });
});
