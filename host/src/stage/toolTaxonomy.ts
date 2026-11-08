export type ToolCategory = 'explore' | 'edit' | 'debug' | 'unknown';

const EXPLORE_TOKENS = new Set([
  'read',
  'view',
  'cat',
  'head',
  'tail',
  'grep',
  'search',
  'find',
  'glob',
  'ls',
  'list',
  'tree',
  'inspect',
  'stat',
  'open',
]);

const EDIT_TOKENS = new Set([
  'write',
  'edit',
  'patch',
  'apply',
  'create',
  'delete',
  'remove',
  'rename',
  'move',
  'insert',
  'append',
  'replace',
  'mkdir',
  'touch',
]);

const NEUTRAL_TOKENS = new Set(['todo', 'skill', 'agent', 'task']);

const DEBUG_TOKENS = new Set([
  'bash',
  'shell',
  'sh',
  'cmd',
  'powershell',
  'exec',
  'execute',
  'run',
  'test',
  'tests',
  'pytest',
  'jest',
  'vitest',
  'terminal',
  'console',
  'debug',
  'node',
  'python',
  'npm',
  'pnpm',
  'yarn',
]);

/**
 * Tool names arrive in several shapes (`read_file`, `mcp__fs__read_file`,
 * `str_replace_editor`). Lower-case, split on separators, and classify by
 * token so one taxonomy covers all of them.
 */
export function tokenizeToolName(toolName: string): string[] {
  return toolName
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

export function classifyTool(toolName: string): ToolCategory {
  const tokens = tokenizeToolName(toolName);
  if (tokens.length === 0) return 'unknown';

  // Bookkeeping tools (todo/agent/skill) look like writes but are not code
  // edits, so they stay neutral instead of distorting the window.
  if (tokens.some((token) => NEUTRAL_TOKENS.has(token))) return 'unknown';

  if (tokens.some((token) => DEBUG_TOKENS.has(token))) return 'debug';
  if (tokens.some((token) => EDIT_TOKENS.has(token))) return 'edit';
  if (tokens.some((token) => EXPLORE_TOKENS.has(token))) return 'explore';
  return 'unknown';
}
