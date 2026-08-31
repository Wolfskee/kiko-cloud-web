import { describe, it, expect } from 'vitest';
import { formatBytes, formatDate, getFileIconInfo, cn } from './utils';

describe('utils unit tests', () => {
  describe('cn utility', () => {
    it('merges class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });

  describe('formatBytes utility', () => {
    it('handles 0 and negative bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(-100)).toBe('0 B');
    });

    it('formats bytes to human-readable string', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate utility', () => {
    it('returns "Recently" for invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Recently');
    });

    it('formats valid ISO date string correctly', () => {
      const formatted = formatDate('2026-08-30T12:00:00Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Aug');
    });
  });

  describe('getFileIconInfo utility', () => {
    it('identifies image files', () => {
      const info = getFileIconInfo('image/png', 'photo.png');
      expect(info.color).toContain('emerald');
    });

    it('identifies video files', () => {
      const info = getFileIconInfo('video/mp4', 'clip.mp4');
      expect(info.color).toContain('indigo');
    });

    it('identifies PDF files', () => {
      const info = getFileIconInfo('application/pdf', 'document.pdf');
      expect(info.color).toContain('rose');
    });

    it('identifies audio files', () => {
      const info = getFileIconInfo('audio/mp3', 'song.mp3');
      expect(info.color).toContain('purple');
    });

    it('returns default generic file info for unknown types', () => {
      const info = getFileIconInfo('unknown/type', 'data.xyz');
      expect(info.color).toContain('slate');
    });
  });
});
