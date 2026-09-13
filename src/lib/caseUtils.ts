/**
 * JeevRakshak AI - Case Management Utilities
 * Requirement: Case numbers across the entire document restart from 1 everyday.
 */

export interface CaseLike {
  id: string;
  reported_at?: string;
  created_at?: string;
  [key: string]: any;
}

/**
 * Returns the sequential index (1, 2, 3...) of a case within its calendar day.
 * Cases on the same calendar day (YYYY-MM-DD) are sorted chronologically and numbered starting from 1.
 */
export function getDailyCaseNumber(
  target: string | CaseLike,
  allCases: CaseLike[] = []
): number {
  const targetId = typeof target === 'string' ? target : target.id;
  const targetItem =
    allCases.find((c) => c.id === targetId) ||
    (typeof target === 'object' ? target : null);

  if (!targetItem) return 1;

  const rawDate = targetItem.reported_at || targetItem.created_at || new Date().toISOString();
  const targetDateStr = rawDate.slice(0, 10);

  // Filter all cases on the same calendar date
  const sameDayCases = allCases
    .filter((c) => {
      const d = (c.reported_at || c.created_at || '').slice(0, 10);
      return d === targetDateStr;
    })
    .sort((a, b) => {
      const timeA = new Date(a.reported_at || a.created_at || 0).getTime();
      const timeB = new Date(b.reported_at || b.created_at || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return String(a.id).localeCompare(String(b.id));
    });

  const idx = sameDayCases.findIndex((c) => c.id === targetId);
  return idx >= 0 ? idx + 1 : 1;
}

/**
 * Formats a localized case title restarting from 1 everyday.
 * Example: "Case #1", "केस #१", "केस #1"
 */
export function formatDailyCaseNumber(
  target: string | CaseLike,
  allCases: CaseLike[] = [],
  lang: string = 'en'
): string {
  const num = getDailyCaseNumber(target, allCases);
  const prefix = lang === 'mr' ? 'केस' : lang === 'hi' ? 'केस' : 'Case';
  return `${prefix} #${num}`;
}
