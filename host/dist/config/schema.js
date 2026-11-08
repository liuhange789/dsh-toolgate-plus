import Schema from '@deepseek-ai/schemastery';
export const configSchema = Schema.object({
    autoCollapse: Schema.boolean().default(true),
    sensitivity: Schema.union([
        Schema.const('loose'),
        Schema.const('standard'),
        Schema.const('aggressive'),
    ]).default('standard'),
});
//# sourceMappingURL=schema.js.map