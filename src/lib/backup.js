import { validateArchive } from './model.js';
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const ROUNDS = 310000;
const hexBytes = (bytes) => Array.from(bytes).map(n => n.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => {
  if (typeof hex !== 'string' || !/^(?:[0-9a-fA-F]{2})+$/.test(hex)) throw new Error('Backup criptografado inválido.');
  return Uint8Array.from(hex.match(/.{2}/g), x => parseInt(x, 16));
};
async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt']);
}
export function plainBackup(data) {
  validateArchive(data);
  return JSON.stringify({ actaBackup: 1, encrypted: false, archive: data }, null, 2);
}
export async function encryptedBackup(data, password) {
  validateArchive(data);
  if (typeof password !== 'string' || password.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(password, salt, ROUNDS);
  const content = encoder.encode(JSON.stringify(data));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, content));
  return JSON.stringify({ actaBackup: 1, encrypted: true, kdf: 'PBKDF2-SHA256', iterations: ROUNDS, cipher: 'AES-256-GCM', salt: hexBytes(salt), iv: hexBytes(iv), data: hexBytes(ciphertext) });
}
export async function parseBackup(json, password = '') {
  let envelope;
  try { envelope = JSON.parse(json); } catch { throw new Error('O arquivo não contém JSON válido.'); }
  if (!envelope || envelope.actaBackup !== 1 || typeof envelope.encrypted !== 'boolean') throw new Error('Arquivo não é um backup ACTA compatível.');
  let data;
  if (!envelope.encrypted) data = envelope.archive;
  else {
    if (!password) throw new Error('Este backup está criptografado: informe a senha.');
    if (envelope.kdf !== 'PBKDF2-SHA256' || envelope.cipher !== 'AES-256-GCM' || !Number.isInteger(envelope.iterations) || envelope.iterations < 150000 || envelope.iterations > 1000000) throw new Error('Parâmetros de criptografia não suportados.');
    const salt = fromHex(envelope.salt), iv = fromHex(envelope.iv), content = fromHex(envelope.data);
    if (salt.length !== 16 || iv.length !== 12 || content.length < 16) throw new Error('Backup criptografado está danificado.');
    try {
      const key = await derive(password, salt, envelope.iterations);
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, content);
      data = JSON.parse(decoder.decode(plaintext));
    } catch { throw new Error('Senha incorreta ou arquivo danificado.'); }
  }
  validateArchive(data);
  return structuredClone(data);
}
