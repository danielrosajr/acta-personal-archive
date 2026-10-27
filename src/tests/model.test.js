import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyArchive, saveRecord, nextCode, addAlias, addReflection, renameCodename, linkPersonChapter, deleteRecord, validateArchive, makeFictionalDemo } from '../lib/model.js';

test('Codex: generates unique sequential identifiers and reserves aliases',()=>{
  const a=emptyArchive();
  const p=saveRecord(a,'people',{codename:'A Raposa',code:'SCP-015'});
  const other=saveRecord(a,'people',{codename:'Amigo',code:'SCP-001'});
  assert.equal(nextCode(a),'SCP-016');
  assert.throws(()=>saveRecord(a,'people',{codename:'Clone',code:'SCP-015'}),/já foi usado/);
  const changed=saveRecord(a,'people',{...p,code:'ARK-015'},p.id);
  assert.deepEqual(changed.codeHistory,['SCP-015']);
  assert.throws(()=>saveRecord(a,'people',{codename:'Clone',code:'scp-015'}),/já foi usado/);
  assert.equal(other.id,a.people.find(x=>x.codename==='Amigo').id);
  validateArchive(a);
});
test('Aliases, reflections, and bidirectional person-chapter links remain stable',()=>{
  const a=emptyArchive(); const p=saveRecord(a,'people',{codename:'A Cartógrafa'});
  const act=saveRecord(a,'acts',{title:'Ato I'});const ch=saveRecord(a,'chapters',{title:'Capítulo 01',actId:act.id,personIds:[p.id]});
  addAlias(a,p.id,{name:'Projeto Aurora',chapterId:ch.id});
  addReflection(a,p.id,{body:'Em 2021, éramos próximos.',date:'2021'});
  renameCodename(a,p.id,'Guardadora do Norte');
  assert.equal(a.people[0].aliases.length,2);
  assert.equal(a.people[0].reflections.length,1);
  assert.deepEqual(ch.personIds,[p.id]);
  linkPersonChapter(a,p.id,ch.id,false);
  assert.equal(ch.personIds.length,0);
  linkPersonChapter(a,p.id,ch.id,true);
  linkPersonChapter(a,p.id,ch.id,true);
  assert.deepEqual(ch.personIds,[p.id]);
  validateArchive(a);
});
test('Removing a person clears links but preserves memories/events',()=>{
  const a=emptyArchive(); const p=saveRecord(a,'people',{codename:'Alfa'});const act=saveRecord(a,'acts',{title:'Ato'});
  const ch=saveRecord(a,'chapters',{actId:act.id,title:'Capítulo',personIds:[p.id]});
  const memory=saveRecord(a,'memories',{title:'Primeira lembrança',chapterId:ch.id,personIds:[p.id]});
  deleteRecord(a,'people',p.id);assert.equal(a.memories[0].id,memory.id);assert.deepEqual(a.memories[0].personIds,[]);assert.deepEqual(ch.personIds,[]);validateArchive(a);
  assert.throws(()=>deleteRecord(a,'acts',act.id),/contém capítulos/);
  deleteRecord(a,'chapters',ch.id);assert.equal(a.memories[0].chapterId,null);deleteRecord(a,'acts',act.id);validateArchive(a);
});
test('Rejects invalid and corrupted archive structures',()=>{
  const a=emptyArchive();a.people.push({id:'p1',codename:'A',code:'P-001',codeHistory:[],aliases:[],reflections:[]});
  assert.equal(validateArchive(a),true);
  a.people.push({...a.people[0],id:'p2',code:'p-001'});
  assert.throws(()=>validateArchive(a),/duplicado/);
  a.people.pop();a.schemaVersion=99;
  assert.throws(()=>validateArchive(a),/incompatível/);
});
test('Rejects remote avatar URLs during import validation',()=>{
  const a=emptyArchive();saveRecord(a,'people',{codename:'Exemplo'});a.people[0].avatar='https://attacker.example/collect';
  assert.throws(()=>validateArchive(a),/Avatar inválido/);
});
test('Fictional dataset is self-consistent and has no real identities',()=>{
  const d=makeFictionalDemo();assert.equal(d.people.length,2);assert.equal(d.acts.length,1);
  assert.equal(d.chapters.length,1);assert.equal(d.events.length,1);assert.equal(d.missions.length,1);assert.equal(d.memories.length,1);assert.equal(validateArchive(d),true);
});
