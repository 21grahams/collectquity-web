/** Running as the app added to the home screen (not in a regular browser tab). */
export const isHomeScreenApp =
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
