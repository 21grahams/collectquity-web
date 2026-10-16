import { describe, expect, it } from 'vitest';

import { CONNECTION_MESSAGE, friendlyConnectionError } from './errors';

describe('friendlyConnectionError', () => {
  it('turns each browser’s dropped-connection wording into one plain message', () => {
    expect(friendlyConnectionError('TypeError: Load failed')).toBe(CONNECTION_MESSAGE);
    expect(friendlyConnectionError('TypeError: Failed to fetch')).toBe(CONNECTION_MESSAGE);
    expect(friendlyConnectionError('NetworkError when attempting to fetch resource.')).toBe(
      CONNECTION_MESSAGE,
    );
  });
  it('leaves other messages alone', () => {
    expect(friendlyConnectionError("You've reached the beta limit of 2,000 singles.")).toBe(
      "You've reached the beta limit of 2,000 singles.",
    );
  });
});
