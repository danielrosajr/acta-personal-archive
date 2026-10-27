import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyArchive, saveRecord, addRelationshipEntry, removeRelationshipEntry, migrateArchive, validateArchive, personColor, upcomingBirthdays, saveCategoryColors, nextCode, normalizeBirthday} from '../lib/model.js';
import {plainBackup, encryptedBackup, parseBackup} from '../lib/backup.js';
import {searchArchive} from '../lib/search.js';

test('Categories choose one primary color while retaining multiple relationships',()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'Luz',categories:['Família','Relacionamento'],primaryCategory:'Relacionamento',colorMode:'category'});
 assert.deepEqual(p.categories,['Família','Relacionamento']);
 assert.equal(personColor(a,p),a.settings.categoryColors.Relacionamento);
 saveCategoryColors(a,{Relacionamento:'#123456'});
 assert.equal(personColor(a,p),'#123456');
 assert.equal(validateArchive(a),true);
 assert.throws(()=>saveCategoryColors(a,{'Família':'red'}),/Cor/);
});
test('Preserves existing person when editing and changing principal color category',()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'A Raposa',categories:['Amizade'],primaryCategory:'Amizade',birthDate:'05-23',archetypes:['Yotunt'],perceptionTags:['Pessoa de luz']});
 const code=p.code;
 addRelationshipEntry(a,p.id,{self:'56,7',other:'44',kind:'Positivo',note:'Ajuda pontual.'});
 saveRecord(a,'people',{...p,codename:'A Raposa',categories:['Amizade','Família'],primaryCategory:'Família'},p.id);
 const changed=a.people[0];assert.equal(changed.code,code);assert.equal(changed.closenessSelf,56.7);assert.equal(changed.relationshipHistory.length,1);assert.equal(changed.birthDate,'05-23');assert.equal(personColor(a,changed),a.settings.categoryColors.Família);
 assert.equal(validateArchive(a),true);
});
test('Birth dates allow uncertain year but reject invalid dates and render reminders',()=>{
 const a=emptyArchive();saveRecord(a,'people',{codename:'Pessoa 1',birthDate:'11-02'});saveRecord(a,'people',{codename:'Pessoa 2',birthDate:'2000-11-03'});
 assert.equal(normalizeBirthday('02-29'),'02-29');
 assert.throws(()=>normalizeBirthday('2025-02-29'),/impossível/);
 assert.throws(()=>normalizeBirthday('13-31'),/impossível/);
 const list=upcomingBirthdays(a,new Date(2026,9,26),10);
 assert.equal(list.length,2);assert.equal(list[0].days,7);assert.equal(list[1].age,26);
});
test('Subjective tags, original personal archetype names, codes and notes are searchable',()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'A Cartógrafa',code:'ARK-010',categories:['Amizade'],archetypes:['Chiteyavs'],perceptionTags:['Relação desgastante']});
 addRelationshipEntry(a,p.id,{self:12,other:24,note:'Uma conversa sobre limites pessoais',kind:'Reflexão'});
 assert.equal(searchArchive(a,'Chiteyavs','people')[0].item.id,p.id);
 assert.equal(searchArchive(a,'desgastante','people')[0].item.id,p.id);
 assert.equal(searchArchive(a,'limites pessoais','people')[0].item.id,p.id);
 assert.equal(validateArchive(a),true);
});
test('Relationship history records both estimates, ups and downs, and additional events',()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'O Faroleiro'});
 const memory=saveRecord(a,'memories',{title:'Uma boa conversa',personIds:[p.id]});
 addRelationshipEntry(a,p.id,{self:44,other:30,kind:'Positivo',note:'Começamos a conversar.',memoryId:memory.id});
 addRelationshipEntry(a,p.id,{self:'56.7',other:'44',kind:'Positivo',note:'Ajudou-me.'});
 addRelationshipEntry(a,p.id,{self:'56,7',other:44,kind:'Negativo',note:'Tivemos uma divergência.'});
 assert.deepEqual(a.people[0].relationshipHistory.map(e=>e.self),[44,56.7,56.7]);
 assert.equal(a.people[0].relationshipHistory[1].fromSelf,44);
 assert.equal(a.people[0].relationshipHistory[0].memoryId,memory.id);
 assert.equal(validateArchive(a),true);
 assert.throws(()=>addRelationshipEntry(a,p.id,{self:101,other:44,note:'erro'}),/porcentagens/);
 assert.throws(()=>addRelationshipEntry(a,p.id,{self:56.7,other:44}),/alteração/);
 const last=a.people[0].relationshipHistory.at(-1);
 removeRelationshipEntry(a,p.id,last.id);
 assert.equal(a.people[0].closenessSelf,56.7);
 assert.equal(validateArchive(a),true);
});
test('Linked memory deletion clears the relationship reference without losing the entry',async()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'Pessoa'});const m=saveRecord(a,'memories',{title:'Lembrança',personIds:[p.id]});
 addRelationshipEntry(a,p.id,{self:12,note:'Referência',memoryId:m.id});
 const {deleteRecord}=await import('../lib/model.js');
 deleteRecord(a,'memories',m.id);
 assert.equal(a.people[0].relationshipHistory[0].memoryId,null);assert.equal(validateArchive(a),true);
});
test('Migrates legacy 0.1 archive and imports its unencrypted backup',async()=>{
 const a=emptyArchive();saveRecord(a,'people',{code:'SCP-015',codename:'Uma pessoa',categories:['Família']});
 delete a.people[0].birthDate;delete a.people[0].closenessSelf;delete a.people[0].closenessOther;delete a.people[0].relationshipHistory;delete a.people[0].primaryCategory;delete a.people[0].archetypes;delete a.people[0].perceptionTags;delete a.people[0].colorMode;
 a.schemaVersion=1;delete a.settings.categoryColors;delete a.settings.birthdayDays;delete a.settings.archetypes;delete a.settings.perceptionTags;
 assert.equal(validateArchive(a),true);
 const converted=migrateArchive(a);
 assert.equal(converted.schemaVersion,2);assert.equal(converted.people[0].code,'SCP-015');assert.equal(converted.people[0].colorMode,'custom');assert.equal(converted.people[0].primaryCategory,'Família');assert.equal(validateArchive(converted),true);
 const fromBackup=await parseBackup(plainBackup(a));assert.equal(fromBackup.schemaVersion,2);
});
test('Encrypted backup contains full history and cannot be decrypted with wrong password',async()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'A Raposa',birthDate:'04-19',perceptionTags:['Amizade']});addRelationshipEntry(a,p.id,{self:'48.1',other:'33.9',note:'Um acontecimento privado'});
 const file=await encryptedBackup(a,'password-for-test');assert.equal(file.includes('acontecimento privado'),false);
 const restored=await parseBackup(file,'password-for-test');assert.deepEqual(restored,a);
 await assert.rejects(parseBackup(file,'wrong-password'),/incorreta/);
});
test('Version 2 archive rejects corrupt or contradictory historical chains',()=>{
 const a=emptyArchive();const p=saveRecord(a,'people',{codename:'Validado'});addRelationshipEntry(a,p.id,{self:10,other:20,note:'Primeiro'});
 a.people[0].closenessSelf=99;
 assert.throws(()=>validateArchive(a),/divergentes/);
});
