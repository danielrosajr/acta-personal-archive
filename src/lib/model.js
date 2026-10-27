/** ACTA archive schema 3. Pure functions are shared by UI, import validation, and tests. */
export const SCHEMA = 3;
export const TYPES = ['people', 'acts', 'chapters', 'memories', 'events', 'missions'];
export const CATEGORIES = ['Família', 'Amizade', 'Relacionamento', 'Trabalho', 'Conhecido', 'Mentor', 'Inspiração', 'Pessoa histórica', 'Outro'];
export const RELATIONSHIPS = ['Presente na minha vida', 'Contato ocasional', 'Distante', 'Sem contato', 'Relação encerrada', 'Situação desconhecida'];
export const CERTAINTY = ['Acontecimento confirmado', 'Lembrança pessoal', 'Lembrança incompleta', 'Interpretação atual', 'Informação não confirmada'];
export const PHASE_STATUS = ['Planejado', 'Em andamento', 'Encerrado'];
export const MISSION_STATUS = ['Pendente', 'Em andamento', 'Pausada', 'Concluída', 'Cancelada'];
export const PRIORITY = ['Sem prioridade', 'Baixa', 'Média', 'Alta'];
export const CATEGORY_COLORS = { 'Família':'#507fcd','Amizade':'#3eaf82','Relacionamento':'#d678aa','Trabalho':'#d29b52','Conhecido':'#8a94a7','Mentor':'#9977d4','Inspiração':'#e1ba57','Pessoa histórica':'#61a7ae','Outro':'#99958e' };
export const ARCHETYPES = [
  {name:'Vlastnyys', description:'Manipuladores de energia'},
  {name:'Yotunt', description:'Fortalezas'},
  {name:'Kantionyys', description:'Emotivos'},
  {name:'Chiteyavs', description:'Sugadores de energia'},
  {name:'Tsuknyys', description:'Fortes'}
];
export const CHANGE_KINDS = ['Positivo','Negativo','Neutro','Reflexão'];
export const CONNECTION_KINDS = ['Amizade','Família','Relacionamento','Trabalho','Conhecidos','Mentoria','Conflito','Outros'];

export const now = () => new Date().toISOString();
export const uid = () => crypto.randomUUID();
const str = (value, max = 15000) => String(value ?? '').slice(0, max).trim();
const unique = (arr) => [...new Set(arr)];
const arrStr = (input, max = 150) => Array.isArray(input) ? unique(input.filter(x => typeof x === 'string').map(x => str(x, max)).filter(Boolean)) : [];
export const normalizeSearch = (input) => String(input ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const codeKey = (input) => str(input, 40).toUpperCase();
export const isValidCode = (input) => /^[\p{L}\p{N}][\p{L}\p{N}._-]{0,39}$/u.test(str(input));
export const emptyArchive = () => ({ schemaVersion: SCHEMA, createdAt: now(), updatedAt: now(), settings: { theme: 'dark', codePrefix: 'SCP', tutorialSeen: false, categoryColors: {...CATEGORY_COLORS}, birthdayDays: 30, archetypes: structuredClone(ARCHETYPES), perceptionTags: ['Pessoa de luz','Relação desgastante','Inspiração','Confiança','Conflito','Proteção','Distanciamento'] }, people: [], acts: [], chapters: [], memories: [], events: [], missions: [], connections: [], groups: [] });

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
export const decimalPercent = (value) => {
  if (value === '' || value == null) return null;
  const num = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(num) || num < 0 || num > 100 || Math.round(num*10)/10 !== num) throw new Error('As porcentagens devem estar entre 0 e 100, com até uma casa decimal.');
  return num;
};
export function normalizeBirthday(birth) {
  const value=str(birth, 10);
  if (!value) return '';
  const m = /^(?:(\d{4})-)?(\d{2})-(\d{2})$/.exec(value);
  if (!m) throw new Error('Data de aniversário inválida. Use AAAA-MM-DD ou MM-DD.');
  const [,year,month,day]=m;
  const nmonth=Number(month), nday=Number(day);
  const max=[31,(year && Number(year)%4===0 && (Number(year)%100!==0 || Number(year)%400===0)) || !year ? 29 : 28,31,30,31,30,31,31,30,31,30,31][nmonth-1];
  if (nmonth<1 || nmonth>12 || nday<1 || nday>max || (year && Number(year)<1000)) throw new Error('Data de aniversário impossível.');
  return value;
}
export function upcomingBirthdays(archive, today=new Date(), days=30) {
  const start=new Date(today.getFullYear(), today.getMonth(),today.getDate());
  const maxDays=Math.min(366,Math.max(0,Number(days)||0));
  return archive.people.flatMap(p=>{
    if(!p.birthDate) return [];
    const b=normalizeBirthday(p.birthDate);
    const month=Number(b.slice(-5,-3)), day=Number(b.slice(-2));
    let d=new Date(start.getFullYear(),month-1,day);
    // Date rolls Feb 29 to Mar 1 in non-leap years (documented rule).
    if(d<start) d=new Date(start.getFullYear()+1,month-1,day);
    const left=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/86400000);
    if(left>maxDays) return [];
    const year=b.length===10?Number(b.slice(0,4)):null;
    return [{person:p, days:left, nextDate:d.toISOString().slice(0,10), age:year?d.getFullYear()-year:null}];
  }).sort((a,b)=>a.days-b.days||a.person.codename.localeCompare(b.person.codename));
}
export const personColor = (archive,p) => p.colorMode==='category' && p.primaryCategory ? (archive.settings.categoryColors?.[p.primaryCategory]||CATEGORY_COLORS[p.primaryCategory]||p.color||'#b9a17a') : p.color||'#b9a17a';

