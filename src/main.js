import { emptyArchive, validateArchive, saveRecord, deleteRecord, addAlias, addReflection, renameCodename, linkPersonChapter, nextCode, makeFictionalDemo, migrateArchive, addRelationshipEntry, removeRelationshipEntry, saveConnection, removeConnection, saveGroup, removeGroup, correctRelationshipEntry, chartPoints, compareSnapshots, CONNECTION_KINDS, upcomingBirthdays, personColor, saveCategoryColors, CATEGORIES, ARCHETYPES, CATEGORY_COLORS, RELATIONSHIPS, CERTAINTY, PHASE_STATUS, MISSION_STATUS, PRIORITY, TYPES, normalizeSearch } from './lib/model.js';
import { searchArchive } from './lib/search.js';
import { openStorage, loadArchive, writeArchive } from './lib/storage.js';
import { encryptedBackup, plainBackup, parseBackup } from './lib/backup.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const attr = esc;
const slug = (x) => encodeURIComponent(x);
const byId = (collection, id) => data[collection].find(item => item.id === id);
const birthdayText = (b) => !b?'Não informado':(b.length===10?`${b.slice(8,10)}/${b.slice(5,7)}/${b.slice(0,4)}`:`${b.slice(3,5)}/${b.slice(0,2)} (ano não informado)`);
const percentText = v => v == null ? '—' : `${Number(v).toFixed(1).replace('.',',')}%`;
const deltaText = (a,b) => a==null||b==null?'':`${a>b?'+':''}${(a-b).toFixed(1).replace('.',',')} p.p.`;
const fmtDate = (iso) => iso ? new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(iso)) : '—';
const intro = (text, max=126) => text?.length > max ? `${text.slice(0,max).trim()}…` : (text || 'Sem descrição registrada.');
const viewName = { people: 'Pessoas', acts: 'Atos', chapters: 'Capítulos', memories: 'Memórias', events: 'Eventos', missions: 'Missões' };
const viewSingle = { people: 'Pessoa', acts: 'Ato', chapters: 'Capítulo', memories: 'Memória', events: 'Evento', missions: 'Missão' };
const iconPath = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
  people:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  layers:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  flag:'<path d="M4 22V4m0 1c5-3 9 3 16 0v12c-7 3-11-3-16 0"/>',
  archive:'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8m-9 4h4"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.88 1.88-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21h-2.66v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06-1.88-1.88.06-.06A1.65 1.65 0 0 0 7 16.03a1.65 1.65 0 0 0-1.51-1H5.4v-2.66h.09A1.65 1.65 0 0 0 7 11.37a1.65 1.65 0 0 0-.33-1.82L6.61 9.5l1.88-1.88.06.06A1.65 1.65 0 0 0 10.37 8a1.65 1.65 0 0 0 1-1.51V6.4h2.66v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06 1.88 1.88-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1h.09v2.66h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', edit:'<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', back:'<path d="m14 18-6-6 6-6"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>', trash:'<path d="M3 6h18m-2 0-.9 15H5.9L5 6m3 0V4h8v2M10 10v7m4-7v7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  moon:'<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5z"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
  warning:'<path d="m12 3 10 18H2L12 3zm0 7v4m0 4h.01"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  link:'<path d="m10 13 4-4m-6 8H7a4 4 0 0 1 0-8h3m4-2h3a4 4 0 0 1 0 8h-3"/>',
  sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>'
};
const I = (name, size = 18) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPath[name] || iconPath.sparkle}</svg>`;
const button = (label, action, extra='', cls='btn btn-primary') => `<button type="button" class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const nav = (url, label, cls='') => `<a class="${cls}" href="#/${url}">${label}</a>`;
const tag = (text, cls='') => `<span class="tag ${cls}">${esc(text)}</span>`;
const chip = (text) => `<span class="muted-pill">${esc(text)}</span>`;
const blank = (symbol, title, description, label, action) => `<div class="empty"><div class="empty-glyph">${symbol}</div><h3>${esc(title)}</h3><p>${esc(description)}</p>${action ? button(`${I('plus',16)} ${label}`,action) : ''}</div>`;
const personAvatar = (p, size='md') => p.avatar ? `<img class="person-avatar ${size}" src="${attr(p.avatar)}" alt="" loading="lazy" />` : `<div class="person-avatar ${size}" style="--person-color:${attr(personColor(data,p))}">${esc(p.icon || p.codename?.[0] || '◈')}</div>`;
const personLink = (p, cls='') => `<a class="person-inline ${cls}" href="#/person/${slug(p.id)}">${personAvatar(p,'xs')} <span>${esc(p.codename)}</span></a>`;
const personPills = (ids) => ids?.map(id => byId('people', id)).filter(Boolean).map(p=>personLink(p)).join('') || '<span class="subtle">Nenhuma pessoa vinculada</span>';
const brief = (text) => `<p class="secondary">${esc(intro(text))}</p>`;
let data = emptyArchive();
let db = null;
let persisted = true;
let saveTimer = null;
let saveChain = Promise.resolve();
const ui = { modal: null, mobileNav: false, tourStep: -1, searchFilter: 'all', searchText:'', codexFilter:'all', archetypeFilter:'all', tagFilter:'all', statusFilter:'all', actFilter:'all', tagQuery:'', graphStart:'', graphEnd:'', personGraphRange:{}, codexText:'', rankSort:'self', graphMetric:'self', comparisonFrom:'',comparisonTo:'', personCompare:{}, saveStatus:'local' };
const app = $('#app');

