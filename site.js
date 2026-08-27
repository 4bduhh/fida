/* Shared public-site behavior and Supabase data access. */
window.FidaData = (() => {
  const configured = () => window.FIDA_SUPABASE_URL?.startsWith('https://') && !window.FIDA_SUPABASE_ANON_KEY?.startsWith('PASTE_');
  const client = () => configured() && window.supabase ? window.supabase.createClient(window.FIDA_SUPABASE_URL, window.FIDA_SUPABASE_ANON_KEY) : null;
  const fallbackProducts = [
    { name: 'Nylon Monofilament', category: 'Filaments', slug: 'nylon-monofilament', description: 'Single-strand, high-strength filament for demanding netting.', material: 'Nylon' },
    { name: 'Multifilament Fishing Net', category: 'Fishing Nets', slug: 'multifilament-fishing-net', description: 'Reliable, durable netting for commercial fishing.', material: 'Nylon' },
    { name: 'HDPE Aquaculture Net', category: 'Aquaculture Nets', slug: 'hdpe-aquaculture-net', description: 'Outdoor-ready containment for fish and shrimp farms.', material: 'HDPE' },
    { name: 'Marine PP Rope', category: 'Ropes & Twines', slug: 'marine-pp-rope', description: 'Lightweight rope engineered for hard marine use.', material: 'Polypropylene' },
    { name: 'Agricultural Shade Net', category: 'Industrial Nets', slug: 'agricultural-shade-net', description: 'Protection that helps crops flourish.', material: 'HDPE' },
    { name: 'UV-Stabilized Filament', category: 'Accessories & Specialty', slug: 'uv-stabilized-filament', description: 'Custom performance for outdoor applications.', material: 'Polymer' }
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
