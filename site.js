/* Shared public-site behavior and Supabase data access. */
window.FidaData = (() => {
  const configured = () => window.FIDA_SUPABASE_URL?.startsWith('https://') && !window.FIDA_SUPABASE_ANON_KEY?.startsWith('PASTE_');
  const client = () => configured() && window.supabase ? window.supabase.createClient(window.FIDA_SUPABASE_URL, window.FIDA_SUPABASE_ANON_KEY) : null;
  const fallbackProducts = [
    { name: 'Nylon Monofilament', category: 'Monofilament Yarn', slug: 'monofilament-yarn', description: 'Precision-drawn monofilament yarn, 0.10mm to 1.00mm, for fishing lines and technical nets.', material: 'Nylon', image: 'Monofilament Yarn Green.jpg', image2: 'Monofilament Yarn Blue.jpg' },
    { name: 'Nylon Hanks', category: 'Hanks', slug: 'hanks', description: 'Hank-wound monofilament, ready for the trade and hand-net makers.', material: 'Nylon', image: 'Nylon Hanks.jpg', image2: 'Nylon Hanks Stacked.jpg' },
    { name: 'Multifilament Fishing Net', category: 'Fishing Nets', slug: 'multifilament-fishing-net', description: 'Reliable, durable netting for commercial fishing.', material: 'Nylon', image: 'Multifilament Fishing Net.jpg', image2: 'Multifilament Fishing Net.jpg' }
  ];
  function normalizeProduct(p) { return { ...p, image: p.image || p.image_url || null, image2: p.image2 || p.image2_url || null }; }
  function imgSrc(value, name) { const v = value || `${name}.jpg`; return /^https?:\/\//i.test(v) ? v : `asserts/${v}`; }
  async function products() { const db = client(); if (!db) return fallbackProducts; const { data, error } = await db.from('products').select('*').eq('is_published', true).order('name'); return error ? fallbackProducts : data.map(normalizeProduct); }
  async function product(slug) { const list = await products(); return list.find(item => item.slug === slug) || list[0]; }
  /* Enquiries now live in Firebase Firestore (see firebase-config.js). Products stay on Supabase. */
  async function createEnquiry(payload) { const record = { ...payload, status: 'new', source: location.pathname, created_at: new Date().toISOString() };
    const fs = window.FidaFirestore;
    if (fs) { try { await fs.collection('enquiries').add(record); return { remote: true }; } catch (err) { console.error('Firestore enquiry save failed:', err); } }
    const stored = JSON.parse(localStorage.getItem('fida-enquiries') || '[]'); stored.push({ ...record, id: crypto.randomUUID?.() || Date.now().toString() }); localStorage.setItem('fida-enquiries', JSON.stringify(stored)); return { remote: false }; }
  async function enquiries() { const fs = window.FidaFirestore;
    if (fs) { try { const snap = await fs.collection('enquiries').orderBy('created_at', 'desc').get(); return { list: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })), remote: true }; } catch (err) { console.error('Firestore enquiries fetch failed:', err); } }
    const stored = JSON.parse(localStorage.getItem('fida-enquiries') || '[]'); stored.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt)); return { list: stored, remote: false }; }
  async function deleteEnquiry(id) { const fs = window.FidaFirestore;
    if (fs) { try { await fs.collection('enquiries').doc(id).delete(); return true; } catch (err) { console.error('Firestore enquiry delete failed:', err); } }
    const stored = JSON.parse(localStorage.getItem('fida-enquiries') || '[]'); localStorage.setItem('fida-enquiries', JSON.stringify(stored.filter(e => e.id !== id))); return true; }
  async function allProducts() { const db = client(); if (!db) return { list: [], remote: false }; const { data, error } = await db.from('products').select('*').order('name'); return error ? { list: [], remote: false, error } : { list: data, remote: true }; }
  async function saveProduct(payload) { const db = client(); if (!db) return { error: 'Supabase not connected' };
    const record = { ...payload }; const id = record.id; delete record.id;
    const { error } = id ? await db.from('products').update(record).eq('id', id) : await db.from('products').insert(record);
    return { error }; }
  async function deleteProduct(id) { const db = client(); if (!db) return { error: 'Supabase not connected' }; const { error } = await db.from('products').delete().eq('id', id); return { error }; }
  async function uploadImage(file) { const db = client(); if (!db) return { error: 'Supabase not connected' };
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await db.storage.from('product-images').upload(path, file, { upsert: false, cacheControl: '3600' });
    if (error) return { error };
    const { data } = db.storage.from('product-images').getPublicUrl(path);
    return { url: data.publicUrl }; }
  return { configured, products, product, createEnquiry, enquiries, deleteEnquiry, allProducts, saveProduct, deleteProduct, uploadImage, imgSrc };
})();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(element => element.textContent = new Date().getFullYear());
  const menu = document.querySelector('[data-menu]');
  document.querySelector('[data-menu-toggle]')?.addEventListener('click', () => menu?.classList.toggle('open'));
  document.querySelectorAll('.enquiry-form').forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault(); const submit = form.querySelector('button[type=submit]'); submit.disabled = true; submit.textContent = 'Sending…';
    await FidaData.createEnquiry(Object.fromEntries(new FormData(form).entries()));
    form.hidden = true; form.parentElement.querySelector('.form-success').hidden = false;
  }));
});