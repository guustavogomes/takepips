/**
 * Converte string de data do formato MT5 para Date
 * Formato esperado: "YYYY.MM.DD HH:MM:SS"
 * Exemplo: "2025.10.31 22:40:02"
 */
export function parseMT5DateTime(dateTimeString: string): Date {
  // Formato: "2025.10.31 22:40:02"
  const [datePart, timePart] = dateTimeString.split(' ');
  
  if (!datePart || !timePart) {
    throw new Error(`Formato de data inválido: ${dateTimeString}. Esperado: "YYYY.MM.DD HH:MM:SS"`);
  }

  const [year, month, day] = datePart.split('.').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  if (!year || !month || !day || hour === undefined || minute === undefined || second === undefined) {
    throw new Error(`Formato de data inválido: ${dateTimeString}`);
  }

  // month - 1 porque Date usa meses de 0-11
  return new Date(year, month - 1, day, hour, minute, second);
}

