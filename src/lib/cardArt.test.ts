import { describe, expect, it } from 'vitest';

import { artUrl } from './cardArt';

const url = 'https://tcgplayer-cdn.tcgplayer.com/product/509879_200w.jpg';

describe('artUrl', () => {
  it('picks a sharper size for the card and the full-screen view', () => {
    expect(artUrl(url, 'card')).toBe('https://tcgplayer-cdn.tcgplayer.com/product/509879_400w.jpg');
    expect(artUrl(url, 'full')).toBe('https://tcgplayer-cdn.tcgplayer.com/product/509879_in_1000x1000.jpg');
  });

  it('leaves other addresses alone', () => {
    expect(artUrl('https://example.com/a.png', 'full')).toBe('https://example.com/a.png');
  });
});
