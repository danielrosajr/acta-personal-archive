/** ACTA archive schema 1. Pure functions are shared by UI, import validation, and tests. */
export const SCHEMA = 1;
export const TYPES = ['people', 'acts', 'chapters', 'memories', 'events', 'missions'];
export const CATEGORIES = ['Família', 'Amizade', 'Relacionamento', 'Trabalho', 'Conhecido', 'Mentor', 'Inspiração', 'Pessoa histórica', 'Outro'];
export const RELATIONSHIPS = ['Presente na minha vida', 'Contato ocasional', 'Distante', 'Sem contato', 'Relação encerrada', 'Situação desconhecida'];
export const CERTAINTY = ['Acontecimento confirmado', 'Lembrança pessoal', 'Lembrança incompleta', 'Interpretação atual', 'Informação não confirmada'];
export const PHASE_STATUS = ['Planejado', 'Em andamento', 'Encerrado'];
export const MISSION_STATUS = ['Pendente', 'Em andamento', 'Pausada', 'Concluída', 'Cancelada'];
export const PRIORITY = ['Sem prioridade', 'Baixa', 'Média', 'Alta'];
export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
const str = (value, max = 15000) => String(value ?? '').slice(0, max).trim();
const unique = (arr) => [...new Set(arr)];
const arrStr = (input, max = 150) => Array.isArray(input) ? unique(input.filter(x => typeof x === 'string').map(x => str(x, max)).filter(Boolean)) : [];
export const normalizeSearch = (input) => String(input ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const codeKey = (input) => str(input, 40).toUpperCase();
export const isValidCode = (input) => /^[\p{L}\p{N}][\p{L}\p{N}._-]{0,39}$/u.test(str(input));
export const emptyArchive = () => ({ schemaVersion: SCHEMA, createdAt: now(), updatedAt: now(), settings: { theme: 'dark', codePrefix: 'SCP', tutorialSeen: false }, people: [], acts: [], chapters: [], memories: [], events: [], missions: [] });

export function availableCode(archive, code, ignorePersonId = null) {
  const key = codeKey(code);
  return isValidCode(code) && !archive.people.some(p => p.id !== ignorePersonId && [p.code, ...(p.codeHistory || [])].some(c => codeKey(c) === key)) &&
    !archive.people.some(p => p.id === ignorePersonId && (p.codeHistory || []).some(c => codeKey(c) === key));
}
export function nextCode(archive, prefix = archive.settings.codePrefix || 'SCP') {
  prefix = str(prefix, 12).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'P';
  const codes = archive.people.flatMap(p => [p.code, ...(p.codeHistory || [])]);
  const used = new Set(codes.map(codeKey));
  const matching = codes.map(codeKey).map(c => c.startsWith(prefix + '-') ? c.slice(prefix.length + 1) : '').filter(c => /^\d+$/.test(c)).map(Number);
  let n = Math.max(0, ...matching) + 1;
  while (used.has(`${prefix}-${String(n).padStart(3, '0')}`)) n++;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}
const touch = (rec) => ({ ...rec, updatedAt: now() });
function referenceIds(archive, raw, type) {
  return arrStr(raw, 100).filter(id => archive[type].some(item => item.id === id));
}
const base = (old) => ({ id: old?.id || uid(), createdAt: old?.createdAt || now(), updatedAt: now() });
const select = (input, options, fallback) => options.includes(input) ? input : fallback;
const nullableId = (archive, id, collection) => archive[collection].some(x => x.id === id) ? id : null;

export function saveRecord(archive, type, input, currentId = null) {
  if (!TYPES.includes(type)) throw new Error('Tipo de registro desconhecido.');
  const index = currentId ? archive[type].findIndex(r => r.id === currentId) : -1;
  if (currentId && index < 0) throw new Error('Registro não encontrado.');
  const old = index >= 0 ? archive[type][index] : null;
  const baseFields = base(old);
  const title = str(input.title, 160);
  let record;
  if (type === 'people') {
    const codename = str(input.codename, 160);
    if (!codename) throw new Error('Informe o codinome principal.');
    const code = codeKey(input.code || old?.code || nextCode(archive));
    if (!isValidCode(code)) throw new Error('Código inválido: utilize letras, números, ponto, hífen ou sublinhado (até 40 caracteres).');
    if (code !== codeKey(old?.code) && !availableCode(archive, code, currentId)) throw new Error('Este código já foi usado por outra ficha ou é um código histórico reservado.');
    // Historical code aliases remain searchable and cannot be reused by another record.
    let codeHistory = arrStr(old?.codeHistory, 40);
    if (old && code !== codeKey(old.code)) codeHistory = unique([...codeHistory, old.code]);
    codeHistory = codeHistory.filter(c => codeKey(c) !== code);
    record = { ...baseFields, code, codeHistory, codename, realName: str(input.realName, 160),
      aliases: old?.aliases || [], reflections: old?.reflections || [], categories: arrStr(input.categories, 60),
      status: select(input.status, RELATIONSHIPS, RELATIONSHIPS.at(-1)),
      icon: str(input.icon, 12) || '◈', color: /^#[0-9a-fA-F]{6}$/.test(input.color) ? input.color : '#b9a17a',
      avatar: old?.avatar || '', met: str(input.met), role: str(input.role), perception: str(input.perception),
      importance: str(input.importance, 250), firstSeen: str(input.firstSeen, 100), lastSeen: str(input.lastSeen, 100),
      description: str(input.description), notes: str(input.notes) };
  } else if (type === 'acts') {
    if (!title) throw new Error('Informe o título do ato.');
    record = { ...baseFields, title, description: str(input.description), start: str(input.start, 100), end: str(input.end, 100),
      color: /^#[0-9a-fA-F]{6}$/.test(input.color) ? input.color : '#b9a17a', symbol: str(input.symbol, 12) || '◈',
      order: Number.isFinite(Number(input.order)) ? Number(input.order) : archive.acts.length + 1,
      status: select(input.status, PHASE_STATUS, 'Em andamento') };
  } else if (type === 'chapters') {
    if (!title) throw new Error('Informe o título do capítulo.');
    const actId = nullableId(archive, input.actId, 'acts');
    if (!actId) throw new Error('Escolha um ato existente.');
    record = { ...baseFields, actId, title, description: str(input.description), start: str(input.start, 100), end: str(input.end, 100),
      objective: str(input.objective), initial: str(input.initial), final: str(input.final), notes: str(input.notes),
      status: select(input.status, PHASE_STATUS, 'Em andamento'), personIds: referenceIds(archive, input.personIds, 'people') };
  } else if (type === 'memories') {
    if (!title) throw new Error('Informe o título da memória.');
    record = { ...baseFields, title, body: str(input.body, 100000), date: str(input.date, 100),
      certainty: select(input.certainty, CERTAINTY, 'Lembrança pessoal'), chapterId: nullableId(archive, input.chapterId, 'chapters'),
      personIds: referenceIds(archive, input.personIds, 'people'), tags: arrStr(input.tags, 80) };
  } else if (type === 'events') {
    if (!title) throw new Error('Informe o título do evento.');
    record = { ...baseFields, title, description: str(input.description), date: str(input.date, 100),
      chapterId: nullableId(archive, input.chapterId, 'chapters'), personIds: referenceIds(archive, input.personIds, 'people') };
  } else {
    if (!title) throw new Error('Informe o título da missão.');
    record = { ...baseFields, title, description: str(input.description), chapterId: nullableId(archive, input.chapterId, 'chapters'),
      personIds: referenceIds(archive, input.personIds, 'people'), status: select(input.status, MISSION_STATUS, 'Pendente'),
      priority: select(input.priority, PRIORITY, 'Sem prioridade'), due: str(input.due, 100), progress: str(input.progress) };
  }
  if (index < 0) archive[type].push(record);
  else archive[type][index] = record;
  archive.updatedAt = now();
  return record;
}

export function renameCodename(archive, personId, name, description = '', period = '', chapterId = null) {
  const p = archive.people.find(p => p.id === personId);
  if (!p) throw new Error('Pessoa não encontrada.');
  name = str(name, 160);
  if (!name) throw new Error('Digite um codinome.');
  if (normalizeSearch(name) !== normalizeSearch(p.codename)) {
    p.aliases.push({ id: uid(), name: p.codename, description: str(description, 1000) || 'Codinome principal anterior', period, chapterId: nullableId(archive, chapterId, 'chapters'), createdAt: now() });
    p.codename = name;
    p.updatedAt = archive.updatedAt = now();
  }
  return p;
}
export function addAlias(archive, personId, input) {
  const p = archive.people.find(p => p.id === personId);
  if (!p) throw new Error('Pessoa não encontrada.');
  const name = str(input.name, 160);
  if (!name) throw new Error('Informe o nome alternativo.');
  if (normalizeSearch(p.codename) === normalizeSearch(name) || p.aliases.some(a => normalizeSearch(a.name) === normalizeSearch(name))) throw new Error('Este codinome já está na ficha.');
  const alias = { id: uid(), name, description: str(input.description, 1000), period: str(input.period, 100), chapterId: nullableId(archive, input.chapterId, 'chapters'), createdAt: now() };
  p.aliases.push(alias); p.updatedAt = archive.updatedAt = now(); return alias;
}
export function addReflection(archive, personId, input) {
  const p = archive.people.find(p => p.id === personId);
  if (!p) throw new Error('Pessoa não encontrada.');
  const body = str(input.body);
  if (!body) throw new Error('Escreva uma reflexão.');
  const r = { id: uid(), body, date: str(input.date, 100), createdAt: now() };
  p.reflections.push(r); p.updatedAt = archive.updatedAt = now(); return r;
}
export function linkPersonChapter(archive, personId, chapterId, enabled) {
  const ch = archive.chapters.find(c => c.id === chapterId);
  if (!ch || !archive.people.some(p => p.id === personId)) throw new Error('Pessoa ou capítulo não encontrado.');
  ch.personIds = enabled ? unique([...ch.personIds, personId]) : ch.personIds.filter(id => id !== personId);
  ch.updatedAt = archive.updatedAt = now();
}
export function deleteRecord(archive, type, id) {
  if (!TYPES.includes(type)) throw new Error('Tipo desconhecido.');
  if (!archive[type].some(x => x.id === id)) throw new Error('Registro não encontrado.');
  if (type === 'acts' && archive.chapters.some(x => x.actId === id)) throw new Error('Este ato contém capítulos. Exclua ou mova os capítulos primeiro.');
  archive[type] = archive[type].filter(x => x.id !== id);
  if (type === 'people') for (const t of ['chapters','memories','events','missions']) archive[t].forEach(rec => rec.personIds = rec.personIds.filter(x => x !== id));
  if (type === 'chapters') {
    for (const t of ['memories', 'events','missions']) archive[t].forEach(rec => { if (rec.chapterId === id) rec.chapterId = null; });
    archive.people.forEach(p => p.aliases.forEach(a => { if (a.chapterId === id) a.chapterId = null; }));
  }
  archive.updatedAt = now();
}

/** Reject corrupted, unsupported and inconsistent backups before replacement. */
export function validateArchive(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.schemaVersion !== SCHEMA) throw new Error('Formato ou versão de arquivo incompatível (esperado schemaVersion: 1).');
  if (!data.settings || typeof data.settings !== 'object') throw new Error('Configurações ausentes.');
  for (const type of TYPES) {
    if (!Array.isArray(data[type]) || data[type].length > 25000) throw new Error(`Coleção inválida: ${type}.`);
    const ids = new Set();
    for (const entry of data[type]) {
      if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)) throw new Error(`Identificador inválido ou duplicado em ${type}.`);
      ids.add(entry.id);
      if (type === 'people' && (!isValidCode(entry.code) || typeof entry.codename !== 'string' || !entry.codename.trim() || !Array.isArray(entry.aliases) || !Array.isArray(entry.reflections) || !Array.isArray(entry.codeHistory))) throw new Error('Ficha de pessoa inválida.');
      if (type !== 'people' && (typeof entry.title !== 'string' || !entry.title.trim())) throw new Error(`Título inválido em ${type}.`);
    }
  }
  const ids = (t) => new Set(data[t].map(r => r.id));
  const p = ids('people'), a = ids('acts'), ch = ids('chapters');
  const codes = new Set();
  for (const person of data.people) {
    for (const code of [person.code, ...person.codeHistory]) {
      if (!isValidCode(code) || codes.has(codeKey(code))) throw new Error('Código duplicado/inválido no arquivo importado.');
      codes.add(codeKey(code));
    }
    if (person.avatar && (typeof person.avatar !== 'string' || person.avatar.length > 1300000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(person.avatar))) throw new Error('Avatar inválido: imagens remotas não são permitidas.');
    for (const alias of person.aliases) if (!alias || typeof alias.name !== 'string' || !alias.name.trim() || (alias.chapterId && !ch.has(alias.chapterId))) throw new Error('Codinome histórico inválido.');
    for (const refl of person.reflections) if (!refl || typeof refl.body !== 'string') throw new Error('Reflexão inválida.');
  }
  const checkPeople = (item) => { if (!Array.isArray(item.personIds) || item.personIds.some(id => !p.has(id))) throw new Error('Relacionamento com pessoa inexistente.'); };
  data.chapters.forEach(c => { if (!a.has(c.actId)) throw new Error('Capítulo aponta para ato inexistente.'); checkPeople(c); });
  for (const t of ['memories','events','missions']) data[t].forEach(x => { checkPeople(x); if (x.chapterId && !ch.has(x.chapterId)) throw new Error(`${t}: capítulo inexistente.`); });
  return true;
}

