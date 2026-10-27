import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyArchive,saveRecord,addRelationshipEntry,chartPoints,snapshotAt,compareSnapshots,saveConnection,removeConnection,correctRelationshipEntry,validateArchive,migrateArchive,deleteRecord} from '../lib/model.js';
import {encryptedBackup,parseBackup,plainBackup} from '../lib/backup.js';

function fixture(){const a=emptyArchive(),p=saveRecord(a,'people',{codename:'Primeira pessoa'}),q=saveRecord(a,'people',{codename:'Segunda pessoa'});return {a,p,q};}
test('Historically dated points are sorted by date; unknown values never become zeros',()=>{
 const {a,p}=fixture();
 addRelationshipEntry(a,p.id,{date:'2026-05-25',self:65,other:'',kind:'Neutro',note:'meio'});
 addRelationshipEntry(a,p.id,{date:'2025-03-17',self:35,other:55,kind:'Reflexão',note:'antigo — registrado depois'});
 addRelationshipEntry(a,p.id,{date:'2026-05-25',self:80,other:null,kind:'Positivo',note:'mesmo dia'});
 const points=chartPoints(p);assert.deepEqual(points.map(x=>x.self),[35,65,80]);
 assert.equal(points[0].other,55);assert.equal(points[1].other,null);
 assert.equal(snapshotAt(p,'2025-01-01'),null);
 assert.equal(snapshotAt(p,'2025-06-01')?.self,35);
 assert.equal(snapshotAt(p,'2026-05-25')?.self,80);
 assert.deepEqual([compareSnapshots(p,'2025-03-17','2026-05-25').selfDelta,compareSnapshots(p,'2025-03-17','2026-05-25').otherDelta],[45,null]);
 assert.throws(()=>snapshotAt(p,'2026-02-30'),/válida/);
 assert.equal(validateArchive(a),true);
});
test('Bidirectional connections can be created, edited, deleted, and cannot duplicate',()=>{
 const {a,p,q}=fixture();
 const c=saveConnection(a,{personA:p.id,personB:q.id,kind:'Amizade',note:'Exemplo subjetivo',period:'Ensino médio'});
 assert.equal(a.connections.length,1);
 assert.equal(a.connections.filter(c=>[c.personA,c.personB].includes(p.id)).length,1);
 assert.equal(a.connections.filter(c=>[c.personA,c.personB].includes(q.id)).length,1);
 assert.throws(()=>saveConnection(a,{personA:q.id,personB:p.id,kind:'Amizade'}),/já foi/);
 assert.throws(()=>saveConnection(a,{personA:p.id,personB:p.id,kind:'Amizade'}),/diferentes/);
 saveConnection(a,{personA:p.id,personB:q.id,kind:'Mentoria',period:'Hoje'},c.id);
 assert.equal(a.connections[0].kind,'Mentoria');assert.equal(validateArchive(a),true);
 removeConnection(a,c.id);assert.equal(a.connections.length,0);assert.equal(validateArchive(a),true);
});
test('Deleting a person removes both ends of related links safely',()=>{
 const {a,p,q}=fixture();saveConnection(a,{personA:p.id,personB:q.id,kind:'Família'});
 deleteRecord(a,'people',p.id);assert.deepEqual(a.connections,[]);assert.equal(validateArchive(a),true);
});
test('Audit correction retains originals, shifts forward links and updates current estimate',()=>{
 const {a,p}=fixture();
 const earlier=addRelationshipEntry(a,p.id,{date:'2020-02-03',self:25,other:35,note:'registro 1'});
 const later=addRelationshipEntry(a,p.id,{date:'2022-05-01',self:65,other:70,note:'registro 2'});
 const rev=correctRelationshipEntry(a,p.id,earlier.id,{date:'2020-02-04',self:33,other:44,note:'corrigido',reason:'anotação antiga'});
 assert.equal(rev.revisions.length,1);assert.equal(rev.revisions[0].previous.self,25);
 assert.equal(rev.revisions[0].previous.date,'2020-02-03');
 assert.equal(later.fromSelf,33);assert.equal(later.fromOther,44);
 assert.equal(p.closenessSelf,65);assert.equal(validateArchive(a),true);
 assert.throws(()=>correctRelationshipEntry(a,p.id,earlier.id,{date:'2020-02-04',self:33,other:44,note:'corrigido',reason:''}),/Explique/);
});
test('Legacy schema 2 migrates to 3 preserving IDs and all history, including encrypted backup',async()=>{
 const {a,p,q}=fixture();const event=saveRecord(a,'events',{title:'Encontro',personIds:[p.id,q.id]});
 addRelationshipEntry(a,p.id,{date:'2018-09-09',self:58,other:21,eventId:event.id,note:'Uma conversa'});
 const old=structuredClone(a);old.schemaVersion=2;delete old.connections;
 for(const person of old.people)for(const h of person.relationshipHistory)delete h.revisions;
 assert.equal(validateArchive(old),true);
 const migrated=migrateArchive(old);assert.equal(migrated.schemaVersion,3);
 assert.equal(migrated.people[0].id,p.id);assert.equal(migrated.people[0].relationshipHistory[0].eventId,event.id);
 assert.deepEqual(migrated.connections,[]);assert.deepEqual(migrated.people[0].relationshipHistory[0].revisions,[]);
 const restored=await parseBackup(plainBackup(old));assert.equal(validateArchive(restored),true);
 const encrypted=await encryptedBackup(migrated,'test-password123');const roundtrip=await parseBackup(encrypted,'test-password123');assert.deepEqual(roundtrip,migrated);
});
test('Rejects corrupt or orphaned connections and revisions on import',()=>{
 const {a,p,q}=fixture();const c=saveConnection(a,{personA:p.id,personB:q.id,kind:'Trabalho'});
 a.connections[0].personB='missing';assert.throws(()=>validateArchive(a),/Vínculo de pessoas inválido/);
 a.connections[0].personB=q.id;
 addRelationshipEntry(a,p.id,{date:'2024-01-01',self:24,other:20,note:'histórico'});
 p.relationshipHistory[0].revisions='bad';assert.throws(()=>validateArchive(a),/Histórico de correções inválido/);
});
test('Narrative groups save participants bidirectionally and audit edited membership',async()=>{
 const {saveGroup,removeGroup}=await import('../lib/model.js');
 const {a,p,q}=fixture();
 const group=saveGroup(a,{name:'Clube Fictício',description:'Colégio imaginário',period:'2018',memberIds:[p.id]});
 assert.equal(a.groups.length,1);assert.deepEqual(group.memberIds,[p.id]);
 saveGroup(a,{name:'Clube Fictício',description:'Versão nova',period:'2019',memberIds:[p.id,q.id]},group.id);
 assert.equal(group.revisions.length,0,'Existing object is replaced, not mutated');
 assert.equal(a.groups[0].revisions[0].previous.description,'Colégio imaginário');
 assert.deepEqual(a.groups[0].memberIds,[p.id,q.id]);
 assert.equal(validateArchive(a),true);
 assert.throws(()=>saveGroup(a,{name:'Clube Fictício',memberIds:[]}),/Já existe/);
 deleteRecord(a,'people',q.id);assert.deepEqual(a.groups[0].memberIds,[p.id]);
 assert.equal(validateArchive(a),true);
 removeGroup(a,group.id);assert.deepEqual(a.groups,[]);
});
test('Entries with unknown dates remain usable but are excluded from time graphs',()=>{
 const {a,p}=fixture();
 addRelationshipEntry(a,p.id,{self:43,other:55,date:'',note:'Sem data certa'});
 assert.equal(chartPoints(p).length,0);
 assert.equal(p.closenessSelf,43);
 assert.throws(()=>addRelationshipEntry(a,p.id,{self:42,other:54,date:'2025-02-30'}),/Data inválida/);
 assert.equal(validateArchive(a),true);
});
