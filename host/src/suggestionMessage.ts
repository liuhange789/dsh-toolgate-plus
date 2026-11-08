import type { DshUserMessage } from './types/dshContext.ts';

let messageSeq = 0;

export function createSuggestionMessage(text: string): DshUserMessage {
  messageSeq += 1;
  return {
    id: `toolgate-plus-${Date.now().toString(36)}-${messageSeq.toString(36)}`,
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'plugin', plugin: 'dsh-toolgate-plus' },
  };
}
