import { describe, expect, it } from 'vitest';

import { centerSquare } from './avatarImage';

describe('centerSquare', () => {
  it('takes the middle of a landscape or portrait photo', () => {
    expect(centerSquare(4000, 3000)).toEqual({ x: 500, y: 0, size: 3000 });
    expect(centerSquare(3000, 4000)).toEqual({ x: 0, y: 500, size: 3000 });
    expect(centerSquare(800, 800)).toEqual({ x: 0, y: 0, size: 800 });
  });
});
