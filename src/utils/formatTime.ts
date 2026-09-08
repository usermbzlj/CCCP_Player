export function formatCampaignTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const day = Math.floor(hours / 24) + 1;
  const hr = hours % 24;
  return `第${day}天 ${String(hr).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatDate1987(minutes: number): string {
  const base = new Date('1987-06-15T00:00:00Z');
  base.setMinutes(base.getMinutes() + minutes);
  return base.toISOString().slice(0, 16).replace('T', ' ');
}
