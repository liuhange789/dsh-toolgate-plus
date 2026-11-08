export type ToolCategory = 'explore' | 'edit' | 'debug' | 'unknown';
/**
 * Tool names arrive in several shapes (`read_file`, `mcp__fs__read_file`,
 * `str_replace_editor`). Lower-case, split on separators, and classify by
 * token so one taxonomy covers all of them.
 */
export declare function tokenizeToolName(toolName: string): string[];
export declare function classifyTool(toolName: string): ToolCategory;
//# sourceMappingURL=toolTaxonomy.d.ts.map