/**
 * Gera um UUID v4
 * Compatível com Node.js 18+ e ambientes que não têm crypto.randomUUID
 */
export function generateUUID(): string {
  // Usar crypto.randomUUID se disponível (Node.js 18+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: gerar UUID manualmente
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

