import type { LoginErrors } from './loginForm';

import { validateLogin } from './loginForm';

export const MIN_PASSWORD_LENGTH = 8;
export const CODE_LENGTH = 6;

export function validateSignUp(email: string, password: string): LoginErrors {
  const errors = validateLogin(email, password);
  if (!password) errors.password = 'Choose a password';
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return errors;
}

/** Keeps only digits, so a pasted "123 456" still works. */
export const cleanCode = (text: string) => text.replace(/\D/g, '').slice(0, CODE_LENGTH);

export const isCompleteCode = (code: string) => code.length === CODE_LENGTH;