function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const path = raw.split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
  return { section: path[0] || 'dashboard', id: path[1], query: new URLSearchParams(raw.split('?')[1] || '').get('q') || '' };
}
function go(path) { const hash=`#/${path}`; if(location.hash === hash) render(); else location.hash=hash; }
function activeStatus(rec) { return rec.status === 'Em andamento' ? 'ongoing' : rec.status === 'Encerrado' || rec.status === 'Concluída' ? 'complete' : ''; }
const count = (type) => data[type].length;
const sortedActs = () => [...data.acts].sort((a,b)=> a.order - b.order || a.createdAt.localeCompare(b.createdAt));
const orderedChapters = (actId) => data.chapters.filter(c=>c.actId===actId).sort((a,b)=>(a.start || '').localeCompare(b.start || '') || a.createdAt.localeCompare(b.createdAt));
const currentAct = () => sortedActs().find(a=>a.status==='Em andamento') || sortedActs().at(-1);
const latestChapter = () => { const a=currentAct(); return a && orderedChapters(a.id).find(c=>c.status==='Em andamento') || (a && orderedChapters(a.id).at(-1)); };
const recent = (type,n=3) => [...data[type]].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,n);
function logo() { return `<div class="brand-mark"><span>◈</span></div><div class="brand-text"><strong>ACTA<span class="brand-dot">.</span></strong><small>ARQUIVO NARRATIVO</small></div>`; }
function sidebar(current) {
  const groups=[{ title:'ARQUIVO', items:[['dashboard','home','Visão geral'],['codex','people','ACTA Codex'],['ranking','sparkle','Lista de porcentagens'],['timeline','layers','Atos & capítulos'],['memories','book','Memórias']] }, {title:'JORNADA',items:[['events','calendar','Eventos'],['missions','flag','Missões'],['search','search','Pesquisa global']]}, {title:'SISTEMA',items:[['settings','gear','Configurações']] }];
  return `<aside class="sidebar ${ui.mobileNav?'is-open':''}" aria-label="Navegação principal"><a class="brand" href="#/dashboard">${logo()}</a><div class="side-ornament"><span>ARQUIVO Nº 001</span><span>✦</span></div><nav>${groups.map(g=>`<div class="nav-group"><div class="nav-heading">${g.title}</div>${g.items.map(([path,ico,label])=>`<a href="#/${path}" class="nav-item ${current===path?'active':''}">${I(ico,18)}<span>${label}</span>${path==='codex'?`<em>${count('people')}</em>`:''}</a>`).join('')}</div>`).join('')}</nav><div class="sidebar-bottom"><div class="privacy-seal">${I('lock',15)}<span>Arquivo apenas neste dispositivo</span></div><div class="sidebar-caption">v0.3.0-alpha <span>·</span> CONNECTIONS & TIME</div></div></aside>`;
}
function shell(title, sub, content, opts={}) {
  const r=route();
  let left=r.section;
  if(r.section==='person') left='codex';
  if(r.section==='act'||r.section==='chapter') left='timeline';
  const current = opts.nav || left;
  return `<div class="layout" id="layout">${sidebar(current)}<div class="mobile-screen" data-action="close-nav"></div><div class="main-shell"><header class="topbar"><div class="topbar-left"><button type="button" class="icon-btn mobile-menu" data-action="mobile-menu" aria-label="Abrir menu">${I('menu')}</button><span class="breadcrumb">ARQUIVO / ${esc(opts.breadcrumb || title)}</span><span class="topbar-divider"></span><span class="local-indicator"><span class="status-dot"></span> LOCAL-FIRST</span></div><div class="topbar-actions"><button type="button" class="icon-btn tour-access" data-action="start-tour" aria-label="Abrir tutorial guiado" title="Tutorial guiado">${I('book',18)}</button><button type="button" class="top-search" data-action="quick-search">${I('search',17)} <span>Pesquisar no arquivo</span><kbd>Ctrl K</kbd></button><button type="button" class="icon-btn" data-action="toggle-theme" aria-label="Alternar tema">${I(data.settings.theme==='dark'?'sun':'moon')}</button></div></header><main class="main-content"><div class="page-head"><div><div class="eyebrow">${esc(sub || 'ARQUIVO PESSOAL')} <span class="eyebrow-line"></span></div><h1>${esc(title)}</h1></div>${opts.actions||''}</div>${content}</main><footer class="main-footer"><span>ACTA <span class="gold">◈</span> A história pertence a quem a viveu.</span><span class="footer-status" id="save-status">${persisted?'SALVO LOCALMENTE':'MODO TEMPORÁRIO — EXPORTE SEUS REGISTROS'}</span></footer></div></div>${ui.modal?renderModal():''}<div id="toast-region" role="status" aria-live="polite"></div>`;
}
function stat(label, value, icon, detail) { return `<div class="stat-card"><div class="stat-top"><span>${esc(label)}</span><span class="stat-icon">${I(icon,18)}</span></div><strong>${value}</strong><small>${esc(detail)}</small></div>`; }
function dashboard() {
  const act=currentAct(), chapter=latestChapter();
  const missionActive=data.missions.filter(m=>['Em andamento','Pendente'].includes(m.status));
  const upcoming=upcomingBirthdays(data,new Date(),data.settings.birthdayDays ?? 30);
  const hero = `<section class="hero-panel"><div class="hero-decoration"><span class="orb orb1"></span><span class="orb orb2"></span><span class="orb orb3"></span></div><div class="hero-copy"><div class="hero-kicker">✧ &nbsp; SEU UNIVERSO, SEU REGISTRO</div><h2>Uma vida.<br/><em>Mil histórias.</em></h2><p>Organize aquilo que viveu em atos, capítulos, memórias e pessoas que marcaram sua trajetória. O arquivo é seu — e só seu.</p><div class="hero-actions">${button(`${I('plus',17)} Nova pessoa`,'new','data-type="people"')}${nav('timeline',`${I('layers',17)} Explorar capítulos`,'btn btn-ghost-light')}</div></div><div class="hero-seal"><div class="seal-outer"><div class="seal-inner">◈</div><span>ACTA ARCHIVE</span></div></div></section>`;
  const metrics=`<div class="stat-grid">${stat('PESSOAS NO CODEX',count('people'),'people','Identidades registradas')}${stat('ATOS & CAPÍTULOS',`${count('acts')} / ${count('chapters')}`,'layers','Sua história em fases')}${stat('MEMÓRIAS ARQUIVADAS',count('memories'),'book','Fragmentos preservados')}${stat('MISSÕES ATIVAS',missionActive.length,'flag','Objetivos em aberto')}</div>`;
  const phase=`<section class="panel current-panel" id="tour-acts"><div class="section-head"><h3>${I('compass',20)} Capítulo atual</h3>${nav('timeline','Ver narrativa '+I('arrow',15),'text-link')}</div>${act ? `<div class="phase-row"><div class="phase-marker">${esc(act.symbol)}</div><div><div class="label-overline">${esc(act.title)}</div><h4>${chapter?`<a href="#/chapter/${slug(chapter.id)}">${esc(chapter.title)}</a>`:'Aguardando primeiro capítulo'}</h4><p>${esc(intro(chapter?.description || act.description,150))}</p></div>${chapter?tag(chapter.status,activeStatus(chapter)):''}</div>` : blank('◇','Sua história começa aqui','Crie seu primeiro ato para organizar uma fase da sua vida.','Criar primeiro ato','new" data-type="acts')} </section>`;
  const missionList=`<section class="panel"><div class="section-head"><h3>${I('flag',20)} Missões em andamento</h3>${nav('missions','Todas '+I('arrow',15),'text-link')}</div>${missionActive.length ? missionActive.slice(0,4).map(m=>`<a class="list-entry" href="#/missions"><span class="list-symbol">✦</span><div><strong>${esc(m.title)}</strong><small>${esc(m.priority)}</small></div>${tag(m.status,activeStatus(m))}</a>`).join('') : `<p class="panel-empty">Nenhuma missão ativa. Seus objetivos podem ser adicionados quando fizer sentido.</p>`}</section>`;
  const memoryList=`<section class="panel"><div class="section-head"><h3>${I('book',20)} Memórias recentes</h3>${nav('memories','Arquivo '+I('arrow',15),'text-link')}</div>${recent('memories',3).length?recent('memories',3).map(m=>`<div class="list-entry"><span class="list-symbol">⌑</span><div><strong>${esc(m.title)}</strong><small>${esc(m.date || fmtDate(m.createdAt))} · ${esc(m.certainty)}</small></div>${button(I('arrow',16),'edit',`data-type="memories" data-id="${attr(m.id)}"`,'icon-btn')}</div>`).join(''):'<p class="panel-empty">Suas lembranças aparecerão aqui, sem exigir datas exatas.</p>'}</section>`;
  const peopleList=`<section class="panel"><div class="section-head"><h3>${I('people',20)} Registrados recentemente</h3>${nav('codex','Abrir Codex '+I('arrow',15),'text-link')}</div>${recent('people',4).length?recent('people',4).map(p=>`<a class="list-entry" href="#/person/${slug(p.id)}">${personAvatar(p,'sm')}<div><strong>${esc(p.codename)}</strong><small class="mono">${esc(p.code)}</small></div>${I('arrow',17)}</a>`).join(''):'<p class="panel-empty">O Codex ainda está vazio. Adicione a primeira pessoa à sua história.</p>'}</section>`;
  const birthdaysPanel=`<section class="panel" id="tour-birthday"><div class="section-head"><h3>${I('calendar',20)} Próximos aniversários</h3>${nav('codex','Consultar pessoas '+I('arrow',15),'text-link')}</div>${upcoming.length?upcoming.slice(0,6).map(b=>`<a href="#/person/${slug(b.person.id)}" class="list-entry">${personAvatar(b.person,'sm')}<div><strong>${esc(b.person.codename)}</strong><small>${birthdayText(b.person.birthDate)} ${b.age ? `· vai completar ${b.age} anos`:''}</small></div>${tag(b.days===0?'Hoje!':b.days===1?'Amanhã':`Em ${b.days} dias`)}</a>`).join(''):'<p class="panel-empty">Nenhum aniversário nos próximos '+Number(data.settings.birthdayDays??30)+' dias. Adicione dia e mês nas fichas do Codex.</p>'}<small class="hint">Avisos exibidos ao abrir o ACTA; não são notificações com o site fechado.</small></section>`;
  const rankingPanel=`<section class="panel" id="tour-ranking-dashboard"><div class="section-head"><h3>${I('sparkle',20)} Lista de porcentagens</h3>${nav('ranking','Ver ranking '+I('arrow',15),'text-link')}</div>${data.people.filter(p=>p.closenessSelf!==null).length?data.people.filter(p=>p.closenessSelf!==null).sort((a,b)=>b.closenessSelf-a.closenessSelf).slice(0,4).map((p,i)=>`<a class="list-entry" href="#/person/${slug(p.id)}"><span class="list-symbol">${i+1}º</span><div><strong>${esc(p.codename)}</strong><small>${esc(p.code)}</small></div><strong>${percentText(p.closenessSelf)}</strong></a>`).join(''):'<p class="panel-empty">Registre estimativas de proximidade nas fichas para acompanhar sua evolução.</p>'}</section>`;
  return shell('Visão geral','BEM-VINDO AO SEU ARQUIVO',hero+metrics+`<div class="dashboard-grid"><div>${phase}${memoryList}</div><div>${missionList}${birthdaysPanel}${rankingPanel}${peopleList}</div></div><div class="bottom-note">${I('lock',17)} Todos os registros ficam neste navegador. Faça backups frequentes em Configurações.</div>`, {actions: button(`${I('plus',17)} Novo registro`,'new','data-type="memories"')});
}
function peopleCards(people) { return people.map(p=>`<a class="person-card" style="--card-accent:${attr(personColor(data,p))}" href="#/person/${slug(p.id)}"><div class="person-card-head"><span class="code-pill">${esc(p.code)}</span><span class="round-arrow">${I('arrow',16)}</span></div><div class="person-card-main">${personAvatar(p,'lg')}<h3>${esc(p.codename)}</h3><small>${esc(p.realName || 'Identidade não informada')}</small></div><p>${esc(intro(p.description || p.role,92))}</p><div class="person-card-bottom"><span>${(p.categories || []).length ? esc(p.categories.slice(0,2).join(' · ')) : 'SEM CATEGORIA'}</span><span>${p.closenessSelf != null ? percentText(p.closenessSelf) + " próximo" : data.chapters.filter(c=>c.personIds.includes(p.id)).length+" capítulos"}</span></div></a>`).join(''); }
function codex() {
  const people=[...data.people].sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
  const categories=['all',...new Set([...CATEGORIES,...people.flatMap(p=>p.categories)])];
  const filters=categories.map(c=>`<button class="filter-pill ${ui.codexFilter===c?'selected':''}" data-action="codex-filter" data-value="${attr(c)}">${esc(c==='all'?'Todas as pessoas':c)}</button>`).join('');
  const allTags=[...new Set(data.people.flatMap(p=>p.perceptionTags||[]))].sort();
  const archetypes=(data.settings.archetypes||ARCHETYPES).map(a=>a.name);
  const advanced=`<div class="codex-advanced" id="tour-archetypes"><label>Arquétipo<select id="codex-archetype"><option value="all">Todos os arquétipos</option>${archetypes.map(a=>`<option value="${attr(a)}" ${ui.archetypeFilter===a?'selected':''}>${esc(a)}</option>`).join('')}</select></label><label>Tag de percepção<select id="codex-tag"><option value="all">Todas as tags</option>${allTags.map(t=>`<option value="${attr(t)}" ${ui.tagFilter===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label><label>Filtro adicional<select id="codex-status-filter"><option value="all">Sem filtro adicional</option><option value="nocontact" ${ui.statusFilter==='nocontact'?'selected':''}>Sem contato</option><option value="birthday" ${ui.statusFilter==='birthday'?'selected':''}>Aniversário neste mês</option><option value="history" ${ui.statusFilter==='history'?'selected':''}>Com histórico de porcentagens</option><option value="connected" ${ui.statusFilter==='connected'?'selected':''}>Com conexão entre pessoas</option></select></label><label>Ato em comum<select id="codex-act-filter"><option value="all">Todos os atos</option>${sortedActs().map(a=>`<option value="${attr(a.id)}" ${ui.actFilter===a.id?'selected':''}>${esc(a.title)}</option>`).join('')}</select></label><label>Conter todas estas tags<input id="codex-tags-all" value="${attr(ui.tagQuery)}" placeholder="Ex.: Confiança, Inspiração" /></label>${nav('ranking','Ver lista de porcentagens '+I('arrow',15),'btn btn-secondary')}</div>`;
  const grid=`<div class="codex-tools"><label class="search-field">${I('search',19)}<input id="codex-search" autocomplete="off" value="${attr(ui.codexText)}" placeholder="Código, codinome, nome ou apelido..." /></label><span class="result-count" id="codex-count">${people.length} REGISTROS</span></div><div class="filter-row">${filters}</div>${advanced}<div id="codex-results">${codexResults()}</div>`;
  return shell('ACTA Codex','ÍNDICE DE PERSONAGENS',`<div class="intro-strip"><span class="intro-symbol">◈</span><div><strong>O arquivo de pessoas da sua história</strong><p>Identificadores permanentes, codinomes evolutivos e vínculos com suas memórias e capítulos.</p></div></div><div id="tour-codex">${grid}</div><section class="panel" id="tour-groups"><div class="section-head"><h3>${I('people',19)} Grupos e organizações da narrativa <span class="count-mark">${data.groups.length}</span></h3>${button(`${I('plus',15)} Novo grupo`,'add-group','','btn btn-tiny')}</div><p class="secondary">Registre círculos de amizade, famílias narrativas, equipes e organizações. A associação não define o caráter de ninguém.</p>${data.groups.length?data.groups.map(g=>`<div class="connection-row"><div><strong>${esc(g.name)}</strong> ${g.period?chip(g.period):''}<p>${esc(g.description||'Sem descrição')}</p><div class="inline-tags">${g.memberIds.map(pid=>byId('people',pid)).filter(Boolean).map(p=>personLink(p)).join('')||chip('Nenhum integrante')}</div>${g.revisions.length?`<small class="hint">${g.revisions.length} alteração(ões) históricas preservadas</small>`:''}</div><div>${button(I('edit',15),'edit-group',`data-id="${attr(g.id)}"`,'mini-icon')}${button(I('trash',15),'delete-group',`data-id="${attr(g.id)}"`,'mini-icon')}</div></div>`).join(''):'<p class="panel-empty">Nenhum grupo cadastrado.</p>'}</section>`,{ actions: button(`${I('plus',17)} Nova pessoa`,'new','data-type="people" id="tour-new-person"') });
}
function codexResults() {
  const q=normalizeSearch(ui.codexText);
  const targetTags=ui.tagQuery.split(',').map(normalizeSearch).filter(Boolean);
  const birthdayMonth=String(new Date().getMonth()+1).padStart(2,'0');
  const filtered=data.people.filter(p=>(ui.statusFilter==='all'||(ui.statusFilter==='nocontact'&&p.status==='Sem contato')||(ui.statusFilter==='birthday'&&p.birthDate?.slice(-5,-3)===birthdayMonth)||(ui.statusFilter==='history'&&p.relationshipHistory?.length)||(ui.statusFilter==='connected'&&data.connections?.some(c=>c.personA===p.id||c.personB===p.id)))&&(ui.actFilter==='all'||data.chapters.some(c=>c.actId===ui.actFilter&&c.personIds.includes(p.id)))&&targetTags.every(t=>(p.perceptionTags||[]).some(tag=>normalizeSearch(tag)===t))&&(ui.codexFilter==='all'||(p.categories||[]).includes(ui.codexFilter)) && (ui.archetypeFilter==='all'||(p.archetypes||[]).includes(ui.archetypeFilter)) && (ui.tagFilter==='all'||(p.perceptionTags||[]).includes(ui.tagFilter)) && (!q || searchArchive({ ...data, acts:[],chapters:[],memories:[],events:[],missions:[] }, q,'people').some(r=>r.item.id===p.id))).sort((a,b)=>a.code.localeCompare(b.code,undefined,{numeric:true}));
  return filtered.length ? `<div class="person-grid">${peopleCards(filtered)}</div>` : blank('◇',data.people.length?'Nenhuma ficha encontrada':'Seu Codex está vazio',data.people.length?'Tente outros termos ou remova um filtro.':'Cadastre uma pessoa com apenas um codinome; o restante é opcional.','Nova pessoa','new" data-type="people');
}
function personPage(id) {
  const p=byId('people',id); if(!p) return notFound('Pessoa');
  const chapters=data.chapters.filter(c=>c.personIds.includes(p.id));
  const memories=data.memories.filter(m=>m.personIds.includes(p.id));
  const events=data.events.filter(e=>e.personIds.includes(p.id));
  const missions=data.missions.filter(m=>m.personIds.includes(p.id));
  const aliases=p.aliases || [], reflections=p.reflections || [];
  const allName=[...aliases].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const banner=`<div class="dossier-cover" style="--accent-person:${attr(personColor(data,p))}"><div class="dossier-cover-pattern">◈</div><div class="dossier-identity">${personAvatar(p,'xl')}<div><div class="dossier-code">REGISTRO / ${esc(p.code)}</div><h2>${esc(p.codename)}</h2><span>${esc(p.realName || 'Identidade preservada / não registrada')}</span></div></div><div class="dossier-stamp">ARQUIVO<br/>PESSOAL<br/><b>ACTA</b></div></div>`;
  const note=(name,value)=>value?`<div class="fact"><span>${esc(name)}</span><p>${esc(value)}</p></div>`:'';
  const codeHistory=p.codeHistory?.length?`<div class="info-block"><h4>Códigos anteriores</h4><div class="inline-tags">${p.codeHistory.map(c=>tag(c,'mono-tag')).join('')}</div><p class="hint">Qualquer código antigo também encontra esta ficha na pesquisa.</p></div>`:'';
  const bio=`<div class="panel dossier-panel"><div class="section-head"><h3>${I('archive',19)} Registro narrativo</h3>${tag(p.status)}</div><div class="fact-grid">${note('Como nos conhecemos',p.met)}${note('Papel na minha história',p.role)}${note('Percepção daquela época',p.perception)}${note('Impacto na minha história',p.importance)}${note('Nascimento / aniversário',birthdayText(p.birthDate))}${note('Primeira aparição conhecida',p.firstSeen)}${note('Última interação conhecida',p.lastSeen)}</div>${p.description?`<div class="prose"><h4>Descrição</h4><p>${esc(p.description)}</p></div>`:''}${p.notes?`<div class="prose"><h4>Observações pessoais</h4><p>${esc(p.notes)}</p></div>`:''}${codeHistory}<div class="inline-tags">${p.categories.map(c=>tag((c===p.primaryCategory?'★ ':'')+c)).join('') || chip('Sem categoria')}</div><div class="codex-tag-group"><h4>Arquétipos pessoais</h4><div class="inline-tags">${(p.archetypes||[]).map(a=>tag(a,'quiet')).join('')||chip('Não classificados')}</div><h4>Tags de percepção</h4><div class="inline-tags">${(p.perceptionTags||[]).map(t=>tag('#'+t,'quiet')).join('')||chip('Sem tags')}</div><p class="hint">São percepções pessoais, não diagnósticos nem classificações objetivas de terceiros.</p></div></div>`;
  const aliasesHtml=`<section class="panel"><div class="section-head"><h3>${I('sparkle',19)} Codinomes & aliases</h3>${button(`${I('plus',16)} Adicionar`,'new',`data-type="alias" data-id="${attr(p.id)}"`,'btn btn-tiny')}</div>${allName.length?allName.map(a=>`<div class="alias-item"><span class="alias-glyph">◈</span><div><strong>${esc(a.name)}</strong>${a.period?`<small>${esc(a.period)}</small>`:''}${a.description?`<p>${esc(a.description)}</p>`:''}${a.chapterId && byId('chapters',a.chapterId)?nav(`chapter/${slug(a.chapterId)}`,esc(byId('chapters',a.chapterId).title),'subtle-link'):''}</div>${button(I('close',14),'remove-sub',`data-id="${attr(p.id)}" data-subid="${attr(a.id)}" data-collection="aliases"`,'mini-icon')}</div>`).join(''):'<p class="panel-empty">Você pode guardar apelidos antigos, nomes secretos e períodos de uso.</p>'}${button(`${I('edit',15)} Alterar principal preservando o anterior`,'new',`data-type="codename" data-id="${attr(p.id)}"`,'btn btn-secondary btn-small')}</section>`;
  const reflHtml=`<section class="panel"><div class="section-head"><h3>${I('book',19)} Reflexões ao longo do tempo</h3>${button(`${I('plus',16)} Registrar`,'new',`data-type="reflection" data-id="${attr(p.id)}"`,'btn btn-tiny')}</div>${reflections.length?`<div class="reflections">${[...reflections].sort((a,b)=>(b.date||b.createdAt).localeCompare(a.date||a.createdAt)).map(r=>`<div class="reflection"><span class="reflection-date">${esc(r.date||fmtDate(r.createdAt))}</span><div><p>${esc(r.body)}</p>${button('Remover','remove-sub',`data-id="${attr(p.id)}" data-subid="${attr(r.id)}" data-collection="reflections"`,'subtle-button')}</div></div>`).join('')}</div>`:'<p class="panel-empty">Registre o que pensava em diferentes momentos sem reescrever o passado.</p>'}</section>`;
  const chaptersHtml=`<section class="panel"><div class="section-head"><h3>${I('layers',19)} Capítulos em que aparece <span class="count-mark">${chapters.length}</span></h3>${button(`${I('link',15)} Vincular`,'link-modal',`data-id="${attr(p.id)}"`,'btn btn-tiny')}</div>${chapters.length?chapters.map(ch=>`<div class="chapter-link-row"><div class="chapter-vertical">◇</div><a href="#/chapter/${slug(ch.id)}"><strong>${esc(ch.title)}</strong><small>${esc(byId('acts',ch.actId)?.title||'Ato desconhecido')}</small></a>${button(I('close',14),'unlink',`data-person="${attr(p.id)}" data-chapter="${attr(ch.id)}"`,'mini-icon')}</div>`).join(''):'<p class="panel-empty">Nenhum capítulo associado. Os vínculos funcionarão nos dois sentidos.</p>'}</section>`;
  const memoriesHtml=`<section class="panel"><div class="section-head"><h3>${I('book',19)} Memórias relacionadas <span class="count-mark">${memories.length}</span></h3>${button(`${I('plus',16)} Memória`,'new',`data-type="memories" data-person="${attr(p.id)}"`,'btn btn-tiny')}</div>${memories.length?memories.map(m=>memoryItem(m)).join(''):'<p class="panel-empty">Toda lembrança pode ser registrada mesmo sem data ou capítulo.</p>'}</section>`;
  const changes=[...(p.relationshipHistory||[])].reverse();
  const historyHtml=`<section class="panel" id="tour-relationship"><div class="section-head"><h3>${I('sparkle',19)} Proximidade & percepções</h3>${button(`${I('plus',16)} Novo registro`,'new',`data-type="relationship" data-id="${attr(p.id)}"`,'btn btn-tiny')}</div><p class="secondary">Valores que você estima. A reciprocidade não foi confirmada com a outra pessoa.</p><div class="closeness-grid"><div class="closeness-value"><small>Quanto eu me sinto próximo</small><strong>${percentText(p.closenessSelf)}</strong><div class="closeness-track"><span style="width:${p.closenessSelf??0}%"></span></div></div><div class="closeness-value"><small>Quanto acho que a pessoa se sente próxima</small><strong>${percentText(p.closenessOther)}</strong><div class="closeness-track"><span style="width:${p.closenessOther??0}%"></span></div></div></div>${p.closenessSelf!=null&&p.closenessOther!=null?`<p class="hint">Diferença estimada: ${Math.abs(p.closenessSelf-p.closenessOther).toFixed(1).replace('.',',')} pontos percentuais.</p>`:''}<div class="section-head"><h4>Gráfico individual de evolução</h4></div><div class="comparison-inputs"><label>Gráfico desde<input type="date" data-person-graph-date="from" data-id="${attr(p.id)}" value="${attr(ui.personGraphRange[p.id]?.from||'')}" /></label><label>Gráfico até<input type="date" data-person-graph-date="to" data-id="${attr(p.id)}" value="${attr(ui.personGraphRange[p.id]?.to||'')}" /></label></div>${personHistoryGraph(p)}<div class="relationship-timeline">${changes.length?changes.map(e=>`<div class="relationship-entry"><div><strong>${esc(e.date||'Data não informada')}</strong> ${tag(e.kind)}<small>${e.fromSelf===e.self ? 'Proximidade mantida' : `${percentText(e.fromSelf)} → ${percentText(e.self)}`} ${deltaText(e.self,e.fromSelf) ? `(${deltaText(e.self,e.fromSelf)})`:''}</small><small>Reciprocidade percebida: ${percentText(e.fromOther)} → ${percentText(e.other)}</small>${e.note?`<p>${esc(e.note)}</p>`:''}${(e.revisions||[]).length?`<small class="hint">${e.revisions.length} correção(ões) auditada(s); versões anteriores preservadas.</small><details><summary>Histórico de correções</summary>${e.revisions.map(rev=>`<p><small>${esc(rev.revisedAt)} · ${esc(rev.reason)} · anterior: ${percentText(rev.previous.self)} / ${percentText(rev.previous.other)} em ${esc(rev.previous.date)} · ${esc(rev.previous.note)}</small></p>`).join('')}</details>`:''}${e.memoryId&&byId('memories',e.memoryId)?`<small>Memória: ${esc(byId('memories',e.memoryId).title)}</small>`:''}${e.eventId&&byId('events',e.eventId)?`<small>Evento: ${esc(byId('events',e.eventId).title)}</small>`:''}</div><div class="history-actions">${button(I('edit',14),'correct-relationship',`data-id="${attr(p.id)}" data-entry="${attr(e.id)}"`,'mini-icon')}${button(I('trash',14),'remove-relationship',`data-id="${attr(p.id)}" data-entry="${attr(e.id)}"`,'mini-icon')}</div></div>`).join(''):'<p class="panel-empty">Nenhuma avaliação registrada. Você pode adicionar um evento mesmo sem alterar os percentuais.</p>'}</div></section>`;
  const linked=`${events.length?`<section class="panel"><div class="section-head"><h3>${I('calendar',19)} Acontecimentos <span class="count-mark">${events.length}</span></h3></div>${events.map(e=>recordRow(e,'events')).join('')}</section>`:''}${missions.length?`<section class="panel"><div class="section-head"><h3>${I('flag',19)} Missões associadas <span class="count-mark">${missions.length}</span></h3></div>${missions.map(m=>recordRow(m,'missions')).join('')}</section>`:''}`;
  return shell(p.codename,'DOSSIÊ DE PESSOA',`<div class="back-line">${nav('codex',I('back',16)+' Voltar ao Codex','back-link')} <span>Última atualização: ${fmtDate(p.updatedAt)}</span></div>${banner}<div class="dossier-actions">${button(`${I('edit',16)} Editar ficha`,'edit',`data-type="people" data-id="${attr(p.id)}"`,'btn btn-secondary')}${button(`${I('trash',16)} Excluir ficha`,'delete',`data-type="people" data-id="${attr(p.id)}"`,'btn btn-danger-light')}</div><div class="dossier-grid"><div>${bio}${historyHtml}${periodComparison(p)}${personConnections(p)}<section class="panel"><div class="section-head"><h3>${I('people',19)} Grupos em que aparece</h3></div>${data.groups.filter(g=>g.memberIds.includes(p.id)).map(g=>`<div class="connection-row"><div><strong>${esc(g.name)}</strong><p>${esc(g.description||'Sem descrição')}</p></div>${button(I('edit',15),'edit-group',`data-id="${attr(g.id)}"`,'mini-icon')}</div>`).join('')||'<p class="panel-empty">Nenhum grupo associado.</p>'}</section>${chaptersHtml}${memoriesHtml}</div><div>${aliasesHtml}${reflHtml}${linked}</div></div>`, {breadcrumb:`CODEX / ${p.code}`});
}

// SVG visualisation with native <title> tooltips. Only actual recorded samples are plotted.
const chartDate = iso => iso ? `${iso.slice(8,10)}/${iso.slice(5,7)}/${iso.slice(0,4)}` : '—';
const seriesPalette = ['#6da8fb','#f5ae62','#7bd9c8','#da9afa','#ef8fa1','#c4d577','#76c8ef','#efc96f','#9ca8ff','#e8a59b','#6fcaa0','#e0bbf7'];
const chartSeriesColor = i => seriesPalette[i%seriesPalette.length];
function relationshipChart(series, id='time-chart') {
  const flattened=series.flatMap(s=>s.points);
  if(!flattened.length)return `<div class="chart-empty">Ainda não há avaliações com data completa válida. Registre porcentagens com data para visualizar o gráfico.</div>`;
  const allDates=[...new Set(flattened.map(p=>p.date))].sort();
  const minDay=Date.parse(allDates[0]+'T00:00:00Z'),maxDay=Date.parse(allDates.at(-1)+'T00:00:00Z');
  const W=840,H=320,L=49,R=24,T=20,B=42;
  const chartWidth=W-L-R,chartHeight=H-T-B;
  const x=date=>L+(maxDay===minDay ? 0.5 : (Date.parse(date+'T00:00:00Z')-minDay)/(maxDay-minDay)) * chartWidth;
  const y=value=>T+(100-value)/100*chartHeight;
  const grid=[0,25,50,75,100].map(t=>`<g><line x1="${L}" x2="${W-R}" y1="${y(t)}" y2="${y(t)}" stroke="var(--border)" stroke-dasharray="4 6"/><text x="${L-9}" y="${y(t)+4}" fill="var(--text-muted)" text-anchor="end" font-size="12">${t}%</text></g>`).join('');
  const tickDates=allDates.length<=5?allDates:Array.from({length:5},(_,i)=>allDates[Math.round(i*(allDates.length-1)/4)]);
  const ticks=[...new Set(tickDates)].map(d=>`<g><line x1="${x(d)}" x2="${x(d)}" y1="${H-B}" y2="${H-B+5}" stroke="var(--text-muted)"/><text x="${x(d)}" y="${H-14}" text-anchor="middle" fill="var(--text-muted)" font-size="11">${chartDate(d).slice(0,5)} / ${d.slice(0,4)}</text></g>`).join('');
  const paths=series.map((s,i)=>{
    const stroke=s.color||chartSeriesColor(i);
    const entries=s.points.filter(p=>p.value!=null).sort((a,b)=>a.date.localeCompare(b.date)||a.index-b.index);
    let d='';let last=null;
    for(const p of entries){const coords=[x(p.date),y(p.value)];d+=(last?'L':'M')+coords.join(',')+' ';last=coords;}
    const line=entries.length>1?`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${series.length>10?1.8:2.7}" stroke-linecap="round" stroke-linejoin="round" opacity=".94" />`:'';
    const points=entries.map(p=>`<circle cx="${x(p.date)}" cy="${y(p.value)}" r="${series.length>10?2.7:4.2}" fill="${stroke}" stroke="var(--chart-point-outline)" stroke-width="1.1"><title>${esc(s.name)} · ${chartDate(p.date)} · ${percentText(p.value)}${p.note?' · '+esc(intro(p.note,110)):''}</title></circle>`).join('');
    return `<g>${line}${points}</g>`;
  }).join('');
  const legend=series.map((s,i)=>`<span class="chart-legend-item"><i style="background:${s.color||chartSeriesColor(i)}"></i>${esc(s.name)} (${s.points.filter(x=>x.value!=null).length})</span>`).join('');
  const table=series.map(s=>`<details class="chart-data-series"><summary>${esc(s.name)} — ${s.points.length} registro(s)</summary><div class="chart-table-scroll"><table class="chart-table"><thead><tr><th>Data</th><th>Estimativa</th><th>Descrição</th></tr></thead><tbody>${s.points.map(p=>`<tr><td>${esc(chartDate(p.date))}</td><td>${percentText(p.value)}</td><td>${esc(intro(p.note||'Sem nota',110))}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
  return `<div class="acta-chart" id="${attr(id)}"><div class="chart-scroll"><svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico histórico de porcentagens com datas reais, de 0 a 100 porcento">${grid}${ticks}${paths}</svg></div><div class="chart-legend">${legend}</div><details class="chart-data"><summary>Ver dados exatos do gráfico (acessível sem depender das cores)</summary>${table}</details></div>`;
}
function personHistoryGraph(person) {
  const range=ui.personGraphRange[person.id]||{};
  const items=chartPoints(person).filter(p=>(!range.from||p.date>=range.from)&&(!range.to||p.date<=range.to));
  return relationshipChart([{name:'Quanto eu me sinto próximo',color:'#6da8fb',points:items.map(e=>({...e,value:e.self}))},{name:'Reciprocidade que imagino',color:'#efae68',points:items.map(e=>({...e,value:e.other}))}],`chart-${person.id}`);
}
const comparisonDateDefaults = p => {const points=chartPoints(p);return [points[0]?.date||'',points.at(-1)?.date||''];};
const pctDelta = n => n==null?'—':(n>0?'+':'')+n.toFixed(1).replace('.',',')+' p.p.';
function periodComparison(p) {
  const defaults=comparisonDateDefaults(p), selection=ui.personCompare[p.id]||{};
  const from=selection.from||defaults[0],to=selection.to||defaults[1];
  let compare=null;
  if(from&&to)compare=compareSnapshots(p,from,to);
  return `<section class="panel" id="tour-time-compare"><div class="section-head"><h3>${I('calendar',20)} Comparar dois momentos</h3></div><p class="secondary">Compare o último registro disponível até cada data selecionada. Datas sem avaliações anteriores permanecem desconhecidas.</p><div class="comparison-inputs"><label>Data inicial<input type="date" data-person-compare="from" data-id="${attr(p.id)}" value="${attr(from)}" /></label><label>Data final<input type="date" data-person-compare="to" data-id="${attr(p.id)}" value="${attr(to)}" /></label></div>${compare?`<div class="comparison-results"><div><small>Proximidade · ${esc(chartDate(compare.first?.date||''))} → ${esc(chartDate(compare.second?.date||''))}</small><strong>${percentText(compare.first?.self)} → ${percentText(compare.second?.self)}</strong><em>${pctDelta(compare.selfDelta)}</em></div><div><small>Reciprocidade percebida</small><strong>${percentText(compare.first?.other)} → ${percentText(compare.second?.other)}</strong><em>${pctDelta(compare.otherDelta)}</em></div></div>`:'<p class="panel-empty">Registre avaliações datadas para habilitar a comparação.</p>'}<p class="hint">Esta é uma comparação entre suas percepções registradas, não uma medida objetiva de sentimentos.</p></section>`;
}
function personConnections(p) {
  const edges=(data.connections||[]).filter(c=>c.personA===p.id||c.personB===p.id);
  return `<section class="panel" id="tour-people-connections"><div class="section-head"><h3>${I('link',19)} Conexões com outras pessoas <span class="count-mark">${edges.length}</span></h3>${button(`${I('plus',15)} Vincular`,'add-connection',`data-id="${attr(p.id)}"`,'btn btn-tiny')}</div><p class="secondary">Relações entre personagens da sua história, visíveis nas duas fichas. Nenhuma categoria define objetivamente a pessoa.</p>${edges.length?edges.map(c=>{const other=byId('people',c.personA===p.id?c.personB:c.personA);return `<div class="connection-row"><div>${personLink(other)}<div class="connection-meta">${tag(c.kind,'quiet')} ${c.period?chip(c.period):''}</div>${c.note?`<p>${esc(c.note)}</p>`:''}</div><div>${button(I('edit',15),'edit-connection',`data-id="${attr(c.id)}"`,'mini-icon')}${button(I('trash',15),'delete-connection',`data-id="${attr(c.id)}"`,'mini-icon')}</div></div>`;}).join(''):'<p class="panel-empty">Nenhuma conexão cadastrada. Você pode ligar duas pessoas mesmo sem ato ou capítulo definido.</p>'}</section>`;
}
function globalComparison() {
  const all=data.people.flatMap(chartPoints).map(h=>h.date).sort();
  const from=ui.comparisonFrom||all[0]||'',to=ui.comparisonTo||all.at(-1)||'';
  const rows=(from&&to)?data.people.map(p=>({p,result:compareSnapshots(p,from,to)})).filter(x=>x.result.first||x.result.second):[];
  const metric=ui.graphMetric;
  return `<div class="comparison-inputs"><label>Comparar desde<input type="date" id="compare-all-from" value="${attr(from)}" /></label><label>Até<input type="date" id="compare-all-to" value="${attr(to)}" /></label></div>${rows.length?`<div class="chart-table-scroll"><table class="chart-table"><thead><tr><th>Pessoa</th><th>Antes</th><th>Depois</th><th>Variação</th></tr></thead><tbody>${rows.map(({p,result})=>{const first=result.first?.[metric],last=result.second?.[metric];return `<tr><td>${nav('person/'+slug(p.id),esc(p.codename),'subtle-link')}</td><td>${percentText(first)}</td><td>${percentText(last)}</td><td>${pctDelta(metric==='self'?result.selfDelta:result.otherDelta)}</td></tr>`;}).join('')}</tbody></table></div>`:'<p class="panel-empty">Sem avaliações até as datas escolhidas.</p>'}<p class="hint">Cada coluna usa a avaliação conhecida mais recente até a data correspondente. — significa informação desconhecida.</p>`;
}
function rankingPage(){
  const withHistory=data.people.filter(p=>p.closenessSelf!==null||p.closenessOther!==null||p.relationshipHistory?.length);
  const sort=ui.rankSort;
  const lastDelta=p=>{const h=p.relationshipHistory||[]; if(!h.length)return null; const last=h.at(-1);return last.self==null||last.fromSelf==null?null:last.self-last.fromSelf;};
  const ordered=[...withHistory].sort((a,b)=>{
    if(sort==='other')return (b.closenessOther??-1)-(a.closenessOther??-1);
    if(sort==='rise')return (lastDelta(b)??-999)-(lastDelta(a)??-999);
    if(sort==='fall')return (lastDelta(a)??999)-(lastDelta(b)??999);
    return (b.closenessSelf??-1)-(a.closenessSelf??-1);
  });
  const chartPeople=withHistory.filter(p=>chartPoints(p).length).sort((a,b)=>a.codename.localeCompare(b.codename,'pt-BR'));
  const metric=ui.graphMetric;
  const chart=relationshipChart(chartPeople.map((p,i)=>({name:`${p.code} · ${p.codename}`,color:chartSeriesColor(i),points:chartPoints(p).filter(h=>(!ui.graphStart||h.date>=ui.graphStart)&&(!ui.graphEnd||h.date<=ui.graphEnd)).map(h=>({...h,value:h[metric]}))})),'tour-combined-chart');
  const rows=ordered.map((p,i)=>`<a class="ranking-person" href="#/person/${slug(p.id)}"><div class="ranking-person-head"><span class="ranking-position">${i+1}º</span>${personAvatar(p,'sm')}<div class="ranking-name"><strong>${esc(p.codename)}</strong><small>${esc(p.code)} · ${esc(p.primaryCategory||'Sem vínculo principal')}</small></div><div class="ranking-numbers"><strong>${percentText(p.closenessSelf)}</strong><small>Reciprocidade: ${percentText(p.closenessOther)}</small></div></div><div class="closeness-track"><span style="width:${p.closenessSelf??0}%"></span></div><small>${lastDelta(p)===null?'Sem variação comparável no último registro':`Última variação: ${lastDelta(p)>0?'+':''}${lastDelta(p).toFixed(1).replace('.',',')} p.p.`}</small></a>`).join('');
  return shell('Lista de porcentagens','MAPA SUBJETIVO DE PROXIMIDADE',`<div class="intro-strip" id="tour-ranking"><span class="intro-symbol">%</span><div><strong>Como você percebe seus vínculos ao longo do tempo</strong><p>Ordenações e porcentagens são estimativas pessoais. Não representam valor, caráter ou sentimentos confirmados de outras pessoas.</p></div></div><div class="ranking-controls"><label>Ordenar por <select id="rank-sort"><option value="self" ${sort==='self'?'selected':''}>Minha proximidade (maior)</option><option value="other" ${sort==='other'?'selected':''}>Reciprocidade percebida (maior)</option><option value="rise" ${sort==='rise'?'selected':''}>Maior subida (última alteração)</option><option value="fall" ${sort==='fall'?'selected':''}>Maior queda (última alteração)</option></select></label></div><section class="panel" id="tour-chart-all"><div class="section-head"><h3>${I('layers',20)} Gráfico de todas as pessoas</h3>${nav('codex','Abrir Codex '+I('arrow',15),'text-link')}</div><p class="secondary">Uma linha por pessoa com avaliações datadas. Passe o cursor ou toque nos pontos para consultar valores; a tabela abaixo contém todos os dados. Sem criar avaliações para datas sem registros; os traços apenas ligam os pontos conhecidos.</p><div class="ranking-controls"><label>Visualizar <select id="graph-metric"><option value="self" ${metric==='self'?'selected':''}>Minha proximidade</option><option value="other" ${metric==='other'?'selected':''}>Reciprocidade percebida</option></select></label></div><div class="comparison-inputs"><label>Gráfico desde<input id="graph-start" type="date" value="${attr(ui.graphStart)}" /></label><label>Gráfico até<input id="graph-end" type="date" value="${attr(ui.graphEnd)}" /></label></div>${chart}</section><section class="panel" id="tour-compare-all"><div class="section-head"><h3>${I('calendar',20)} Comparar períodos — todas as pessoas</h3></div>${globalComparison()}</section>${rows?`<div class="ranking-list">${rows}</div>`:blank('◇','Ainda não há porcentagens','Abra uma ficha no Codex e selecione “Novo registro” na seção Proximidade & percepções.','Abrir Codex','home')}`,{nav:'ranking',actions:nav('codex','Voltar ao Codex','btn btn-secondary')});
}
function timeline() {
  const acts=sortedActs();
  const html=acts.length?`<div class="timeline" id="tour-timeline">${acts.map((act,i)=>`<div class="timeline-act"><div class="timeline-rail"><span class="rail-dot" style="--rail-color:${attr(act.color)}">${esc(act.symbol)}</span><span class="rail-line"></span></div><div class="timeline-body"><div class="timeline-act-header"><div><div class="label-overline">ATO ${String(i+1).padStart(2,'0')} ${act.start?`/ ${esc(act.start)}`:''}</div><h2>${nav(`act/${slug(act.id)}`,esc(act.title))}</h2><p>${esc(intro(act.description,180))}</p></div>${tag(act.status,activeStatus(act))}</div><div class="timeline-chapters">${orderedChapters(act.id).map((ch,j)=>`<a href="#/chapter/${slug(ch.id)}" class="chapter-card"><span class="chapter-index">${String(j+1).padStart(2,'0')}</span><div><strong>${esc(ch.title)}</strong><p>${esc(intro(ch.description,110))}</p><small>${ch.personIds.length} participantes · ${esc(ch.start||'Data não informada')}</small></div>${I('arrow',17)}</a>`).join('') || '<p class="small-empty">Ainda não há capítulos neste ato.</p>'}<button class="add-chapter" data-action="new" data-type="chapters" data-act="${attr(act.id)}">${I('plus',16)} Novo capítulo neste ato</button></div></div></div>`).join('')}</div>` : blank('◈','Nenhum ato registrado','Divida sua história em fases. Não é necessário saber quando começaram ou terminaram.','Criar primeiro ato','new" data-type="acts');
  return shell('Atos & capítulos','LINHA DO TEMPO NARRATIVA',`<div class="intro-strip">${I('layers',24)}<div><strong>Não existe ordem certa para lembrar.</strong><p>Crie fases da vida e organize capítulos conforme seu próprio significado. Datas podem ser aproximadas ou desconhecidas.</p></div></div>${html}`,{actions:button(`${I('plus',17)} Novo ato`,'new','data-type="acts" id="tour-new-act"')});
}
function actPage(id) {
  const act=byId('acts',id); if(!act)return notFound('Ato');
  const chapters=orderedChapters(id);
  return shell(act.title,'REGISTRO DE ATO',`<div class="back-line">${nav('timeline',I('back',16)+' Voltar à narrativa','back-link')}</div><div class="record-banner"><div class="record-symbol" style="--person-color:${attr(act.color)}">${esc(act.symbol)}</div><div><div class="label-overline">${esc(act.start||'Início não especificado')}${act.end?' — '+esc(act.end):''}</div><h2>${esc(act.title)}</h2><p>${esc(act.description||'Sem descrição.')}</p>${tag(act.status,activeStatus(act))}</div></div><div class="action-line">${button(`${I('edit',16)} Editar ato`,'edit',`data-type="acts" data-id="${attr(id)}"`,'btn btn-secondary')}${button(`${I('plus',16)} Novo capítulo`,'new',`data-type="chapters" data-act="${attr(id)}"`)}${button(`${I('trash',16)} Excluir`,'delete',`data-type="acts" data-id="${attr(id)}"`,'btn btn-danger-light')}</div><section class="panel"><div class="section-head"><h3>Capítulos deste ato <span class="count-mark">${chapters.length}</span></h3></div>${chapters.length?chapters.map((ch,j)=>`<a href="#/chapter/${slug(ch.id)}" class="chapter-card"><span class="chapter-index">${String(j+1).padStart(2,'0')}</span><div><strong>${esc(ch.title)}</strong><p>${esc(intro(ch.description,140))}</p><small>${esc(ch.start||'Data incerta')} · ${ch.personIds.length} pessoas</small></div>${I('arrow',17)}</a>`).join(''):'<p class="panel-empty">Crie um capítulo para registrar eventos e pessoas desta fase.</p>'}</section>`,{breadcrumb:'NARRATIVA / ATO'});
}
function chapterPage(id) {
  const ch=byId('chapters',id); if(!ch)return notFound('Capítulo');
  const act=byId('acts',ch.actId), events=data.events.filter(e=>e.chapterId===id), missions=data.missions.filter(m=>m.chapterId===id), memories=data.memories.filter(m=>m.chapterId===id);
  const people=ch.personIds.map(id=>byId('people',id)).filter(Boolean);
  return shell(ch.title,'REGISTRO DE CAPÍTULO',`<div class="back-line">${nav(`act/${slug(ch.actId)}`,I('back',16)+' '+esc(act?.title||'Voltar'),'back-link')}</div><div class="record-banner chapter-banner"><div class="record-symbol">⌘</div><div><div class="label-overline">${esc(act?.title||'ATO')} / ${esc(ch.start||'DATA NÃO INFORMADA')}</div><h2>${esc(ch.title)}</h2><p>${esc(ch.description||'Sem descrição.')}</p>${tag(ch.status,activeStatus(ch))}</div></div><div class="action-line">${button(`${I('edit',16)} Editar capítulo`,'edit',`data-type="chapters" data-id="${attr(id)}"`,'btn btn-secondary')}${button(`${I('trash',16)} Excluir capítulo`,'delete',`data-type="chapters" data-id="${attr(id)}"`,'btn btn-danger-light')}</div><div class="dossier-grid"><div><section class="panel" id="tour-link"><div class="section-head"><h3>${I('people',19)} Personagens deste capítulo <span class="count-mark">${people.length}</span></h3>${button(`${I('plus',15)} Associar`,'link-modal',`data-chapter="${attr(id)}"`,'btn btn-tiny')}</div>${people.length?`<div class="chapter-person-grid">${people.map(p=>`<div class="chapter-person-item">${personLink(p)} ${button(I('close',13),'unlink',`data-person="${attr(p.id)}" data-chapter="${attr(id)}"`,'mini-icon')}</div>`).join('')}</div>`:'<p class="panel-empty">Cadastre ou associe uma pessoa à fase. Ela também aparecerá na ficha do Codex.</p>'}</section><section class="panel"><div class="section-head"><h3>${I('calendar',19)} Acontecimentos <span class="count-mark">${events.length}</span></h3>${button(`${I('plus',15)} Novo evento`,'new',`data-type="events" data-chapter="${attr(id)}"`,'btn btn-tiny')}</div>${events.length?events.map(e=>recordRow(e,'events')).join(''):'<p class="panel-empty">Marcos importantes, mudanças e encontros aparecem aqui.</p>'}</section><section class="panel"><div class="section-head"><h3>${I('flag',19)} Missões <span class="count-mark">${missions.length}</span></h3>${button(`${I('plus',15)} Nova missão`,'new',`data-type="missions" data-chapter="${attr(id)}"`,'btn btn-tiny')}</div>${missions.length?missions.map(m=>recordRow(m,'missions')).join(''):'<p class="panel-empty">Objetivos desta fase, sem pontuações ou cobranças.</p>'}</section></div><div><section class="panel"><div class="section-head"><h3>${I('book',19)} Contexto narrativo</h3></div>${[ ['Objetivo inicial',ch.objective],['Situação inicial',ch.initial],['Situação final',ch.final],['Notas',ch.notes],['Encerramento',ch.end] ].filter(([,v])=>v).map(([k,v])=>`<div class="fact"><span>${esc(k)}</span><p>${esc(v)}</p></div>`).join('')||'<p class="panel-empty">Ainda não existem notas adicionais.</p>'}</section><section class="panel"><div class="section-head"><h3>${I('book',19)} Memórias <span class="count-mark">${memories.length}</span></h3>${button(`${I('plus',15)} Registrar`,'new',`data-type="memories" data-chapter="${attr(id)}"`,'btn btn-tiny')}</div>${memories.length?memories.map(m=>memoryItem(m)).join(''):'<p class="panel-empty">Guarde lembranças contextualizadas neste capítulo.</p>'}</section></div></div>`,{breadcrumb:'NARRATIVA / CAPÍTULO'});
}
function memoryItem(m) { return `<article class="memory-item"><div class="memory-item-head"><div><strong>${esc(m.title)}</strong><span class="record-meta">${esc(m.date || 'Data desconhecida')} · ${esc(m.certainty)}</span></div>${button(I('edit',15),'edit',`data-type="memories" data-id="${attr(m.id)}"`,'mini-icon')}</div><p>${esc(intro(m.body,240))}</p><div class="memory-persons">${personPills(m.personIds)} ${(m.tags||[]).map(t=>tag('#'+t,'quiet')).join('')}</div></article>`; }
function recordRow(record,type) {
  const detail=type==='missions'?`${record.status} · ${record.priority}`:(record.date||'Data desconhecida');
  return `<div class="record-row"><span class="list-symbol">${type==='events'?'◉':'◇'}</span><div><strong>${esc(record.title)}</strong><small>${esc(detail)}</small>${record.description?`<p>${esc(intro(record.description,120))}</p>`:''}${personPills(record.personIds)}</div>${button(I('edit',16),'edit',`data-type="${type}" data-id="${attr(record.id)}"`,'icon-btn')}</div>`;
}
function collectionPage(type) {
  const isMemory=type==='memories';
  const records=[...data[type]].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const title={memories:'Arquivo de memórias',events:'Eventos & marcos',missions:'Missões & objetivos'}[type];
  const help={memories:'Registre lembranças mesmo sem datas ou pessoas identificadas. Não é necessário classificar nada agora.', events:'Guarde os acontecimentos importantes de cada fase — ou fora de qualquer capítulo.', missions:'Acompanhe objetivos no seu ritmo. Nenhuma missão é obrigatória.'}[type];
  let content=records.length?records.map(rec=>isMemory?`<div class="memory-large">${memoryItem(rec)}${rec.chapterId && byId('chapters',rec.chapterId)?nav(`chapter/${slug(rec.chapterId)}`,'⌘ '+esc(byId('chapters',rec.chapterId).title),'record-context'):''}</div>`:`<div class="panel collection-item">${recordRow(rec,type)}${rec.chapterId && byId('chapters',rec.chapterId)?nav(`chapter/${slug(rec.chapterId)}`,'⌘ '+esc(byId('chapters',rec.chapterId).title),'record-context'):''}</div>`).join('') : blank('◇',`Nenhum(a) ${type==='events'?'evento':type==='missions'?'missão':'memória'} registrado(a)`,help,`Registrar ${viewSingle[type].toLowerCase()}`,'new" data-type="'+type);
  return shell(title,'COLEÇÃO NARRATIVA',`<div class="intro-strip">${I(isMemory?'book':type==='events'?'calendar':'flag',24)}<div><strong>${isMemory?'Tudo o que merece ser lembrado':'Registros da sua narrativa'}</strong><p>${help}</p></div></div><div class="collection-list">${content}</div>`,{ actions:button(`${I('plus',17)} ${isMemory?'Nova memória':type==='events'?'Novo evento':'Nova missão'}`,'new',`data-type="${type}" id="${isMemory?'tour-memory':''}"`) });
}
function searchPage() {
  ui.searchText=route().query || ui.searchText;
  const filters=['all',...TYPES].map(t=>`<button class="filter-pill ${ui.searchFilter===t?'selected':''}" data-action="search-filter" data-value="${attr(t)}">${esc(t==='all'?'Tudo':viewName[t])}</button>`).join('');
  return shell('Pesquisa global','ENCONTRE QUALQUER REGISTRO',`<div class="search-large">${I('search',23)}<input id="full-search" autofocus value="${attr(ui.searchText)}" placeholder="Código, codinome, capítulo ou frase de uma memória..." autocomplete="off" /></div><div class="filter-row">${filters}</div><div id="search-results">${searchResults()}</div>`,{nav:'search'});
}
function searchResults() {
  if(!ui.searchText.trim()) return blank('⌕','Sua história está a uma busca','Pesquise por SCP-015, um nome antigo, um capítulo ou até uma frase em uma memória.','','');
  const result=searchArchive(data,ui.searchText,ui.searchFilter);
  return result.length?`<div class="search-count">${result.length} resultado(s) encontrado(s)</div>${result.map(({type,item})=>`<div class="search-result"><div class="search-result-icon">${I(type==='people'?'people':type==='acts'?'layers':type==='chapters'?'book':type==='memories'?'archive':type==='events'?'calendar':'flag',20)}</div><div><span class="label-overline">${esc(viewSingle[type])}${type==='people'?` / ${esc(item.code)}`:''}</span><strong>${esc(item.codename||item.title)}</strong><p>${esc(intro(item.description||item.body||item.notes,130))}</p></div><div class="search-result-actions">${type==='people'||type==='chapters'||type==='acts'?nav(`${type==='people'?'person':type==='chapters'?'chapter':'act'}/${slug(item.id)}`,I('arrow',19),'icon-btn') : button(I('edit',17),'edit',`data-type="${attr(type)}" data-id="${attr(item.id)}"`,'icon-btn')}</div></div>`).join('')}` : blank('⊘','Sem resultados','Confira a grafia, procure um código antigo ou tente outra expressão.','','');
}
function settingsPage() {
  return shell('Configurações','PRIVACIDADE & CONTROLE',`<div class="settings-grid"><div><section class="panel"><div class="section-head"><h3>${I('lock',20)} Seu arquivo é privado por padrão</h3></div><div class="privacy-body"><p><strong>Nada é enviado aos nossos servidores.</strong> O ACTA funciona no seu navegador, com armazenamento local IndexedDB. Este armazenamento <strong>não é criptografado</strong> enquanto você utiliza o aplicativo.</p><p>Alguém com acesso ao seu dispositivo ou perfil de navegador poderá acessar os registros. Limpar os dados do site pode apagar o arquivo. Em GitHub Pages, projetos hospedados sob o mesmo domínio compartilham a origem e podem acessar o mesmo IndexedDB; para registros sensíveis, prefira um domínio exclusivo. Não envie backups pessoais para um repositório público.</p><p>Somente o <strong>backup criptografado</strong> recebe criptografia AES-256-GCM com senha escolhida por você. Se perder a senha, não há recuperação.</p></div></section><section class="panel" id="tour-backup"><div class="section-head"><h3>${I('download',20)} Backup & restauração</h3></div><div class="settings-commands"><div><h4>Exportar backup com senha</h4><p>Recomendado. Arquivo criptografado usando Web Crypto API, AES-256-GCM + PBKDF2.</p>${button(`${I('lock',16)} Exportar criptografado`,'export-encrypted')}</div><div><h4>Exportar JSON sem senha</h4><p>Arquivo legível em texto simples. <strong>Contém seus dados pessoais.</strong></p>${button(`${I('download',16)} Exportar sem criptografia`,'export-plain','','btn btn-secondary')}</div><div><h4>Restaurar backup</h4><p>Importar substitui o arquivo atual, após confirmação explícita. Exporte o atual antes.</p><label class="btn btn-secondary file-label">${I('upload',16)} Selecionar arquivo<input id="import-file" type="file" accept=".acta,.json,application/json" hidden /></label></div></div></section></div><div><section class="panel"><div class="section-head"><h3>${I('gear',20)} Preferências</h3></div><form id="settings-form" class="settings-form"><label>Tema<select name="theme"><option value="dark" ${data.settings.theme==='dark'?'selected':''}>Escuro</option><option value="light" ${data.settings.theme==='light'?'selected':''}>Claro</option></select></label><label>Avisar aniversários nos próximos<select name="birthdayDays">${[7,14,30,60].map(d=>`<option value="${d}" ${Number(data.settings.birthdayDays)===d?'selected':''}>${d} dias</option>`).join('')}</select></label><label>Prefixo dos próximos códigos<input name="codePrefix" maxlength="12" value="${attr(data.settings.codePrefix)}" placeholder="SCP, ARK, P..." /></label><p class="hint">Alterar o prefixo não renomeia os registros existentes.</p><div class="form-field" id="tour-category-colors"><span>Cores padrão por vínculo</span><div class="colors-settings">${CATEGORIES.map(c=>`<label><span>${esc(c)}</span><input type="color" name="categoryColor:${attr(c)}" value="${attr(data.settings.categoryColors?.[c]||CATEGORY_COLORS[c])}" /></label>`).join('')}</div></div><label>Tags sugeridas (separadas por vírgula)<input name="perceptionTags" value="${attr((data.settings.perceptionTags||[]).join(', '))}" /></label><label>Arquétipos narrativos (um por linha, Nome | descrição)<textarea name="archetypeLines" rows="6" spellcheck="false">${esc((data.settings.archetypes||ARCHETYPES).map(a=>a.name+" | "+a.description).join("\n"))}</textarea><small class="hint">Você pode criar novos nomes, alterar descrições ou remover modelos da lista. Fichas antigas conservam arquétipos históricos.</small></label><button type="submit" class="btn btn-primary">Salvar preferências</button></form></section><section class="panel"><div class="section-head"><h3>${I('sparkle',20)} Conhecer o ACTA</h3></div><p class="secondary">Tutorial interativo com destaque em cada elemento.</p>${button('Iniciar tutorial guiado','start-tour','','btn btn-secondary')}<hr/><p class="secondary">Dados inteiramente fictícios e opcionais para explorar o sistema.</p>${button('Carregar arquivo fictício','demo','','btn btn-secondary')}</section><section class="panel"><div class="section-head"><h3>${I('warning',20)} Sobre armazenamento</h3></div><p class="secondary">Registros: ${count('people')} pessoas, ${count('acts')} atos, ${count('chapters')} capítulos, ${count('memories')} memórias.</p><p class="secondary">Status: <strong>${persisted?'IndexedDB ativo':'Modo temporário (persistência indisponível)'}</strong></p><p class="secondary">Formato interno: schema 3 (migração automática dos schemas 1 e 2). Backup: formato ACTA 1.</p></section></div></div>`,{nav:'settings'});
}
function notFound(name) { return shell('Registro não encontrado','ARQUIVO',blank('⌕',name+' não encontrado(a)','Talvez o registro tenha sido excluído ou o link não seja válido.','Voltar ao início','home')); }
function render() {
  const r=route();
  let html;
  if(r.section==='dashboard') html=dashboard();
  else if(r.section==='codex') html=codex();
  else if(r.section==='ranking') html=rankingPage();
  else if(r.section==='person') html=personPage(r.id);
  else if(r.section==='timeline') html=timeline();
  else if(r.section==='act') html=actPage(r.id);
  else if(r.section==='chapter') html=chapterPage(r.id);
  else if(['memories','missions','events'].includes(r.section)) html=collectionPage(r.section);
  else if(r.section==='search') html=searchPage();
  else if(r.section==='settings') html=settingsPage();
  else html=dashboard();
  app.innerHTML=html;
  document.documentElement.dataset.theme=data.settings.theme;
  document.title=`${r.section==='person'?byId('people',r.id)?.codename||'Codex':r.section==='dashboard'?'Visão geral':$('.page-head h1',app)?.textContent||'Arquivo'} · ACTA`;
  if(ui.tourStep>=0) requestAnimationFrame(showTour);
}

