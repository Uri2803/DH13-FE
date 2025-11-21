export const toStr = (v: unknown): string => {
  if (v === null || v === undefined) return '';
  return String(v).trim();
};

export const parseBoolPartyMember = (x: unknown): 0 | 1 => {
  const s = toStr(x).trim().toLowerCase();
  if (!s) return 0;

  if (s === 'x') return 1;
  if (['co', 'có', 'yes', '1', 'true'].includes(s)) return 1;

  return 0;
};

 export const safeFloat = (x: unknown): number | undefined => {
  const s = toStr(x).replace(',', '.');
  if (!s) return undefined;
  const n = Number(s);
  if (Number.isNaN(n)) return undefined;
  return n;
};



