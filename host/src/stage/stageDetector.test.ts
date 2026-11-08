import { describe, expect, it } from 'vitest';
import { StageDetector } from './stageDetector.ts';
import { classifyTool } from './toolTaxonomy.ts';
import { resolveProfile } from './sensitivityProfile.ts';
import type { Stage } from '../model/types.ts';

function feed(
  names: readonly string[],
  sensitivity: 'loose' | 'standard' | 'aggressive' = 'standard',
  initialStage: Stage = 'exploration',
): StageDetector {
  const detector = new StageDetector(resolveProfile(sensitivity), { initialStage });
  for (const name of names) {
    detector.record(name);
  }
  return detector;
}

describe('StageDetector', () => {
  it('detects exploration from a read/search/list window', () => {
    const detector = feed(['read_file', 'search_files', 'list_dir', 'read_file', 'grep']);
    expect(detector.getStage()).toBe('exploration');
  });

  it('detects editing when edit-like share exceeds 50%', () => {
    const detector = feed(['write_file', 'edit_file', 'apply_patch', 'read_file', 'write_file']);
    expect(detector.getStage()).toBe('editing');
  });

  it('detects debugging when bash/test/run calls appear consecutively', () => {
    const detector = feed(['bash', 'run_tests', 'bash']);
    expect(detector.getStage()).toBe('debugging');
  });

  it('walks exploration -> editing -> debugging as the window turns over', () => {
    const detector = feed(['read_file', 'grep', 'list_dir', 'view_file', 'search_files']);
    expect(detector.getStage()).toBe('exploration');

    const editing = feed([
      'read_file', 'read_file', 'read_file', 'read_file', 'read_file',
      'write_file', 'write_file', 'write_file',
    ]);
    expect(editing.getStage()).toBe('editing');

    const debugging = feed([
      'write_file', 'write_file', 'write_file', 'write_file', 'write_file',
      'bash', 'run_tests',
    ]);
    expect(debugging.getStage()).toBe('debugging');
  });

  it('keeps only the most recent five tool calls', () => {
    const detector = feed(['read_file', 'grep', 'list_dir', 'view_file', 'search_files', 'cat', 'write_file']);
    expect(detector.getWindow()).toEqual(['list_dir', 'view_file', 'search_files', 'cat', 'write_file']);
  });

  it('returns to exploration after a full window of read-like calls', () => {
    const detector = feed([
      'bash', 'run_tests',
      'read_file', 'read_file', 'read_file', 'read_file', 'read_file',
    ]);
    expect(detector.getStage()).toBe('exploration');
  });

  it('keeps the current stage when no threshold is met (hysteresis)', () => {
    const detector = feed(
      ['write_file', 'read_file', 'write_file', 'read_file', 'read_file'],
      'loose',
      'editing',
    );
    expect(detector.getStage()).toBe('editing');
  });

  it('aggressive sensitivity switches to exploration on the same window that loose keeps', () => {
    const window = ['write_file', 'read_file', 'write_file', 'read_file', 'read_file'];
    expect(feed(window, 'aggressive', 'editing').getStage()).toBe('exploration');
    expect(feed(window, 'loose', 'editing').getStage()).toBe('editing');
  });

  it('classifies camelCase, MCP-prefixed, and neutral bookkeeping tool names', () => {
    expect(classifyTool('WebSearch')).toBe('explore');
    expect(classifyTool('mcp__fs__read_file')).toBe('explore');
    expect(classifyTool('str_replace_editor')).toBe('edit');
    expect(classifyTool('TodoWrite')).toBe('unknown');
  });

  it('classifies labeled sequences with full accuracy', () => {
    const cases: readonly { names: readonly string[]; expected: Stage }[] = [
      { names: ['read_file', 'search_files', 'list_dir'], expected: 'exploration' },
      { names: ['view_file', 'cat_file', 'head_file'], expected: 'exploration' },
      { names: ['write_file', 'edit_file', 'apply_patch'], expected: 'editing' },
      { names: ['str_replace_editor', 'apply_patch'], expected: 'editing' },
      { names: ['bash', 'test_runner'], expected: 'debugging' },
      { names: ['run_command', 'bash', 'run_tests'], expected: 'debugging' },
      { names: ['read_file', 'read_file', 'read_file', 'read_file', 'read_file'], expected: 'exploration' },
      { names: ['write_file', 'write_file', 'write_file', 'write_file', 'write_file'], expected: 'editing' },
    ];

    let correct = 0;
    for (const testCase of cases) {
      const actual = feed(testCase.names).getStage();
      if (actual === testCase.expected) correct += 1;
    }

    expect(correct).toBe(cases.length);
  });
});
