import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyArchive, saveRecord, addAlias } from '../lib/model.js';
import { searchArchive } from '../lib/search.js';
test('Searches name, case-insensitive historical code, aliases, memories and title',()=>{
  const a=emptyArchive();const p=saveRecord(a,'people',{codename:'A Raposa',code:'SCP-015'});
  addAlias(a,p.id,{name:'Projeto Aurora'});
  saveRecord(a,'people',{...p,code:'ARK-015'},p.id);
  const act=saveRecord(a,'acts',{title:'Infância'});
  const ch=saveRecord(a,'chapters',{title:'Grande Descoberta',actId:act.id});
  saveRecord(a,'memories',{title:'O dia do trem',body:'Na estação, encontramos a bússola.',chapterId:ch.id,personIds:[p.id]});
  for(const q of ['scp-015','ARK-015','raposa','Aurora','projeto aurora'])assert.equal(searchArchive(a,q,'people')[0].item.id,p.id);
  assert.equal(searchArchive(a,'BÚSSOLA')[0].type,'memories');
  assert.equal(searchArchive(a,'grande descoberta')[0].type,'chapters');
  assert.equal(searchArchive(a,'nome inexistente').length,0);
});
