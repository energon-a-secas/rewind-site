const ENC_ALGO = 'AES-GCM';
const KEY_ALGO = 'PBKDF2';
const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf;
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const material = await crypto.subtle.importKey(
    'raw', enc.encode(password), KEY_ALGO, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: KEY_ALGO, salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: ENC_ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(data, password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: ENC_ALGO, iv },
    key,
    enc.encode(JSON.stringify(data))
  );
  return {
    version: 1,
    encrypted: true,
    iv: bufToBase64(iv),
    salt: bufToBase64(salt),
    data: bufToBase64(ciphertext)
  };
}

export async function decrypt(envelope, password) {
  const salt = base64ToBuf(envelope.salt);
  const iv = base64ToBuf(envelope.iv);
  const ciphertext = base64ToBuf(envelope.data);
  const key = await deriveKey(password, salt);
  const plainBuf = await crypto.subtle.decrypt(
    { name: ENC_ALGO, iv },
    key,
    ciphertext
  );
  const dec = new TextDecoder();
  return JSON.parse(dec.decode(plainBuf));
}

export function isEncrypted(obj) {
  return obj && obj.encrypted === true && obj.version === 1;
}