export function makeFictionalDemo() {
  const a = emptyArchive();
  const act = saveRecord(a, 'acts', { title: 'Ato I — As primeiras rotas', description: 'Uma fase inteiramente fictícia para explorar o ACTA.', start: 'Ano 1', symbol: '✧', status: 'Em andamento', order: 1 });
  const p1 = saveRecord(a, 'people', { code: 'ARK-001', codename: 'A Cartógrafa', icon: '✦', color: '#c4a475', categories: ['Amizade'], status: 'Contato ocasional', met: 'Uma biblioteca imaginária.', description: 'Uma personagem fictícia que coleciona mapas e perguntas.' });
  const p2 = saveRecord(a, 'people', { code: 'ARK-002', codename: 'O Faroleiro', icon: '✷', color: '#6aafad', categories: ['Mentor'], status: 'Distante', description: 'Um personagem fictício conhecido por histórias sobre o mar.' });
  const chapter = saveRecord(a, 'chapters', { actId: act.id, title: 'Capítulo 01 — O mapa esquecido', description: 'Um capítulo criado exclusivamente para demonstrar o aplicativo.', personIds: [p1.id, p2.id], status: 'Em andamento', start: 'Época indeterminada' });
  saveRecord(a, 'memories', { title: 'A bússola de papel', body: 'Naquela tarde fictícia, a Cartógrafa encontrou uma bússola desenhada numa página.', date: 'Data incerta', certainty: 'Lembrança pessoal', personIds: [p1.id], chapterId: chapter.id, tags: ['descoberta'] });
  saveRecord(a, 'events', { title: 'Encontro na biblioteca', description: 'Um acontecimento fictício.', chapterId: chapter.id, personIds: [p1.id, p2.id] });
  saveRecord(a, 'missions', { title: 'Decifrar o mapa', description: 'Uma missão fictícia.', chapterId: chapter.id, personIds: [p1.id], status: 'Em andamento', priority: 'Baixa' });
  addAlias(a, p1.id, { name: 'Guardadora do Norte', description: 'Apelido fictício' });
  addReflection(a, p1.id, { date: 'Ano 2', body: 'Aos poucos, passei a admirar sua curiosidade. Reflexão fictícia.' });
  return a;
}
