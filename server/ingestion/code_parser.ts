export interface ParsedCodeEntity {
  type: 'Class' | 'Function' | 'Configuration' | 'File';
  name: string;
  label: string;
  filePath: string;
  description: string;
  lineStart?: number;
  lineEnd?: number;
}

export function parseCodeEntities(filePath: string, content: string): ParsedCodeEntity[] {
  const entities: ParsedCodeEntity[] = [];

  // Always register the file itself
  entities.push({
    type: 'File',
    name: filePath,
    label: filePath.split('/').pop() || filePath,
    filePath,
    description: `Source file: ${filePath} (${content.split('\n').length} lines)`
  });

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Function / Method detection
    const fnMatch =
      trimmed.match(/(?:def|function|async function|const|let|var)\s+([a-zA-Z0-9_]+)\s*\(/) ||
      trimmed.match(/([a-zA-Z0-9_]+)\s*:\s*function/);
    if (fnMatch && !['if', 'for', 'while', 'switch', 'catch'].includes(fnMatch[1])) {
      entities.push({
        type: 'Function',
        name: fnMatch[1],
        label: `${fnMatch[1]}()`,
        filePath,
        description: `Function/Method ${fnMatch[1]} in ${filePath}`,
        lineStart: index + 1
      });
    }

    // 2. Class / Interface detection
    const classMatch = trimmed.match(/(?:class|interface|struct)\s+([a-zA-Z0-9_]+)/);
    if (classMatch) {
      entities.push({
        type: 'Class',
        name: classMatch[1],
        label: classMatch[1],
        filePath,
        description: `Class/Interface ${classMatch[1]} defined in ${filePath}`,
        lineStart: index + 1
      });
    }

    // 3. Configuration Constant detection (e.g. MAX_RETRIES, PORT, DB_URL, TIMEOUT)
    const configMatch = trimmed.match(/([A-Z0-9_]{3,30})\s*[:=]\s*(.+)/);
    if (configMatch && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
      const keyName = configMatch[1];
      const value = configMatch[2].replace(/[;,]$/, '').trim();
      entities.push({
        type: 'Configuration',
        name: keyName,
        label: `${keyName} = ${value}`,
        filePath,
        description: `Configuration key ${keyName} set to ${value} in ${filePath}`,
        lineStart: index + 1
      });
    }
  });

  return entities;
}
