console.log('[SERVICE] retrieval.service.ts loaded');

function flatten(value: unknown, path: string, output: string[]) {
  console.log('[SERVICE] flatten called with:', { typeofValue: typeof value, path, outputLength: output.length });
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const line = `[${path}]: ${String(value)}`;
    output.push(line);
    console.log('[SERVICE] flatten added line:', line);
    return;
  }
  if (Array.isArray(value)) {
    console.log('[SERVICE] flatten processing array of length:', value.length);
    value.forEach((child, index) => {
      console.log('[SERVICE] flatten processing array item', index);
      flatten(child, `${path}[${index + 1}]`, output);
    });
    return;
  }
  if (value && typeof value === 'object') {
    console.log('[SERVICE] flatten processing object with keys:', Object.keys(value as Record<string, unknown>));
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      console.log('[SERVICE] flatten processing object key:', key);
      flatten(child, `${path}.${key}`, output);
    }
  }
}

export function buildKnowledgeContext(chunks: Record<string, unknown> | null, rawKnowledge: string | null) {
  console.log('[SERVICE] buildKnowledgeContext called with:', {
    chunks: chunks ? 'object with keys: ' + Object.keys(chunks).join(', ') : 'null',
    rawKnowledgeLength: rawKnowledge?.length ?? 0
  });

  if (!chunks || !Object.keys(chunks).length) {
    const result = (rawKnowledge ?? '').slice(0, 18_000);
    console.log('[SERVICE] buildKnowledgeContext returning raw knowledge (truncated):', { length: result.length });
    return result;
  }

  console.log('[SERVICE] buildKnowledgeContext processing chunks object');
  const lines: string[] = [];
  flatten(chunks, 'knowledge', lines);
  const result = lines.join('\n').slice(0, 18_000);
  console.log('[SERVICE] buildKnowledgeContext flattened to', { linesCount: lines.length, resultLength: result.length });
  return result;
}