// All modal editor fields use name attributes and a single save pathway.
const field = (label,name,value='',placeholder='',type='text',hint='') => `<label class="form-field"><span>${esc(label)}</span><input type="${type}" name="${attr(name)}" value="${attr(value)}" placeholder="${attr(placeholder)}" ${type==='color'?'class="color-input"':''} />${hint?`<small>${esc(hint)}</small>`:''}</label>`;
const area = (label,name,value='',placeholder='',rows=3) => `<label class="form-field"><span>${esc(label)}</span><textarea name="${attr(name)}" rows="${rows}" placeholder="${attr(placeholder)}">${esc(value)}</textarea></label>`;
const select = (label,name,choices,value='',empty='') => `<label class="form-field"><span>${esc(label)}</span><select name="${attr(name)}">${empty?`<option value="">${esc(empty)}</option>`:''}${choices.map(item=>{ const id=typeof item==='string'?item:item.id; const title=typeof item==='string'?item:item.title; return `<option value="${attr(id)}" ${id===value?'selected':''}>${esc(title)}</option>`; }).join('')}</select></label>`;
const choices = (name,values,selected=[])=>`<div class="check-grid">${values.map(v=>`<label class="check-option"><input type="checkbox" name="${attr(name)}" value="${attr(v)}" ${selected.includes(v)?'checked':''}/><span>${esc(v)}</span></label>`).join('')}</div>`;
const peopleChecks = (ids=[])=>`<div class="form-field"><span>Pessoas relacionadas <small>(opcional)</small></span>${data.people.length?`<div class="check-grid people-checks">${data.people.map(p=>`<label class="check-option"><input type="checkbox" name="personIds" value="${attr(p.id)}" ${ids.includes(p.id)?'checked':''}/>${personAvatar(p,'xs')}<span>${esc(p.codename)} <small>${esc(p.code)}</small></span></label>`).join('')}</div>`:'<p class="field-empty">Você ainda não cadastrou pessoas. Pode associá-las depois.</p>'}</div>`;
const SYMBOL_GROUPS={Animais:['🦊','🐺','🦉','🦋','🦁','🐍','🐉','🐈'],Mística:['✦','✧','☾','☀','♜','⚜','∞','☯','★','◆'],Objetos:['👑','⚔️','🛡️','🔮','🌹','🕯️','🔥','💎','🗝️','♟️']};
const symbolPicker = (name='icon') => `<div class="symbol-picker" id="tour-symbols"><div class="symbol-picker-title">Biblioteca de símbolos — toque para preencher o campo</div>${Object.entries(SYMBOL_GROUPS).map(([group,values])=>`<div><small>${group}</small><div class="symbol-picker-grid">${values.map(sym=>`<button type="button" class="symbol-option" data-action="pick-symbol" data-field="${attr(name)}" data-symbol="${attr(sym)}" title="Usar ${attr(sym)}">${esc(sym)}</button>`).join('')}</div></div>`).join('')}</div>`;
const chaptersSelect=(value)=> select('Capítulo relacionado','chapterId',data.chapters.map(c=>({id:c.id,title:`${c.title} · ${byId('acts',c.actId)?.title||''}`})),value||'','Sem capítulo / não sei ainda');
function editorForm(type, record, opts={}) {
  const r=record||{}, newRecord=!record;
  const personIds=r.personIds||opts.personId&&[opts.personId]||[];
  const chapterId=r.chapterId||opts.chapterId||'';
  if(type==='people') {
    const categoryValue=r.primaryCategory || r.categories?.[0] || '';
    const archetypes=[...new Set([...(data.settings.archetypes||ARCHETYPES).map(a=>a.name),...(r.archetypes||[])])];
    return `<div class="form-grid">${field('Codinome principal *','codename',r.codename,'Ex.: A Raposa')}${field('Código *','code',r.code||nextCode(data),'Ex.: SCP-015')}${field('Nome real (opcional)','realName',r.realName,'Pode ficar em branco')}${field('Símbolo','icon',r.icon||'◈','✦')}${field('Nascimento (AAAA-MM-DD ou MM-DD)','birthDate',r.birthDate,'Ex.: 1997-05-23 ou 05-23','text','O ano pode ser desconhecido; os avisos aparecem no Dashboard.')}${select('Situação atual','status',RELATIONSHIPS,r.status||RELATIONSHIPS.at(-1))}</div>${symbolPicker('icon')}<div class="form-field" id="tour-colors"><span>Categorias de vínculo (marque quantas quiser)</span>${choices('categories',CATEGORIES,r.categories)}</div><div class="form-grid">${select('Vínculo principal (define a cor automática)','primaryCategory',[{id:'',title:'Nenhum'},...CATEGORIES.map(c=>({id:c,title:c}))],categoryValue)}${select('Cor da ficha','colorMode',[{id:'category',title:'Usar a cor do vínculo principal'},{id:'custom',title:'Cor personalizada'}],r.colorMode||'category')}${field('Cor personalizada, se escolhida','color',r.color||'#b9a17a','','color')}</div><p class="hint">Ao marcar várias categorias, selecione uma delas como principal. As cores padrão podem ser alteradas em Configurações.</p><div class="codex-classification" id="tour-mythology"><div class="form-field"><span>Arquétipos narrativos <small>(opcional, percepção pessoal)</small></span>${choices('archetypes',archetypes,r.archetypes||[])}<small>${(data.settings.archetypes||ARCHETYPES).map(a=>`${a.name}: ${a.description}`).join(' · ')}</small></div>${field('Tags de percepção (separadas por vírgula)','perceptionTags',(r.perceptionTags||[]).join(', '),'Ex.: Pessoa de luz, Confiança')}<div class="suggested-tags"><small>Sugestões (toque para adicionar):</small><div class="inline-tags">${(data.settings.perceptionTags||[]).map(t=>`<button type="button" class="filter-pill" data-action="pick-tag" data-tag="${attr(t)}">+ ${esc(t)}</button>`).join('')}</div></div><small>São rótulos subjetivos para organizar seus registros; não são diagnósticos de outras pessoas.</small></div>${area('Descrição livre','description',r.description,'Quem é esta pessoa na sua narrativa?')}${area('Como nos conhecemos','met',r.met,'Sem precisar informar uma data')}${area('Papel que teve na minha história','role',r.role)}${area('Como eu a percebia na época','perception',r.perception)}${area('Impacto na minha história','importance',r.importance,'O que ela influenciou, ensinou ou marcou? Ex.: ajudou numa fase difícil.')}<p class="hint">Explique o lugar que essa pessoa ocupou na sua trajetória, não o valor dela como indivíduo.</p><div class="form-grid">${field('Primeira aparição conhecida','firstSeen',r.firstSeen,'Ex.: entre 2017 e 2018')}${field('Última interação conhecida','lastSeen',r.lastSeen,'Ex.: início de 2024')}</div>${area('Observações pessoais','notes',r.notes)}<label class="form-field"><span>Foto ou avatar (opcional)</span><input type="file" name="avatar" accept="image/png,image/jpeg,image/webp" /><small>Compactada no navegador (máximo 4 MB de origem). Fica apenas no armazenamento local.</small></label>${r.avatar?`<label class="checkbox-simple"><input type="checkbox" name="removeAvatar" value="yes"/> Remover avatar atual</label>`:''}<div class="form-note">${I('lock',16)} O código pode mudar sem romper vínculos. O anterior fica pesquisável.</div>`;
  }
  if(type==='relationship') {
    const person=byId('people',opts.personId)||byId('people',ui.modal.id);
    const memories=data.memories.filter(m=>m.personIds?.includes(person?.id));
    const events=data.events.filter(e=>e.personIds?.includes(person?.id));
    return `<div class="form-note" id="tour-percent">${I('sparkle',18)} Você está registrando suas próprias estimativas. 100% não significa que conhece objetivamente os sentimentos da outra pessoa.</div><div class="form-grid">${field('Minha proximidade, 0–100%','self',person?.closenessSelf??'','Ex.: 56,7','text','Deixe em branco para não estimar.')}${field('Reciprocidade que imagino, 0–100%','other',person?.closenessOther??'','Ex.: 44','text','É sua percepção, não uma avaliação da outra pessoa.')}${field('Data do registro','date',new Date().toISOString().slice(0,10),'','date')}${select('Como você vê o acontecimento','kind',['Positivo','Negativo','Neutro','Reflexão'],'Neutro')}</div>${area('O que aconteceu ou por que mudou?','note','','A pessoa me ajudou em algo... ou apenas percebi uma mudança.',4)}${select('Associar memória existente (opcional)','memoryId',memories.map(m=>({id:m.id,title:m.title})),'','Sem memória relacionada')}${select('Associar evento existente (opcional)','eventId',events.map(e=>({id:e.id,title:e.title})),'','Sem evento relacionado')}<p class="hint">O registro será adicionado ao histórico, mesmo quando as porcentagens permanecerem iguais (desde que haja uma descrição).</p>`;
  }
  if(type==='acts')return `${field('Título do ato *','title',r.title,'Ex.: Ato III — Reconstrução')}${area('Descrição','description',r.description,'O que representa este período?')}<div class="form-grid">${field('Início (texto livre)','start',r.start,'Ex.: 2018 / infância')}${field('Fim (opcional)','end',r.end,'Ex.: meados de 2022')}${select('Status','status',PHASE_STATUS,r.status||'Em andamento')}${field('Ordem narrativa','order',r.order??data.acts.length+1,'1','number')}${field('Símbolo','symbol',r.symbol||'◈','✦')}${field('Cor','color',r.color||'#b9a17a','','color')}</div>`;
  if(type==='chapters')return `${select('Ato ao qual pertence *','actId',sortedActs(),r.actId||opts.actId||'','Selecione um ato')}${field('Título do capítulo *','title',r.title,'Ex.: Os primeiros encontros')}${area('Descrição','description',r.description)}<div class="form-grid">${field('Início (livre)','start',r.start,'Ex.: 2017–2018')}${field('Fim (opcional)','end',r.end)}${select('Status','status',PHASE_STATUS,r.status||'Em andamento')}</div>${area('Objetivo inicial','objective',r.objective)}${area('Situação inicial','initial',r.initial)}${area('Situação final','final',r.final)}${area('Observações','notes',r.notes)}${peopleChecks(r.personIds||[])}`;
  if(type==='memories')return `${field('Título da memória *','title',r.title,'Ex.: A conversa no ônibus')}${area('O que você lembra?','body',r.body,'Descreva com suas próprias palavras...',6)}<div class="form-grid">${field('Quando aconteceu?','date',r.date,'Ex.: talvez em 2018')}${select('Grau de certeza','certainty',CERTAINTY,r.certainty||'Lembrança pessoal')}</div>${chaptersSelect(chapterId)}${peopleChecks(personIds)}${field('Tags (separadas por vírgula)','tags',(r.tags||[]).join(', '),'Ex.: viagem, amizade, mudança')}<div class="form-note">${I('book',16)} Uma lembrança não é necessariamente um acontecimento confirmado. Datas aproximadas são bem-vindas.</div>`;
  if(type==='events')return `${field('Título do acontecimento *','title',r.title,'Ex.: Primeiro encontro')}${area('Descrição','description',r.description)}${field('Quando aconteceu?','date',r.date,'Pode ser aproximado ou desconhecido')}${chaptersSelect(chapterId)}${peopleChecks(personIds)}`;
  if(type==='missions')return `${field('Título da missão *','title',r.title,'Ex.: Aprender outra tecnologia')}${area('Descrição','description',r.description)}<div class="form-grid">${select('Status','status',MISSION_STATUS,r.status||'Pendente')}${select('Prioridade (opcional)','priority',PRIORITY,r.priority||'Sem prioridade')}${field('Prazo desejado (opcional)','due',r.due,'Sem data obrigatória')}</div>${area('Anotações de progresso','progress',r.progress,'Registre avanços sem obrigação de produtividade')}${chaptersSelect(chapterId)}${peopleChecks(personIds)}`;
  if(type==='alias')return `${field('Codinome adicional *','name','','Ex.: Projeto Aurora')}${area('Descrição','description','','Por que esse nome surgiu?')}${field('Período de utilização (livre)','period','','Ex.: 2019–2021')}${chaptersSelect('')}`;
  if(type==='codename')return `${field('Novo codinome principal *','name','','Novo nome')}${field('Período do nome anterior (opcional)','period','','Ex.: 2017–2020')}${area('Nota sobre a mudança','description','','O nome anterior será preservado')}`;
  if(type==='reflection')return `${field('Data ou período da reflexão','date','','Ex.: início de 2026')}${area('Sua percepção naquele momento *','body','','O que você pensava ou pensa sobre essa relação?',6)}<div class="form-note">As reflexões antigas não serão substituídas por novas.</div>`;
  return '';
}
function renderModal() {
  const {type,id,opts={},content} = ui.modal;
  if(type==='backup-export')return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog compact-dialog" role="dialog" aria-modal="true" aria-label="Criptografar backup"><div class="modal-head"><div><div class="label-overline">PROTEÇÃO DE ARQUIVO</div><h2>Backup criptografado</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="backup-export-form" class="modal-body">${field('Senha (mínimo 8 caracteres)','password','','','password')}${field('Confirmar senha','passwordConfirm','','','password')}<p class="form-note">A senha não é armazenada nem pode ser recuperada. Guarde-a separadamente do backup.</p><div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">${I('download',16)} Gerar arquivo seguro</button></div></form></div></div>`;
  if(type==='backup-import')return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog compact-dialog" role="dialog" aria-modal="true" aria-label="Importar backup"><div class="modal-head"><div><div class="label-overline">RESTAURAÇÃO</div><h2>Importar backup</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="backup-import-form" class="modal-body"><p>Arquivo selecionado: <strong>${esc(content?.filename)}</strong></p>${field('Senha, se o backup estiver criptografado','password','','','password')}<p class="form-note warning-note">A importação irá substituir todos os dados deste navegador após uma confirmação. Faça uma exportação do arquivo atual antes de prosseguir.</p><div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">${I('upload',16)} Validar e importar</button></div></form></div></div>`;
  if(type==='group') {
    const old=(data.groups||[]).find(g=>g.id===id);
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Grupo ou organização"><div class="modal-head"><div><div class="label-overline">GRUPOS NARRATIVOS</div><h2>${old?'Editar grupo':'Novo grupo'}</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="group-form" class="modal-body">${field('Nome do grupo *','name',old?.name||'','Ex.: Clube dos Exploradores')}${area('Descrição','description',old?.description||'','O que este grupo representa?')}${field('Período (texto livre)','period',old?.period||'','Ex.: ensino médio, 2017–2019')}${peopleChecks(old?.memberIds||[])}<p class="hint">Ao editar, o registro anterior de integrantes e descrição fica preservado no backup.</p><div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">Salvar grupo</button></div></form></div></div>`;
  }
  if(type==='connection') {
    const old=(data.connections||[]).find(c=>c.id===id);
    const personA=old?.personA||opts.personId||'';
    const options=data.people.filter(p=>p.id!==personA).map(p=>({id:p.id,title:`${p.code} · ${p.codename}`}));
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog compact-dialog" role="dialog" aria-modal="true" aria-label="Conexão entre pessoas"><div class="modal-head"><div><div class="label-overline">CONEXÕES</div><h2>${old?'Editar conexão':'Vincular pessoas'}</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="connection-form" class="modal-body"><input type="hidden" name="personA" value="${attr(personA)}" /><p class="secondary">Pessoa de origem: ${esc(byId('people',personA)?.codename||'Desconhecida')}</p>${select('Conectar com','personB',options,old?.personB||'','Escolha uma pessoa')}${select('Tipo de relação','kind',CONNECTION_KINDS,old?.kind||'Amizade')}${field('Período (opcional)','period',old?.period||'','Ex.: 2018–2022')}${area('Observações subjetivas','note',old?.note||'','Como você percebe esta conexão?')}<div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">Salvar conexão</button></div></form></div></div>`;
  }
  if(type==='correction') {
    const person=byId('people',opts.personId);
    const entry=person?.relationshipHistory?.find(x=>x.id===id);
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog compact-dialog" role="dialog" aria-modal="true" aria-label="Corrigir registro histórico"><div class="modal-head"><div><div class="label-overline">CORREÇÃO AUDITÁVEL</div><h2>Corrigir avaliação anterior</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="correction-form" class="modal-body"><div class="form-grid">${field('Minha proximidade','self',entry?.self??'','','text')}${field('Reciprocidade percebida','other',entry?.other??'','','text')}${field('Data','date',entry?.date||'','','date')}</div>${area('Observação','note',entry?.note||'')}${area('Por que está corrigindo? *','reason','','Ex.: encontrei a data correta numa memória antiga.') }<div class="form-note">Versões anteriores permanecem na ficha. A sequência de valores posteriores será ajustada para refletir a correção.</div><div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">Registrar correção</button></div></form></div></div>`;
  }
  if(type==='link') {
    const hasPerson=!!opts.personId;
    const options=hasPerson?data.chapters.filter(c=>!c.personIds.includes(opts.personId)).map(c=>({id:c.id,title:`${c.title} — ${byId('acts',c.actId)?.title||''}`})):data.people.filter(p=>!byId('chapters',opts.chapterId)?.personIds.includes(p.id)).map(p=>({id:p.id,title:`${p.code} — ${p.codename}`}));
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog compact-dialog" role="dialog" aria-modal="true" aria-label="Vincular pessoa"><div class="modal-head"><div><div class="label-overline">VÍNCULO NARRATIVO</div><h2>${hasPerson?'Vincular a capítulo':'Adicionar personagem'}</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="link-form" class="modal-body">${options.length?select(hasPerson?'Escolha um capítulo':'Escolha uma pessoa','target',options):'<p>Não há registros disponíveis para vincular. Cadastre outra pessoa ou capítulo.</p>'}<div class="modal-footer">${button('Cancelar','close-modal','','btn btn-secondary')}${options.length?'<button type="submit" class="btn btn-primary">Confirmar vínculo</button>':''}</div></form></div></div>`;
  }
  const existing=['people','acts','chapters','memories','events','missions'].includes(type)?byId(type,id):null;
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal-dialog" role="dialog" aria-modal="true" aria-label="${esc(viewSingle[type]||type)}"><div class="modal-head"><div><div class="label-overline">${existing?'EDITAR REGISTRO':'NOVO REGISTRO'} / ${esc(viewSingle[type]||type)}</div><h2>${existing?'Editar '+viewSingle[type].toLowerCase():type==='alias'?'Novo codinome':type==='reflection'?'Nova reflexão':type==='relationship'?'Registrar proximidade ou acontecimento':type==='codename'?'Alterar codinome principal':'Criar '+(viewSingle[type]||type).toLowerCase()}</h2></div>${button(I('close'),'close-modal','','icon-btn')}</div><form id="editor-form" class="modal-body" data-type="${attr(type)}" data-id="${attr(id||'')}">${editorForm(type,existing,opts)}<div class="modal-footer">${existing?button(`${I('trash',15)} Excluir`,'delete',`data-type="${attr(type)}" data-id="${attr(id)}"`,'btn btn-danger-light'): ''}${button('Cancelar','close-modal','','btn btn-secondary')}<button type="submit" class="btn btn-primary">${I('check',17)} Salvar registro</button></div></form></div></div>`;
}
function notify(message, error=false) {
  const host=$('#toast-region') || document.body;
  const el=document.createElement('div'); el.className=`toast ${error?'error':''}`;
  el.textContent=message; host.append(el); setTimeout(()=>el.remove(),4500);
}
function displayError(e) { console.error('ACTA:',e); notify(e.message || 'Não foi possível completar a ação.',true); }
async function persistNow() {
  if (!db) return;
  const snapshot = structuredClone(data);
  clearTimeout(saveTimer);
  saveChain=saveChain.catch(()=>{}).then(()=>writeArchive(db,snapshot));
  try { await saveChain; ui.saveStatus='saved'; if($('#save-status')) $('#save-status').textContent='SALVO LOCALMENTE'; }
  catch (e) { ui.saveStatus='error'; persisted=false; if($('#save-status')) $('#save-status').textContent='ERRO AO SALVAR — FAÇA UM BACKUP'; displayError(new Error('Não foi possível salvar no navegador. Exporte seus dados antes de fechar a página.')); }
}
function scheduleSave() { ui.saveStatus='pending'; if($('#save-status')) $('#save-status').textContent=db?'SALVANDO…':'MODO TEMPORÁRIO'; clearTimeout(saveTimer); void persistNow(); }
function openEditor(type,id=null,opts={}) {
  if(type==='chapters' && !data.acts.length) { notify('Crie um ato antes de adicionar capítulos.',true); return; }
  ui.modal={type,id,opts}; render(); setTimeout(()=>$('.modal-dialog input:not([type=hidden]), .modal-dialog textarea')?.focus(),40);
}
function closeModal() { ui.modal=null; render(); }
function formValues(form) {
  const fd=new FormData(form);
  return { ...Object.fromEntries(fd.entries()), categories:fd.getAll('categories'), archetypes:fd.getAll('archetypes'), perceptionTags:String(fd.get('perceptionTags')||'').split(',').map(t=>t.trim()).filter(Boolean), personIds:fd.getAll('personIds'), tags:String(fd.get('tags')||'').split(',').map(t=>t.trim()).filter(Boolean) };
}
function downFile(text,filename) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a'); link.href=url; link.download=filename; document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function compressAvatar(file) {
  if (!file) return '';
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024) throw new Error('Imagem inválida. Use PNG, JPEG ou WebP até 4 MB.');
  const bitmap=await createImageBitmap(file); const side=320; const ratio=Math.min(1,side/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  return canvas.toDataURL('image/jpeg',0.75);
}
async function handleSubmit(e) {
  const form=e.target;
  if(!['editor-form','settings-form','backup-export-form','backup-import-form','link-form','connection-form','correction-form','group-form'].includes(form.id))return;
  e.preventDefault();
  const submit=$('[type=submit]',form);if(submit)submit.disabled=true;
  try {
    if(form.id==='editor-form') {
      const { type,id,opts }=ui.modal;
      const v=formValues(form);
      if(type==='alias')addAlias(data,id,v);
      else if(type==='codename')renameCodename(data,id,v.name,v.description,v.period);
      else if(type==='reflection')addReflection(data,id,v);
      else if(type==='relationship')addRelationshipEntry(data,id,v);
      else {
        // Validate/resize the user image before mutating the archive.
        const avatar = type==='people' ? $('input[name=avatar]',form)?.files?.[0] : null;
        const compressed = avatar ? await compressAvatar(avatar) : null;
        const record=saveRecord(data,type,{...v,actId:v.actId||opts.actId,chapterId:v.chapterId||opts.chapterId,personIds:v.personIds||opts.personId&&[opts.personId]||[]},id);
        if(type==='people') {
          if(compressed) record.avatar=compressed;
          if(v.removeAvatar==='yes') record.avatar='';
        }
      }
      ui.modal=null; scheduleSave();render();notify('Registro salvo no arquivo local.');
    } else if(form.id==='group-form') {
      const values=formValues(form);
      saveGroup(data,{...values,memberIds:values.personIds},ui.modal.id||null);
      ui.modal=null;scheduleSave();render();notify('Grupo salvo com o histórico de alterações preservado.');
    } else if(form.id==='connection-form') {
      const values=formValues(form);
      saveConnection(data,values,ui.modal.id||null);
      ui.modal=null;scheduleSave();render();notify('Conexão registrada nas duas fichas.');
    } else if(form.id==='correction-form') {
      correctRelationshipEntry(data,ui.modal.opts.personId,ui.modal.id,formValues(form));
      ui.modal=null;scheduleSave();render();notify('Correção salva com a versão anterior preservada.');
    } else if(form.id==='link-form') {
      const {opts}=ui.modal; const target=new FormData(form).get('target');
      if(opts.personId)linkPersonChapter(data,opts.personId,target,true);
      else linkPersonChapter(data,target,opts.chapterId,true);
      ui.modal=null;scheduleSave();render();notify('Vínculo criado em ambas as direções.');
    } else if(form.id==='settings-form') {
      const v=Object.fromEntries(new FormData(form).entries());
      const prefix=String(v.codePrefix||'SCP').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,12);
      if(!prefix)throw new Error('Informe um prefixo válido com letras ou números.');
      const colors=Object.fromEntries(Object.entries(v).filter(([k])=>k.startsWith('categoryColor:')).map(([k,val])=>[k.slice(14),val]));
      const perceptionTags=String(v.perceptionTags||'').split(',').map(s=>s.trim()).filter(Boolean);
      const archetypes=String(v.archetypeLines||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map(line=>{
        const parts=line.split('|');
        const name=parts.shift().trim().slice(0,80),description=parts.join('|').trim().slice(0,300);
        if(!name || !description)throw new Error('Informe Nome | descrição em cada linha de arquétipo.');
        return {name,description};
      });
      if(archetypes.length>60 || new Set(archetypes.map(a=>normalizeSearch(a.name))).size!==archetypes.length)throw new Error('Há arquétipos duplicados ou mais de 60 modelos.');
      saveCategoryColors(data,colors);
      data.settings={...data.settings,theme:v.theme==='light'?'light':'dark',codePrefix:prefix,birthdayDays:Number(v.birthdayDays)||30,perceptionTags,archetypes};
      scheduleSave();render();notify('Preferências salvas.');
    } else if(form.id==='backup-export-form') {
      const pwd=form.elements.password.value;
      if(pwd!==form.elements.passwordConfirm.value)throw new Error('As senhas não coincidem.');
      const backup=await encryptedBackup(data,pwd);
      downFile(backup,`acta-backup-${new Date().toISOString().slice(0,10)}.acta`);
      ui.modal=null;render();notify('Backup criptografado gerado. Guarde sua senha.');
    } else if(form.id==='backup-import-form') {
      const {text}=ui.modal.content;
      const restored=await parseBackup(text,form.elements.password.value);
      const counts=`${restored.people.length} pessoas, ${restored.chapters.length} capítulos, ${restored.memories.length} memórias`;
      if(!confirm(`Backup validado (${counts}).\n\nATENÇÃO: isso substituirá TODOS os registros atuais neste navegador.\n\nVocê já exportou os dados atuais? Confirmar substituição?`))return;
      if (!db) throw new Error('IndexedDB indisponível: não é seguro restaurar neste navegador.');
      clearTimeout(saveTimer);await saveChain.catch(()=>{});
      await writeArchive(db,restored); data=restored; ui.modal=null;go('dashboard');render();notify('Arquivo restaurado com sucesso.');
    }
  } catch(e) { displayError(e); } finally { if(submit?.isConnected)submit.disabled=false; }
}
function onAction(e) {
  const target=e.target.closest('[data-action]'); if(!target)return;
  const action=target.dataset.action;
  if(action==='close-modal' && e.target!==target && target.classList.contains('modal-backdrop'))return;
  if(action==='close-modal' && e.target.closest('.modal-dialog') && target.classList.contains('modal-backdrop'))return;
  if(action==='new'){openEditor(target.dataset.type,target.dataset.id||null,{personId:target.dataset.person,chapterId:target.dataset.chapter,actId:target.dataset.act});return;}
  if(action==='edit'){openEditor(target.dataset.type,target.dataset.id);return;}
  if(action==='close-modal'){closeModal();return;}
  if(action==='delete') {
    const type=target.dataset.type,id=target.dataset.id;
    const rec=byId(type,id); if(!rec)return;
    if(confirm(`Excluir ${rec.codename||rec.title}?\n\nEsta ação apaga o registro e remove os vínculos. Faça backup antes. Não é possível desfazer.`)) {
      try {deleteRecord(data,type,id);ui.modal=null;scheduleSave();go(type==='people'?'codex':['acts','chapters'].includes(type)?'timeline':type);render();notify('Registro excluído.');}catch(err){displayError(err);}
    }
    return;
  }
  if(action==='add-group'){ui.modal={type:'group',id:null,opts:{}};render();return;}
  if(action==='edit-group'){ui.modal={type:'group',id:target.dataset.id,opts:{}};render();return;}
  if(action==='delete-group'){if(confirm('Excluir este grupo narrativo? Os integrantes permanecerão no Codex.')){try{removeGroup(data,target.dataset.id);scheduleSave();render();notify('Grupo removido.');}catch(err){displayError(err);}}return;}
  if(action==='add-connection') { if(data.people.length<2){notify('Cadastre uma segunda pessoa antes de criar uma conexão.',true);return;}ui.modal={type:'connection',id:null,opts:{personId:target.dataset.id}};render();return; }
  if(action==='edit-connection') {const c=data.connections.find(c=>c.id===target.dataset.id);if(c){ui.modal={type:'connection',id:c.id,opts:{personId:c.personA}};render();}return;}
  if(action==='delete-connection') {if(confirm('Remover esta conexão das duas fichas?')){try{removeConnection(data,target.dataset.id);scheduleSave();render();notify('Conexão removida.');}catch(err){displayError(err);}}return;}
  if(action==='correct-relationship') {ui.modal={type:'correction',id:target.dataset.entry,opts:{personId:target.dataset.id}};render();return;}
  if(action==='remove-relationship') {
    const p=byId('people',target.dataset.id);
    const history=p?.relationshipHistory||[];
    if(history.at(-1)?.id!==target.dataset.entry) { notify('Para preservar a sequência histórica, remova os registros mais recentes primeiro.',true); return; }
    if(confirm('Excluir o registro mais recente de porcentagens? Os valores voltarão aos da avaliação anterior.')) {
      try { removeRelationshipEntry(data,p.id,target.dataset.entry);scheduleSave();render();notify('Registro removido; valores restaurados.'); } catch(err){displayError(err);}
    }return;
  }
  if(action==='pick-tag') {
    const input=$('.modal-dialog [name=perceptionTags]'); if(!input)return;
    const tags=input.value.split(',').map(t=>t.trim()).filter(Boolean);
    if(!tags.some(t=>normalizeSearch(t)===normalizeSearch(target.dataset.tag)))tags.push(target.dataset.tag);
    input.value=tags.join(', ');input.focus();return;
  }
  if(action==='pick-symbol') {const input=document.querySelector(`.modal-dialog [name="${target.dataset.field}"]`); if(input){input.value=target.dataset.symbol;input.focus();}return;}
  if(action==='remove-sub') {
    const p=byId('people',target.dataset.id); const collection=target.dataset.collection;
    if(p && ['aliases','reflections'].includes(collection) && confirm('Remover este registro histórico? Esta ação não pode ser desfeita.')) {
      p[collection]=p[collection].filter(i=>i.id!==target.dataset.subid);p.updatedAt=new Date().toISOString();scheduleSave();render();notify('Item removido.');
    }return;
  }
  if(action==='link-modal') {
    ui.modal={type:'link',opts:{personId:target.dataset.id,chapterId:target.dataset.chapter}};
    render();return;
  }
  if(action==='unlink') {if(confirm('Desvincular esta pessoa deste capítulo?')){try{linkPersonChapter(data,target.dataset.person,target.dataset.chapter,false);scheduleSave();render();notify('Vínculo removido.');}catch(err){displayError(err);}}return;}
  if(action==='codex-filter'){ui.codexFilter=target.dataset.value; $$('.filter-pill',app).forEach(b=>b.classList.toggle('selected',b.dataset.value===ui.codexFilter));if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(action==='search-filter'){ui.searchFilter=target.dataset.value;$$('.filter-pill',app).forEach(b=>b.classList.toggle('selected',b.dataset.value===ui.searchFilter));if($('#search-results'))$('#search-results').innerHTML=searchResults();return;}
  if(action==='toggle-theme'){data.settings.theme=data.settings.theme==='dark'?'light':'dark';scheduleSave();render();return;}
  if(action==='quick-search'){go('search');setTimeout(()=>$('#full-search')?.focus(),25);return;}
  if(action==='mobile-menu'){ui.mobileNav=!ui.mobileNav;render();return;}
  if(action==='close-nav'){ui.mobileNav=false;render();return;}
  if(action==='export-encrypted'){ui.modal={type:'backup-export'};render();return;}
  if(action==='export-plain') {
    if(confirm('Este arquivo NÃO terá criptografia e conterá seus dados pessoais em texto legível. Exportar mesmo assim?')) {
      try{downFile(plainBackup(data),`acta-backup-sem-criptografia-${new Date().toISOString().slice(0,10)}.json`);notify('Backup JSON exportado (sem criptografia).');}catch(err){displayError(err);}
    }return;
  }
  if(action==='start-tour'){startTour();return;}
  if(action==='demo') {
    const populated=TYPES.some(t=>data[t].length);
    if(populated&&!confirm('O arquivo contém registros. O conjunto demonstrativo é totalmente fictício, mas será ADICIONADO aos seus registros atuais. Deseja misturar?'))return;
    if(!populated&&!confirm('Adicionar dados 100% fictícios para conhecer as funções do ACTA?'))return;
    try {
      const demo=makeFictionalDemo();
      for(const t of TYPES) {if(t==='people'){for(const p of demo.people){if(data.people.some(ex=>[ex.code,...ex.codeHistory].includes(p.code)))p.code=nextCode(data,'DEMO');data.people.push(p);} }else data[t].push(...demo[t]);}
      scheduleSave();go('dashboard');render();notify('Exemplo fictício adicionado ao arquivo.');
    }catch(err){displayError(err);}
    return;
  }
  if(action==='home')go('dashboard');
  if(action==='tour-next')advanceTour(1);
  if(action==='tour-prev')advanceTour(-1);
  if(action==='tour-end')endTour();
}
function onInput(e) {
  if(e.target.dataset.personCompare) {const id=e.target.dataset.id;ui.personCompare[id]={...(ui.personCompare[id]||{}),[e.target.dataset.personCompare]:e.target.value};render();return;}
  if(e.target.id==='graph-metric'){ui.graphMetric=e.target.value;render();return;}
  if(e.target.id==='compare-all-from'){ui.comparisonFrom=e.target.value;render();return;}
  if(e.target.id==='compare-all-to'){ui.comparisonTo=e.target.value;render();return;}
  if(e.target.id==='rank-sort'){ui.rankSort=e.target.value;render();return;}
  if(e.target.id==='codex-status-filter'){ui.statusFilter=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='codex-act-filter'){ui.actFilter=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='codex-tags-all'){ui.tagQuery=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='graph-start'){ui.graphStart=e.target.value;render();return;}
  if(e.target.id==='graph-end'){ui.graphEnd=e.target.value;render();return;}
  if(e.target.dataset.personGraphDate){const id=e.target.dataset.id;ui.personGraphRange[id]={...(ui.personGraphRange[id]||{}),[e.target.dataset.personGraphDate]:e.target.value};render();return;}
  if(e.target.id==='codex-archetype'){ui.archetypeFilter=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='codex-tag'){ui.tagFilter=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='codex-search') {ui.codexText=e.target.value;if($('#codex-results'))$('#codex-results').innerHTML=codexResults();return;}
  if(e.target.id==='full-search') {ui.searchText=e.target.value;if($('#search-results'))$('#search-results').innerHTML=searchResults();return;}
  if(e.target.id==='import-file') {
    const file=e.target.files?.[0];if(!file)return;
    if(file.size>25*1024*1024){notify('O backup excede 25 MB. Divida ou reduza os dados.',true);return;}
    file.text().then(text=>{ui.modal={type:'backup-import',content:{text,filename:file.name}};render();}).catch(displayError);
  }
}

const tourSteps=[
  {path:'timeline',target:'#tour-new-act',title:'Atos da sua vida',text:'Um ato é uma fase maior da sua história. Crie seus próprios títulos, períodos e ordem narrativa. Nada precisa ter uma data exata.'},
  {path:'timeline',target:'.add-chapter',title:'Capítulos',text:'Dentro de cada ato existem capítulos. Eles reúnem pessoas, acontecimentos, objetivos e memórias. Se ainda não houver atos, crie o primeiro para habilitar os capítulos.'},
  {path:'codex',target:'#tour-new-person',title:'Pessoas do Codex',text:'Cada pessoa tem apenas um registro, mesmo que apareça em vários capítulos. Para começar, basta escolher um codinome e um código.'},
  {path:'codex',target:'#tour-codex',title:'Identificadores & codinomes',text:'Use um identificador como SCP-015 ou ARK-001. Você pode renomear códigos e codinomes depois; os antigos permanecem pesquisáveis.'},
  {path:'codex',modal:'people',target:'#tour-symbols',title:'Biblioteca de símbolos',text:'Esta é a biblioteca de símbolos do cadastro de pessoa. Clique em um desenho para preencher o campo de símbolo sem precisar copiá-lo de outro site.'},
  {path:'codex',modal:'people',target:'#tour-colors',title:'Múltiplos vínculos & cor principal',text:'Marque Família, Amizade, Relacionamento ou vários. Escolha um vínculo principal, que define a cor automática. Também é possível selecionar uma cor manual.'},
  {path:'codex',modal:'people',target:'#tour-mythology',title:'Arquétipos e tags pessoais',text:'Escolha modelos narrativos como Yotunt ou Chiteyavs e tags próprias. Eles refletem sua interpretação e não são diagnósticos ou julgamentos objetivos.'},
  {path:'memories',target:'#tour-memory',title:'Registro de memórias',text:'Escreva lembranças mesmo sem saber a data, o nome real de alguém ou a fase exata. Diferencie memória pessoal de acontecimento confirmado.'},
  {path:'timeline',target:'#tour-timeline',title:'Vínculos entre capítulos e pessoas',text:'Abra um capítulo e use “Associar” para selecionar alguém do Codex. Os vínculos aparecem automaticamente nos dois registros.'},
  {path:'dashboard',target:'#tour-birthday',title:'Aniversários próximos',text:'Cadastre o nascimento completo ou somente mês e dia nas pessoas. Esta seção mostra datas próximas quando você abre o ACTA.'},
  {path:'codex',target:'#tour-archetypes',title:'Arquétipos e tags',text:'Os seus Vlastnyys, Yotunt, Kantionyys, Chiteyavs e Tsuknyys, além das tags pessoais, são classificações subjetivas e filtráveis.'},
  {path:'ranking',target:'#tour-chart-all',title:'Gráfico comparativo de todas as pessoas',text:'Veja todas as linhas de proximidade num gráfico único. Altere a visualização para reciprocidade percebida e consulte a tabela de dados para conhecer cada valor registrado.'},
  {path:'ranking',target:'#tour-compare-all',title:'Comparação de períodos',text:'Defina duas datas e veja a última avaliação conhecida até cada uma. Sem registro anterior, o valor permanece desconhecido.'},
  {path:'codex',target:'#tour-groups',title:'Grupos e organizações',text:'Crie grupos, círculos de amigos ou organizações da sua narrativa e vincule pessoas. As fichas apresentam automaticamente os grupos associados.'},
  {path:'codex',target:'#tour-codex',title:'Gráfico individual e conexões entre pessoas',text:'Abra uma ficha para visualizar as duas séries de porcentagem e comparar momentos. Na seção Conexões, ligue duas pessoas do Codex; o vínculo aparece em ambas as fichas.'},
  {path:'ranking',target:'#tour-ranking',title:'Lista de porcentagens',text:'Registre duas estimativas para cada pessoa: a proximidade que você sente e a reciprocidade que imagina. Consulte a posição e as mudanças no ranking.'},
  {path:'ranking',modal:'relationship',target:'#tour-percent',title:'Registrar um acontecimento e porcentagens',text:'Abra a ficha de alguém e use “Novo registro” em Proximidade. Informe os dois valores, a data e uma explicação. Sem pessoas cadastradas, veja primeiro o ranking; não é necessário cadastrar ninguém durante o tutorial.'},
  {path:'ranking',target:'#tour-chart-all',title:'Histórico auditável',text:'Na ficha de uma pessoa, use o ícone de edição ao lado de um registro antigo para corrigir dados, mantendo a versão anterior e o motivo preservados.'},
  {path:'settings',target:'#tour-category-colors',title:'Cores de vínculos',text:'Cada tipo de vínculo tem uma cor padrão editável. Uma pessoa pode ter vários vínculos, mas você escolhe um principal. A biblioteca de símbolos fica no formulário de pessoa.'},
  {path:'search',target:'.search-large',title:'Encontre tudo depois',text:'Pesquise por código atual ou antigo, apelido, título ou trecho de uma memória. Use Ctrl+K. Para porcentagens, abra a ficha de uma pessoa; há um registro histórico dentro dela.'}
];
function startTour(){ui.tourStep=0;showTourStep();}
function advanceTour(delta){if(ui.tourStep+delta>=tourSteps.length){endTour();return;}ui.tourStep=Math.max(0,ui.tourStep+delta);showTourStep();}
function showTourStep(){
  const step=tourSteps[ui.tourStep];if(!step)return;
  let path=step.path;
  ui.modal=null;
  if(step.modal==='people')ui.modal={type:'people',id:null,opts:{}};
  if(step.modal==='relationship'&&data.people.length){
    const person=data.people[0];path=`person/${slug(person.id)}`;ui.modal={type:'relationship',id:person.id,opts:{}};
  }
  const hash=`#/${path}`;
  if(location.hash===hash)render();else location.hash=hash;
  requestAnimationFrame(()=>requestAnimationFrame(showTour));
}
function endTour(){ui.tourStep=-1;ui.modal=null;$('#tour-overlay')?.remove();$$('.tour-highlight').forEach(el=>el.classList.remove('tour-highlight'));data.settings.tutorialSeen=true;scheduleSave();render();}
function showTour(){
  $('#tour-overlay')?.remove();$$('.tour-highlight').forEach(el=>el.classList.remove('tour-highlight'));
  if(ui.tourStep<0)return;
  const s=tourSteps[ui.tourStep], target=$(s.target)||(s.modal==='relationship'&&$('#tour-ranking'))||$('.page-head');
  if(!target)return;
  target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  target.classList.add('tour-highlight');
  const wrapper=document.createElement('div');wrapper.id='tour-overlay';
  wrapper.innerHTML=`<div class="tour-scrim"></div><section class="tour-popover" role="dialog" aria-live="polite" aria-label="Tutorial passo ${ui.tourStep+1}"><div class="tour-mini">GUIA ACTA <span>${String(ui.tourStep+1).padStart(2,'0')} / ${String(tourSteps.length).padStart(2,'0')}</span></div><div class="tour-progress">${tourSteps.map((_,i)=>`<span class="${i<=ui.tourStep?'filled':''}"></span>`).join('')}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p><div class="tour-actions">${button('Encerrar','tour-end','','btn btn-ghost')}${button(`${I('back',15)} Anterior`,'tour-prev',ui.tourStep===0?'disabled':'','btn btn-secondary btn-small')}${button(`${ui.tourStep===tourSteps.length-1?'Concluir':'Próximo'} ${I('arrow',15)}`,'tour-next','','btn btn-primary btn-small')}</div><small>Use ← e → para navegar, Esc para fechar.</small></section>`;
  document.body.append(wrapper);
  const el=$('.tour-popover',wrapper),rect=target.getBoundingClientRect(), width=Math.min(370,innerWidth-24);
  const x=Math.max(12,Math.min(innerWidth-width-12,rect.left+(rect.width-width)/2));
  let y=rect.bottom+14;
  const h=el.getBoundingClientRect().height;
  if(y+h>innerHeight-14)y=Math.max(14,rect.top-h-14);
  if(y+h>innerHeight-14)y=Math.max(14,innerHeight-h-14);
  el.style.width=width+'px';el.style.left=x+'px';el.style.top=y+'px';
}
function onKeyboard(e){
  if(ui.tourStep>=0){if(e.key==='Escape'){e.preventDefault();endTour();return;}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();advanceTour(e.key==='ArrowRight'?1:-1);return;}}
  if(e.key==='Escape'&&ui.modal){e.preventDefault();closeModal();return;}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();go('search');setTimeout(()=>$('#full-search')?.focus(),30);}
  if(e.key==='Enter'&&e.target.id==='full-search'){e.preventDefault();}
}
async function init(){
  try {
    db=await openStorage();
    const saved=await loadArchive(db);
    if(saved){validateArchive(saved);data=migrateArchive(saved); if(saved.schemaVersion!==data.schemaVersion)await writeArchive(db,data);}
  } catch (e) {
    persisted=false;
    console.error('ACTA IndexedDB:',e);
    setTimeout(()=>notify('IndexedDB indisponível ou arquivo local inválido. Os novos dados ficarão apenas nesta aba. Exporte seu trabalho.',true),400);
  }
  window.addEventListener('hashchange',()=>{ui.mobileNav=false;render();window.scrollTo(0,0);});
  window.addEventListener('keydown',onKeyboard);
  document.addEventListener('click',onAction);
  document.addEventListener('submit',handleSubmit);
  document.addEventListener('input',onInput);
  window.addEventListener('resize',()=>{if(ui.tourStep>=0)showTour();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&saveTimer)persistNow();});
  if(!location.hash)location.hash='#/dashboard';
  render();
  // New, empty archives open the interactive tutorial instead of only showing a toast.
  // Existing archives and people who already finished the tour are never interrupted.
  if(!data.settings.tutorialSeen&&TYPES.every(t=>data[t].length===0)&&!(data.groups?.length||data.connections?.length)) {
    setTimeout(()=>{ if(ui.tourStep===-1&&!ui.modal&&TYPES.every(t=>data[t].length===0)&&!(data.groups?.length||data.connections?.length)) startTour(); },500);
  }
  if('serviceWorker'in navigator && (location.protocol==='https:'||location.hostname==='localhost')) {
    // Rooted in the configured Vite base, including GitHub Pages project URLs.
    const base=import.meta.env?.BASE_URL || new URL('../',import.meta.url).pathname;
    navigator.serviceWorker.register(base+'sw.js',{scope:base}).catch(err=>console.info('ACTA: cache offline indisponível:',err));
  }
}
init();
