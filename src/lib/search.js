import { normalizeSearch, TYPES } from './model.js';
const content = (item, type) => {
  if (type === 'people') return [item.code, ...(item.codeHistory || []), item.codename, item.realName, item.met, item.role, item.perception, item.description, item.notes, ...(item.aliases || []).flatMap(a => [a.name, a.description]), ...(item.reflections || []).map(r => r.body), ...(item.categories || [])];
  if (type === 'memories') return [item.title, item.body, item.date, item.certainty, ...(item.tags || [])];
  return [item.title, item.description, item.body, item.notes, item.objective, item.initial, item.final, item.progress];
};
export function searchArchive(data, query, typeFilter = 'all') {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const results = [];
  for (const type of TYPES) {
    if (typeFilter !== 'all' && type !== typeFilter) continue;
    for (const item of data[type]) {
      const hay = normalizeSearch(content(item, type).filter(Boolean).join(' '));
      if (!tokens.every(token => hay.includes(token))) continue;
      let score = type === 'people' ? 5 : 1;
      if (type === 'people' && normalizeSearch(item.code) === normalizeSearch(query)) score += 100;
      if (type === 'people' && (item.codeHistory || []).some(c => normalizeSearch(c) === normalizeSearch(query))) score += 90;
      if (normalizeSearch(item.codename || item.title).includes(normalizeSearch(query))) score += 30;
      results.push({ type, item, score });
    }
  }
  return results.sort((a,b) => b.score - a.score || String(b.item.updatedAt).localeCompare(String(a.item.updatedAt)));
}
