/* Shared public-site behavior and Supabase data access. */
window.FidaData = (() => {
  const configured = () => window.FIDA_SUPABASE_URL?.startsWith('https://') && !window.FIDA_SUPABASE_ANON_KEY?.startsWith('PASTE_');
  const client = () => configured() && window.supabase ? window.supabase.createClient(window.FIDA_SUPABASE_URL, window.FIDA_SUPABASE_ANON_KEY) : null;
  const fallbackProducts = [
    { name: 'Nylon Monofilament', category: 'Monofilament Yarn', slug: 'monofilament-yarn', description: 'Precision-drawn monofilament yarn, 0.10mm to 1.00mm, for fishing lines and technical nets.', material: 'Nylon', image: 'Monofilament Yarn Green.jpg', image2: 'Monofilament Yarn Blue.jpg' },
    { name: 'Nylon Hanks', category: 'Hanks', slug: 'hanks', description: 'Hank-wound monofilament, ready for the trade and hand-net makers.', material: 'Nylon', image: 'Nylon Hanks.jpg', image2: 'Nylon Hanks Stacked.jpg' },
    { name: 'Multifilament Fishing Net', category: 'Fishing Nets', slug: 'multifilament-fishing-net', description: 'Reliable, durable netting for commercial fishing.', material: 'Nylon', image: 'Multifilament Fishing Net.jpg', image2: 'Multifilament Fishing Net.jpg' }
  ];
  async function products() { const db = client(); if (!db) return fallbackProducts; const { data, error } = await db.from('products').select('*').eq('is_published', true).order('name'); return error ? fallbackProducts : data; }
  async function product(slug) { const list = await products(); return list.find(item => item.slug === slug) || list[0]; }
  async function createEnquiry(payload) { const record = { ...payload, status: 'new', source: location.pathname, created_at: new Date().toISOString() }; const db = client(); if (db) { const { error } = await db.from('enquiries').insert(record); if (!error) return { remote: true }; }
    const stored = JSON.parse(localStorage.getItem('fida-enquiries') || '[]'); stored.push({ ...record, id: crypto.randomUUID?.() || Date.now().toString() }); localStorage.setItem('fida-enquiries', JSON.stringify(stored)); return { remote: false }; }
  return { configured, products, product, createEnquiry };
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