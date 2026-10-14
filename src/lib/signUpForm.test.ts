import { describe, expect, it } from 'vitest';

import { cleanCode, isCompleteCode, validateSignUp } from './signUpForm';

describe('validateSignUp', () => {
  it('asks for a password of at least 8 characters', () => {
    expect(validateSignUp('me@example.com', '').password).toBe('Choose a password');
    expect(validateSignUp('me@example.com', 'short').password).toBe('Use at least 8 characters');
    expect(validateSignUp('me@example.com', 'long enough')).toEqual({});
  });
  it('checks the email like the login form', () => {
    expect(validateSignUp('me@example', 'long enough').email).toBe('Enter a valid email');
  });
});

describe('codes', () => {
  it('keeps only the first six digits', () => {
    expect(cleanCode(' 123 456 ')).toBe('123456');
    expect(cleanCode('1234567')).toBe('123456');
  });
  it('is complete at six digits', () => {
    expect(isCompleteCode('12345')).toBe(false);
    expect(isCompleteCode('123456')).toBe(true);
  });
});
