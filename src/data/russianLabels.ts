export const RUSSIAN_LABELS: Record<string, string> = {
  SECRET: 'СЕКРЕТНО',
  ATTENTION: 'ВНИМАНИЕ',
  ORDER: 'ПРИКАЗ',
  REFUSAL: 'ОТКАЗ',
  READY: 'ГОТОВНОСТЬ',
  NUCLEAR_PROTOCOL: 'ЯДЕРНЫЙ ПРОТОКОЛ',
  MAIN_COMPUTER: 'ГЛАВНЫЙ КОМПЬЮТЕР',
  STAVKA: 'СТАВКА',
  COMRADE: 'ТОВАРИЩ',
  OPERATOR: 'ОПЕРАТОР',
  SYSTEM: 'СИСТЕМА',
  ONLINE: 'В СЕТИ',
  OFFLINE: 'НЕ В СЕТИ',
  WARNING: 'ПРЕДУПРЕЖДЕНИЕ',
  CRITICAL: 'КРИТИЧЕСКИЙ',
  DEFCON: 'ГОТОВНОСТЬ',
};

export function getRussianLabel(key: string): string {
  return RUSSIAN_LABELS[key] || key;
}
