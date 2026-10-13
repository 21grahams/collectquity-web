/** TCGplayer serves each image in a few sizes; the catalog stores the 200px one. */
export function artUrl(url: string, size: 'card' | 'full'): string {
  return url.replace(/_200w\.jpg$/, size === 'card' ? '_400w.jpg' : '_in_1000x1000.jpg');
}
