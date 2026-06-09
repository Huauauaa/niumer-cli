import { describe, expect, it } from 'vitest';
import {
  getDefaultDateRange,
  parseTimerange,
  resolveDateRange,
  summarizeNumstat,
} from './count.js';

describe('date ranges', () => {
  it('defaults to the current calendar year', () => {
    expect(getDefaultDateRange(new Date('2026-06-09T10:49:00Z'))).toEqual({
      since: '2026-01-01',
      until: '2026-12-31',
    });
  });

  it('parses a timerange', () => {
    expect(parseTimerange('2025-01-01..2025-03-31')).toEqual({
      since: '2025-01-01',
      until: '2025-03-31',
    });
  });

  it('lets explicit since and until override timerange values', () => {
    expect(
      resolveDateRange({
        since: '2025-02-01',
        timerange: '2025-01-01..2025-12-31',
        until: '2025-02-28',
      }),
    ).toEqual({
      since: '2025-02-01',
      until: '2025-02-28',
    });
  });
});

describe('numstat summary', () => {
  it('sums inserted and deleted lines', () => {
    expect(
      summarizeNumstat('10\t2\tsrc/index.ts\n-\t-\timage.png\n5\t0\tREADME.md'),
    ).toEqual({
      deletions: 2,
      filesChanged: 3,
      insertions: 15,
      totalChanged: 17,
    });
  });
});
