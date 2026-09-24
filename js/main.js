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
})();
