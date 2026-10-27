import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyArchive, saveRecord } from '../lib/model.js';
import { plainBackup, encryptedBackup, parseBackup } from '../lib/backup.js';
test('Unencrypted backup round-trip preserves records', async()=>{
  const a=emptyArchive();saveRecord(a,'people',{codename:'A Raposa',code:'SCP-015'});
  const parsed=await parseBackup(plainBackup(a));assert.deepEqual(parsed,a);
  await assert.rejects(()=>parseBackup('{"private":1}'),/compatível/);
});
test('Password-protected backup decrypts with right password and fails safely otherwise',async()=>{
  const a=emptyArchive();saveRecord(a,'people',{codename:'A Cartógrafa'});
  const output=await encryptedBackup(a,'uma senha forte 123');
  assert.equal(output.includes('Cartógrafa'),false);
  const decoded=await parseBackup(output,'uma senha forte 123');assert.deepEqual(decoded,a);
  await assert.rejects(()=>parseBackup(output,'senha errada'),/incorreta/);
  await assert.rejects(()=>encryptedBackup(a,'1234'),/8 caracteres/);
});
