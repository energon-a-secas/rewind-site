import { encrypt, decrypt, isEncrypted } from './crypto.js';
import { addProtocol } from './protocols.js';
import { save } from './state.js';
import { toast, uid } from './utils.js';

export function exportPlain(protocol) {
  const data = { version: 1, encrypted: false, protocol };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, slugify(protocol.name) + '.failsafe.json');
  toast('Protocol exported');
}

export async function exportEncrypted(protocol, password) {
  const envelope = await encrypt(protocol, password);
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  downloadBlob(blob, slugify(protocol.name) + '.failsafe.json');
  toast('Encrypted protocol exported');
}

export function exportUrl(protocol) {
  const encoded = btoa(encodeURIComponent(JSON.stringify(protocol)));
  const url = window.location.origin + window.location.pathname + '#p=' + encoded;
  if (url.length > 8000) {
    toast('Protocol too large for URL sharing, use file export instead');
    return null;
  }
  navigator.clipboard.writeText(url).then(() => toast('URL copied to clipboard'));
  return url;
}

export async function importFromFile(file, state, passwordFn) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    toast('Invalid JSON file');
    return false;
  }
  return importData(data, state, passwordFn);
}

export async function importData(data, state, passwordFn) {
  if (isEncrypted(data)) {
    const password = await passwordFn();
    if (!password) return false;
    try {
      const protocol = await decrypt(data, password);
      return insertProtocol(protocol, state);
    } catch {
      toast('Wrong password or corrupt file');
      return false;
    }
  }
  if (data.protocol) {
    return insertProtocol(data.protocol, state);
  }
  if (data.id && data.steps) {
    return insertProtocol(data, state);
  }
  toast('Unrecognized file format');
  return false;
}

function insertProtocol(proto, state) {
  proto.id = uid();
  proto.createdAt = proto.createdAt || new Date().toISOString();
  proto.updatedAt = new Date().toISOString();
  reassignIds(proto);
  addProtocol(state, proto);
  save(state);
  toast('Protocol imported');
  return true;
}

function reassignIds(proto) {
  proto.steps.forEach(st => {
    st.id = uid();
    (st.contacts || []).forEach(c => { c.id = uid(); });
    (st.resources || []).forEach(r => { r.id = uid(); });
  });
  (proto.triggers || []).forEach(t => { t.id = uid(); });
}

export function checkUrlImport(state) {
  const hash = window.location.hash;
  if (!hash.startsWith('#p=')) return;
  try {
    const encoded = hash.slice(3);
    const json = decodeURIComponent(atob(encoded));
    const proto = JSON.parse(json);
    insertProtocol(proto, state);
    window.history.replaceState(null, '', window.location.pathname);
  } catch {
    toast('Could not parse protocol from URL');
  }
}

export async function importFromUrl(urlStr, state, passwordFn) {
  try {
    const url = new URL(urlStr);
    const hash = url.hash;
    if (hash.startsWith('#p=')) {
      const encoded = hash.slice(3);
      const json = decodeURIComponent(atob(encoded));
      const proto = JSON.parse(json);
      insertProtocol(proto, state);
      return true;
    }
  } catch { /* fall through */ }
  toast('Invalid Failsafe URL');
  return false;
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function slugify(str) {
  return (str || 'protocol').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
