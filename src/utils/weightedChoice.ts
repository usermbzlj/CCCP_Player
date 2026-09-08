export function weightedChoice<T>(items: { item: T; weight: number }[]): T | undefined {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * total;
  for (const { item, weight } of items) {
    random -= weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1]?.item;
}
