export const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const DAYS_FULL = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTHS_FULL = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
];

export type DateItem = {
  dayName: string;
  date: number;
  month: string;
  full: Date;
  available: boolean;
};

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isClosedToday(date: Date): boolean {
  return isSameDay(date, new Date()) && new Date().getHours() >= 18;
}

export function formatDateLabel(date: Date): string {
  return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

export function generateDates(remoteDates?: DateItem[]): DateItem[] {
  if (remoteDates) return remoteDates;
  const now = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      dayName: DAYS_SHORT[d.getDay()],
      date: d.getDate(),
      month: MONTHS_SHORT[d.getMonth()],
      full: d,
      available: i > 0 || now.getHours() < 18,
    };
  });
}
