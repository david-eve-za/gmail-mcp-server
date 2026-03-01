import { gmail_list_labels } from '../../src/tools/listLabels';

describe('gmail_list_labels tool', () => {
  it('should have correct name and description', () => {
    expect(gmail_list_labels.name).toBe('gmail_list_labels');
    expect(gmail_list_labels.description).toBeDefined();
  });

  it('should have input schema defined', () => {
    expect(gmail_list_labels.inputSchema).toBeDefined();
  });
});
