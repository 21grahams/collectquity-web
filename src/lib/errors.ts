import { APP_NAME } from './brand';

export const CONNECTION_MESSAGE = `Can't reach ${APP_NAME}. Check your connection and try again.`;

/** Browsers word a dropped connection differently: Safari "Load failed", Chrome "Failed to fetch"… */
export const isConnectionError = (message: string) =>
  message === CONNECTION_MESSAGE || /load failed|fetch|network/i.test(message);

export const friendlyConnectionError = (message: string) =>
  isConnectionError(message) ? CONNECTION_MESSAGE : message;
