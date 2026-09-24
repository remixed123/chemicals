// Category filter + search for the product table
(function () {
  const rows = Array.from(document.querySelectorAll('#productTable tbody tr'));
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.category-card');
  const search = document.getElementById('search');
  const count = document.getElementById('resultCount');
  const noResults = document.getElementById('noResults');
  let category = 'all';

  function apply() {
    const term = search.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach(row => {
      const matchCat = category === 'all' || row.dataset.category === category;
      const matchText = !term || row.textContent.toLowerCase().includes(term);
      const visible = matchCat && matchText;
      row.hidden = !visible;
      if (visible) shown++;
    });
    count.textContent = `Showing ${shown} of ${rows.length} products`;
    noResults.hidden = shown !== 0;
  }

  function setCategory(value) {
    category = value;
    chips.forEach(c => c.classList.toggle('active', c.dataset.filter === value));
    cards.forEach(c => c.classList.toggle('active', c.dataset.filter === value));
    apply();
  }

  chips.forEach(c => c.addEventListener('click', () => setCategory(c.dataset.filter)));
  cards.forEach(c => c.addEventListener('click', () => {
    setCategory(category === c.dataset.filter ? 'all' : c.dataset.filter);
    document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth' });
  }));
  search.addEventListener('input', apply);

  // Product number lookup – exact match on product number only
  const lookupForm = document.getElementById('lookupForm');
  const lookupInput = document.getElementById('lookupInput');
  const lookupResult = document.getElementById('lookupResult');
  const LABELS = ['Category', 'Formula / Active', 'CAS No.', 'Strength', 'SG @ 20°C', 'pH', 'DG Class', 'Packaging'];

  const productNo = row => row.querySelector('.pn a').textContent.trim();

  // Product numbers are 6 digits starting with 100, e.g. 100345.
  // Accepts spaces/dashes ("100 345", "100-345") and the short form "345".
  function normalise(value) {
    const digits = value.replace(/[^0-9]/g, '');
    return digits.length === 3 ? '100' + digits : digits;
  }

  function showProduct(row) {
    const cells = row.cells;
    const code = productNo(row);
    const name = cells[1].querySelector('strong').innerHTML;
    const use = cells[1].querySelector('small').innerHTML;
    const details = LABELS.map((label, i) =>
      `<div class="lr-item"><span class="lr-label">${label}</span><div>${cells[i + 2].innerHTML}</div></div>`).join('');

    lookupResult.innerHTML = `
      <div class="lr-head">
        <div class="lr-code">${code}</div>
        <div class="lr-name"><strong>${name}</strong><small>${use}</small></div>
        <button type="button" class="lr-close">&times; Clear</button>
      </div>
      <div class="lr-grid">${details}</div>
      <div class="lr-actions">
        <a href="#" class="btn btn-primary">Request a Quote</a>
        <a href="#" class="btn btn-outline">Download SDS</a>
        <a href="#" class="btn btn-outline">Download TDS</a>
        <a href="#" class="btn btn-outline lr-show">Show in Catalogue</a>
      </div>`;
    lookupResult.hidden = false;

    lookupResult.querySelector('.lr-show').addEventListener('click', e => {
      e.preventDefault();
      search.value = code;
      setCategory('all');
      row.classList.remove('flash');
      void row.offsetWidth;
      row.classList.add('flash');
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function showNotFound(code) {
    const prefix = code.slice(0, 4); // "100" + type digit, e.g. "1003" = chlorine
    const similar = code.length >= 4 ? rows.map(productNo).filter(pn => pn.startsWith(prefix)).slice(0, 6) : [];
    lookupResult.innerHTML = `
      <div class="lr-empty">
        <strong>No product found for ${code || 'that entry'}.</strong>
        Check the number and try again.
        ${similar.length ? `<p class="suggest">Did you mean: ${similar.map(pn => `<a data-pn="${pn}">${pn}</a>`).join('')}</p>` : ''}
      </div>`;
    lookupResult.hidden = false;
    lookupResult.querySelectorAll('[data-pn]').forEach(a => a.addEventListener('click', () => {
      lookupInput.value = a.dataset.pn;
      lookup();
    }));
  }

  function lookup() {
    const code = normalise(lookupInput.value);
    const row = rows.find(r => productNo(r) === code);
    row ? showProduct(row) : showNotFound(code);
  }

  lookupForm.addEventListener('submit', e => { e.preventDefault(); lookup(); });
  lookupResult.addEventListener('click', e => {
    if (e.target.closest('.lr-close')) {
      lookupResult.hidden = true;
      lookupInput.value = '';
      lookupInput.focus();
    }
  });

  // Deep link support, e.g. index.html?pn=100345
  const initial = new URLSearchParams(location.search).get('pn');
  if (initial) {
    lookupInput.value = normalise(initial);
    lookup();
  }
})();