/** Upgrades legacy data without discarding archival records or ID links. */
export function migrateArchive(input) {
  if (!input || typeof input !== 'object') throw new Error('Arquivo inexistente.');
  validateArchive(input);
  if (input.schemaVersion === SCHEMA) return structuredClone(input);
  const data = structuredClone(input);
  if (data.schemaVersion === 1) {
    data.settings={...data.settings,categoryColors:{...CATEGORY_COLORS},birthdayDays:30,archetypes:structuredClone(ARCHETYPES),perceptionTags:['Pessoa de luz','Relação desgastante','Inspiração','Confiança','Conflito','Proteção','Distanciamento']};
    data.people.forEach(p=>Object.assign(p, {birthDate:'',primaryCategory:p.categories?.[0]||'',colorMode:'custom',archetypes:[],perceptionTags:[],closenessSelf:null,closenessOther:null,relationshipHistory:[]}));
  }
  data.schemaVersion = SCHEMA;
  data.connections = [];
  data.groups = [];
  data.people.forEach(p=>(p.relationshipHistory||[]).forEach(h=>{if(!Array.isArray(h.revisions))h.revisions=[];}));
  validateArchive(data);
  return data;
}

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
    const categories=arrStr(input.categories,60);
    const primaryCategory=categories.includes(input.primaryCategory) ? input.primaryCategory : (categories[0]||'');
    const archetypes=arrStr(input.archetypes,80);
    const perceptionTags=arrStr(input.perceptionTags,80);
    const availableArchetypes=(archive.settings.archetypes||ARCHETYPES).map(a=>a.name);
    if(archetypes.some(a=>!availableArchetypes.includes(a))) throw new Error('Arquétipo desconhecido.');
    const colorMode=input.colorMode==='custom'?'custom':'category';
    record = { ...baseFields, code, codeHistory, codename, realName: str(input.realName, 160),
      aliases: old?.aliases || [], reflections: old?.reflections || [], categories,
      primaryCategory,colorMode, birthDate:normalizeBirthday(input.birthDate||''),
      archetypes, perceptionTags, relationshipHistory:old?.relationshipHistory || [],
      closenessSelf:old?.closenessSelf ?? null, closenessOther:old?.closenessOther ?? null,
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

export function addRelationshipEntry(archive, personId, input) {
  const p=archive.people.find(p=>p.id===personId);
  if(!p) throw new Error('Pessoa não encontrada.');
  const self=decimalPercent(input.self);
  const other=decimalPercent(input.other);
  const note=str(input.note,5000), kind=select(input.kind,CHANGE_KINDS,'Neutro');
  const recordDate=str(input.date,10);
  if(recordDate && !validISODate(recordDate))throw new Error('Data inválida: utilize uma data completa ou deixe em branco.');
  const previousSelf=p.closenessSelf ?? null, previousOther=p.closenessOther ?? null;
  if (self===previousSelf && other===previousOther && !note) throw new Error('Informe uma alteração de percentual ou um acontecimento.');
  const linkedMemoryId=input.memoryId?nullableId(archive,input.memoryId,'memories'):null;
  const linkedEventId=input.eventId?nullableId(archive,input.eventId,'events'):null;
  const record={id:uid(),createdAt:now(),date:recordDate,
    fromSelf:previousSelf,fromOther:previousOther,self,other,kind,note,memoryId:linkedMemoryId,eventId:linkedEventId,revisions:[]};
  p.relationshipHistory=[...(p.relationshipHistory||[]),record];
  p.closenessSelf=self;p.closenessOther=other;
  p.updatedAt=archive.updatedAt=now();
  return record;
}
// Undirected person-to-person ties. Never duplicate the same pair and kind.
export function saveConnection(archive, input, connectionId=null) {
  const left=String(input.personA||''),right=String(input.personB||'');
  if(!left||!right||left===right)throw new Error('Escolha duas pessoas diferentes.');
  if(!archive.people.some(p=>p.id===left)||!archive.people.some(p=>p.id===right))throw new Error('Pessoa relacionada não encontrada.');
  const kind=select(input.kind,CONNECTION_KINDS,'Outros');
  const old=connectionId?archive.connections.find(c=>c.id===connectionId):null;
  if(connectionId&&!old)throw new Error('Vínculo não encontrado.');
  if(archive.connections.some(c=>c.id!==connectionId&&c.kind===kind&&[c.personA,c.personB].includes(left)&&[c.personA,c.personB].includes(right)))throw new Error('Este tipo de vínculo já foi cadastrado para o par.');
  const record={...base(old),personA:left,personB:right,kind,note:str(input.note,3000),period:str(input.period,150)};
  if(old)archive.connections[archive.connections.indexOf(old)]=record;
  else archive.connections.push(record);
  archive.updatedAt=now();return record;
}
// Narrative circles/organizations, with a small append-only edit history.
export function saveGroup(archive,input,groupId=null) {
  const name=str(input.name,140);
  if(!name)throw new Error('Informe o nome do grupo ou organização.');
  const old=groupId?archive.groups.find(g=>g.id===groupId):null;
  if(groupId&&!old)throw new Error('Grupo não encontrado.');
  if(archive.groups.some(g=>g.id!==groupId&&normalizeSearch(g.name)===normalizeSearch(name)))throw new Error('Já existe um grupo com esse nome.');
  const memberIds=referenceIds(archive,input.memberIds,'people');
  const description=str(input.description,3500),period=str(input.period,160);
  const revisions=[...(old?.revisions||[])];
  if(old&&(old.name!==name||old.description!==description||old.period!==period||JSON.stringify(old.memberIds)!==JSON.stringify(memberIds))) {
    revisions.push({id:uid(),revisedAt:now(),previous:{name:old.name,description:old.description,period:old.period,memberIds:[...old.memberIds]}});
  }
  const record={...base(old),name,description,period,memberIds,revisions};
  if(old)archive.groups[archive.groups.indexOf(old)]=record;else archive.groups.push(record);
  archive.updatedAt=now();return record;
}
export function removeGroup(archive,id){
  if(!archive.groups.some(g=>g.id===id))throw new Error('Grupo não encontrado.');
  archive.groups=archive.groups.filter(g=>g.id!==id);
  archive.updatedAt=now();
}

export function removeConnection(archive,id){
  const old=archive.connections.find(c=>c.id===id);
  if(!old)throw new Error('Vínculo não encontrado.');
  archive.connections=archive.connections.filter(c=>c.id!==id);
  archive.updatedAt=now();
}
// Retain every old value and reason before editing the selected point.
export function correctRelationshipEntry(archive, personId, entryId, input) {
  const p=archive.people.find(x=>x.id===personId);
  if(!p)throw new Error('Pessoa não encontrada.');
  const idx=(p.relationshipHistory||[]).findIndex(h=>h.id===entryId);
  if(idx<0)throw new Error('Avaliação não encontrada.');
  const reason=str(input.reason,1500);
  if(!reason)throw new Error('Explique o motivo da correção para preservar o histórico.');
  const h=p.relationshipHistory[idx];
  const newDate=str(input.date,10);
  if(newDate && !validISODate(newDate))throw new Error('Informe uma data completa válida ou deixe em branco.');
  const self=decimalPercent(input.self),other=decimalPercent(input.other),note=str(input.note,5000);
  if(h.date===newDate && h.self===self && h.other===other && h.note===note)throw new Error('Não há alterações neste registro.');
  h.revisions=[...(h.revisions||[]),{id:uid(),revisedAt:now(),reason,previous:{date:h.date,self:h.self,other:h.other,note:h.note}}];
  Object.assign(h,{date:newDate,self,other,note});
  for(let i=idx+1;i<p.relationshipHistory.length;i++){
    p.relationshipHistory[i].fromSelf=p.relationshipHistory[i-1].self;
    p.relationshipHistory[i].fromOther=p.relationshipHistory[i-1].other;
  }
  const last=p.relationshipHistory.at(-1);
  p.closenessSelf=last.self;p.closenessOther=last.other;
  p.updatedAt=archive.updatedAt=now();return h;
}
export const validISODate = date => {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return false;
  const [y,m,d]=date.split('-').map(Number);
  const built=new Date(Date.UTC(y,m-1,d));
  return y>=1000&&built.getUTCFullYear()===y&&built.getUTCMonth()===m-1&&built.getUTCDate()===d;
};
// Return one point per recorded date; never interpolate missing estimates.
export function chartPoints(person) {
  return (person.relationshipHistory||[]).filter(h=>validISODate(h.date)).map((h,index)=>({
    id:h.id,date:h.date,self:h.self,other:h.other,note:h.note,kind:h.kind,index,
  })).sort((a,b)=>a.date.localeCompare(b.date)||a.index-b.index);
}
export function snapshotAt(person,date) {
  if(!validISODate(date))throw new Error('Selecione uma data válida para comparar.');
  return chartPoints(person).filter(h=>h.date<=date).at(-1)||null;
}
export function compareSnapshots(person,dateA,dateB) {
  const first=snapshotAt(person,dateA),second=snapshotAt(person,dateB);
  return {first,second,selfDelta:first?.self!=null&&second?.self!=null ? Math.round((second.self-first.self)*10)/10 : null,
    otherDelta:first?.other!=null&&second?.other!=null ? Math.round((second.other-first.other)*10)/10 : null};
}

export function removeRelationshipEntry(archive,personId,entryId) {
  const p=archive.people.find(p=>p.id===personId);
  if(!p)throw new Error('Pessoa não encontrada.');
  const history=p.relationshipHistory||[];
  const index=history.findIndex(r=>r.id===entryId);
  if(index<0)throw new Error('Registro histórico não encontrado.');
  if(index!==history.length-1)throw new Error('Exclua primeiro as alterações posteriores para não quebrar a sequência histórica.');
  p.relationshipHistory=history.filter(r=>r.id!==entryId);
  const last=p.relationshipHistory.at(-1);
  p.closenessSelf=last?.self ?? null;
  p.closenessOther=last?.other ?? null;
  p.updatedAt=archive.updatedAt=now();
}
export function saveCategoryColors(archive,values) {
  const colors={...CATEGORY_COLORS,...archive.settings.categoryColors};
  for(const [name,color] of Object.entries(values)) {
    if(!CATEGORIES.includes(name) || !/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error('Cor de categoria inválida.');
    colors[name]=color;
  }
  archive.settings.categoryColors=colors;
  archive.updatedAt=now();
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
  if (type === 'people') {
    for (const t of ['chapters','memories','events','missions']) archive[t].forEach(rec => rec.personIds = rec.personIds.filter(x => x !== id));
    archive.connections=archive.connections.filter(c=>c.personA!==id&&c.personB!==id);
    archive.groups.forEach(g=>g.memberIds=g.memberIds.filter(pid=>pid!==id));
  }
  if (type === 'chapters') {
    for (const t of ['memories', 'events','missions']) archive[t].forEach(rec => { if (rec.chapterId === id) rec.chapterId = null; });
    archive.people.forEach(p => p.aliases.forEach(a => { if (a.chapterId === id) a.chapterId = null; }));
  }
  if(type==='memories'||type==='events') archive.people.forEach(p=>(p.relationshipHistory||[]).forEach(e=>{if(type==='memories'&&e.memoryId===id)e.memoryId=null;if(type==='events'&&e.eventId===id)e.eventId=null;}));
  archive.updatedAt = now();
}

/** Reject corrupted, unsupported and inconsistent backups before replacement. */
export function validateArchive(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || ![1,2,SCHEMA].includes(data.schemaVersion)) throw new Error('Formato ou versão de arquivo incompatível (esperado schemaVersion: 1, 2 ou 3).');
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
  if(data.schemaVersion>=2){
    if(!data.settings.categoryColors || typeof data.settings.categoryColors!=='object' || !Array.isArray(data.settings.archetypes) || !Array.isArray(data.settings.perceptionTags)) throw new Error('Configurações do Codex v2 inválidas.');
    for(const color of Object.values(data.settings.categoryColors)) if(typeof color!=='string'||!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error('Cor de categoria inválida no backup.');
    for(const archetype of data.settings.archetypes) if(!archetype||typeof archetype.name!=='string'||!archetype.name.trim()||typeof archetype.description!=='string') throw new Error('Arquétipo inválido.');
  }
  if(data.schemaVersion===3){
    if(!Array.isArray(data.groups)||data.groups.length>25000)throw new Error('Coleção de grupos inválida.');
    const groupIds=new Set(),groupNames=new Set();
    for(const g of data.groups){
      if(!g||typeof g.id!=='string'||groupIds.has(g.id)||typeof g.name!=='string'||!g.name.trim()||
        groupNames.has(normalizeSearch(g.name))||typeof g.description!=='string'||typeof g.period!=='string'||
        !Array.isArray(g.memberIds)||g.memberIds.some(id=>!data.people.some(p=>p.id===id))||
        new Set(g.memberIds).size!==g.memberIds.length||!Array.isArray(g.revisions))throw new Error('Grupo narrativo inválido.');
      groupIds.add(g.id);groupNames.add(normalizeSearch(g.name));
    }
    if(!Array.isArray(data.connections)||data.connections.length>25000)throw new Error('Coleção de vínculos inválida.');
    const connIds=new Set(), pairs=new Set();
    for(const c of data.connections){
      if(!c||typeof c.id!=='string'||connIds.has(c.id)||c.personA===c.personB||
        !data.people.some(p=>p.id===c.personA)||!data.people.some(p=>p.id===c.personB)||
        !CONNECTION_KINDS.includes(c.kind)||typeof c.note!=='string'||typeof c.period!=='string')throw new Error('Vínculo de pessoas inválido.');
      connIds.add(c.id);
      const pair=[c.personA,c.personB].sort().join('~')+'~'+c.kind;
      if(pairs.has(pair))throw new Error('Vínculo de pessoas duplicado.');pairs.add(pair);
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
    if(data.schemaVersion>=2) {
      normalizeBirthday(person.birthDate||'');
      if(!Array.isArray(person.categories)||!Array.isArray(person.archetypes)||!Array.isArray(person.perceptionTags)||!Array.isArray(person.relationshipHistory))throw new Error('Classificações da pessoa inválidas.');
      if(person.primaryCategory && !person.categories.includes(person.primaryCategory))throw new Error('Vínculo principal inválido.');
      if(!['category','custom'].includes(person.colorMode))throw new Error('Modo de cor inválido.');
      for(const val of [person.closenessSelf,person.closenessOther])decimalPercent(val);
      let previousSelf=null,previousOther=null;
      const historyIds=new Set();
      for(const h of person.relationshipHistory){
        if(!h||typeof h.id!=='string'||historyIds.has(h.id)||!CHANGE_KINDS.includes(h.kind)||typeof h.note!=='string'||typeof h.date!=='string')throw new Error('Histórico de porcentagens inválido.');
        historyIds.add(h.id);
        for(const v of [h.fromSelf,h.fromOther,h.self,h.other])decimalPercent(v);
        if(h.fromSelf!==previousSelf || h.fromOther!==previousOther)throw new Error('Histórico de porcentagens inconsistente.');
        if(data.schemaVersion===3 && (!Array.isArray(h.revisions)||h.revisions.some(r=>!r||!r.id||!r.revisedAt||!r.reason||!r.previous||typeof r.previous.note!=='string')))throw new Error('Histórico de correções inválido.');
        if(h.memoryId && !data.memories.some(m=>m.id===h.memoryId))throw new Error('Histórico vinculado a memória inexistente.');
        if(h.eventId && !data.events.some(e=>e.id===h.eventId))throw new Error('Histórico vinculado a evento inexistente.');
        previousSelf=h.self;previousOther=h.other;
      }
      if(person.relationshipHistory.length&&(person.closenessSelf!==previousSelf||person.closenessOther!==previousOther))throw new Error('Porcentagens atuais divergentes do histórico.');
    }
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
  addRelationshipEntry(a,p1.id,{self:'62.5',other:'48',kind:'Positivo',note:'Uma ajuda em uma aventura fictícia.',date:'2025-05-01'});
  addRelationshipEntry(a,p1.id,{self:'55',other:'40',kind:'Neutro',note:'Os personagens seguiram rotas diferentes.',date:'2025-08-14'});
  return a;
}
