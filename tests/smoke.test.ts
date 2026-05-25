import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('boots the test harness', () => {
    expect(1 + 1).toBe(2);
  });
});
