(() => {
  const { menuItems, searchItems, toggleCartItem, cartTotal } = window.KarakGhoriCatalog;
  const itemById = new Map(menuItems.map((item) => [item.id, item]));
  const heroIds = ['zinker', 'falooda', 'samosa', 'hotdog_bacon', 'chicken_wrap', 'mango_ghori'];
  const homeContinue = ['tenders', 'samosa', 'club', 'paratha', 'zinker'];
  const mustSee = ['zinker', 'hotdog_bacon', 'chicken_wrap', 'sliders', 'panini'];
  const topItems = ['zinker', 'samosa', 'falooda', 'tenders', 'mango_ghori'];
  const newItems = ['breakfast_wrap', 'drinks_collage', 'smoothie_jars', 'smoothies', 'hotdog'];
  const iceCold = ['mango_ghori', 'falooda', 'smoothie_jars'];
  const categories = ['All', ...new Set(menuItems.map((item) => item.category.split(' · ')[0]))];
  const main = document.querySelector('#app-main');
  const modalRoot = document.querySelector('#modal-root');
  const toast = document.querySelector('#toast');

  let activeTab = 'ghori';
  let heroIndex = 0;
  let cart = restoreCart();
  let searchQuery = '';
  let selectedCategory = 'All';
  let selectedItemId = null;
  let toastTimer;
  let slideTimer;

  function restoreCart() {
    try {
      const ids = JSON.parse(localStorage.getItem('karak-ghori-cart') || '[]');
      return [...new Set(ids)].map((id) => itemById.get(id)).filter(Boolean);
    } catch {
      return [];
    }
  }

  function persistCart() {
    localStorage.setItem('karak-ghori-cart', JSON.stringify(cart.map((item) => item.id)));
  }

  function price(item) { return `BHD ${(item.price / 1000).toFixed(3)}`; }
  function getItems(ids) { return ids.map((id) => itemById.get(id)).filter(Boolean); }
  function safeText(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function styleFor(item) { return `--c1:${item.colors[0]};--c2:${item.colors[1]}`; }

  function card(item, style = 'poster', rank = null) {
    const classes = ['product-card', `card--${style}`].join(' ');
    return `<article class="${classes}" style="${styleFor(item)}" data-emoji="${item.emoji}" data-open="${item.id}" tabindex="0" role="button" aria-label="Details for ${safeText(item.name)}">
      ${rank ? `<span class="card-rank">${rank}</span>` : ''}
      ${item.badge ? `<span class="card-badge">${safeText(item.badge)}</span>` : ''}
      <div class="card-content"><h3 class="card-name">${safeText(item.name)}</h3>${style === 'landscape' ? `<div class="card-category">${safeText(item.category)}</div>` : ''}<div class="price card-price">${price(item)}</div></div>
      <button class="card-add" data-action="toggle-cart" data-id="${item.id}" title="${cart.some((entry) => entry.id === item.id) ? 'Remove from' : 'Add to'} cart" aria-label="${cart.some((entry) => entry.id === item.id) ? 'Remove from' : 'Add to'} cart: ${safeText(item.name)}">${cart.some((entry) => entry.id === item.id) ? '✓' : '+'}</button>
    </article>`;
  }

  function shelf(title, ids, style = 'poster') {
    const items = getItems(ids);
    return `<section class="shelf"><h2 class="shelf-heading">${safeText(title)} <span class="arrow">›</span></h2><div class="shelf-track">${items.map((item, index) => card(item, style, style === 'ranked' ? index + 1 : null)).join('')}</div></section>`;
  }

  function hero() {
    const item = itemById.get(heroIds[heroIndex]);
    return `<section class="hero" style="--hero-a:${item.colors[1]};--hero-b:${item.colors[0]}" data-emoji="${item.emoji}">
      <div class="hero-shade"></div><div class="hero-copy">
      <span class="eyebrow">Karak Ghori original</span>
      ${item.badge ? `<span class="pill">${safeText(item.badge)}</span>` : ''}
      <h1>${safeText(item.name)}</h1><p class="hero-subtitle">${safeText(item.subtitle)}</p>
      <div class="hero-meta">${safeText(item.category)} <span aria-hidden="true">·</span> <span class="price">${price(item)}</span></div>
      <div class="hero-tagline">${safeText(item.tagline)}</div>
      <div class="hero-actions"><button class="primary-button" data-action="toggle-cart" data-id="${item.id}">${cart.some((entry) => entry.id === item.id) ? '✓ Added to cart' : `＋ &nbsp; Add · ${price(item)}`}</button><button class="secondary-button" data-open="${item.id}">View item <span aria-hidden="true">↗</span></button></div>
      </div><div class="hero-bottom"><div class="dots">${heroIds.map((id, index) => `<button class="dot ${index === heroIndex ? 'active' : ''}" data-action="hero-to" data-index="${index}" aria-label="Slide ${index + 1}"></button>`).join('')}</div><div class="slide-controls"><button data-action="hero-prev" aria-label="Previous slide">‹</button><button data-action="hero-next" aria-label="Next slide">›</button></div></div>
    </section>`;
  }

  function intro(title, subtitle) {
    return `<div class="page-intro"><h1>${safeText(title)}</h1><p>${safeText(subtitle)}</p></div>`;
  }

  function renderGhori() {
    return `${hero()}${shelf('Continue Ordering', homeContinue, 'landscape')}${shelf('Must-See Hits', mustSee)}${shelf('Top Items', topItems, 'ranked')}${shelf('New Releases', newItems)}`;
  }

  function renderHome() {
    return `${intro('Good food. Good mood.', 'A little something for every craving, made fresh at Karak Ghori.')}${shelf('Ice-Cold Cravings', iceCold, 'feature')}${shelf('Must-See Hits on Karak Ghori', mustSee)}${shelf('Continue Ordering', homeContinue, 'landscape')}`;
  }

  function renderMenu() {
    const items = selectedCategory === 'All' ? menuItems : menuItems.filter((item) => item.category.startsWith(`${selectedCategory} ·`) || item.category === selectedCategory);
    return `${intro('The Menu', 'Find your next favourite. Prices shown in BHD.')}
      <div class="category-row">${categories.map((category) => `<button class="filter-chip ${category === selectedCategory ? 'active' : ''}" data-action="category" data-category="${safeText(category)}">${safeText(category)}</button>`).join('')}</div>
      <div class="menu-grid">${items.map((item) => card(item, 'landscape')).join('')}</div>`;
  }

  function renderSearchResults() {
    const items = searchItems(searchQuery);
    return items.length ? `<div class="menu-grid">${items.map((item) => card(item, 'landscape')).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">⌕</div><h2>No matches yet</h2><p>Try a different dish, category, or ingredient.</p></div>`;
  }

  function renderSearch() {
    return `${intro('Search', 'Search dishes, categories, or ingredients.')}
      <label class="search-box"><span>⌕</span><input id="search-input" type="search" placeholder="Snacks, drinks, combos…" value="${safeText(searchQuery)}" autocomplete="off" aria-label="Search menu"></label>
      <div id="search-results">${renderSearchResults()}</div>`;
  }

  function renderCart() {
    if (!cart.length) return `${intro('Your Cart', 'A few taps away from your next favourite.')}
      <div class="empty-state"><div class="empty-icon">🛍️</div><h2>Your cart is empty</h2><p>Explore the menu and tap + on anything that looks good.</p><button class="primary-button" data-tab="menu">Browse the menu</button></div>`;
    return `${intro('Your Cart', `${cart.length} ${cart.length === 1 ? 'item' : 'items'} selected.`)}
      <div class="cart-layout"><div class="cart-list">${cart.map((item) => `<article class="cart-row"><div class="cart-thumb" style="${styleFor(item)}">${item.emoji}</div><div><h3>${safeText(item.name)}</h3><p>${safeText(item.subtitle)}</p></div><span class="price">${price(item)}</span><button class="remove-button" data-action="toggle-cart" data-id="${item.id}">Remove</button></article>`).join('')}</div>
      <aside class="summary-card"><h2>Order summary</h2><div class="summary-line"><span>Items (${cart.length})</span><span>${price({ price: cartTotal(cart) })}</span></div><div class="summary-line"><span>Pickup / delivery</span><span>Choose later</span></div><div class="summary-line summary-total"><span>Total</span><span class="price">${price({ price: cartTotal(cart) })}</span></div><button class="primary-button" data-action="checkout">Continue to order <span>→</span></button><div class="card-category" style="margin-top:12px;text-align:center">Ordering isn’t connected in this demo yet.</div></aside></div>`;
  }

  function renderMain() {
    document.querySelectorAll('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.tab === activeTab));
    const count = document.querySelector('#cart-count');
    count.textContent = String(cart.length);
    count.classList.toggle('hidden', cart.length === 0);
    main.innerHTML = activeTab === 'home' ? renderHome()
      : activeTab === 'menu' ? renderMenu()
      : activeTab === 'cart' ? renderCart()
      : activeTab === 'search' ? renderSearch()
      : renderGhori();
    clearInterval(slideTimer);
    if (activeTab === 'ghori') slideTimer = setInterval(() => { heroIndex = (heroIndex + 1) % heroIds.length; renderMain(); }, 6500);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2100);
  }

  function toggleCart(id) {
    const item = itemById.get(id);
    if (!item) return;
    const wasInCart = cart.some((entry) => entry.id === id);
    cart = toggleCartItem(cart, item);
    persistCart();
    renderMain();
    if (selectedItemId) renderModal();
    showToast(wasInCart ? `${item.name} removed from cart` : `${item.name} added to cart`);
  }

  function renderModal() {
    const item = itemById.get(selectedItemId);
    if (!item) { modalRoot.innerHTML = ''; return; }
    const related = menuItems.filter((entry) => entry.id !== item.id).slice(0, 4);
    const added = cart.some((entry) => entry.id === item.id);
    modalRoot.innerHTML = `<div class="detail-backdrop"><section class="detail-panel" role="dialog" aria-modal="true" aria-label="${safeText(item.name)} details">
      <button class="detail-close" data-action="close-detail" aria-label="Close details">×</button>
      <div class="detail-hero" style="--c1:${item.colors[0]};--c2:${item.colors[1]}"><div class="detail-copy"><span class="eyebrow">${safeText(item.category)}</span>${item.badge ? `<div class="pill" style="margin-top:10px">${safeText(item.badge)}</div>` : ''}<h1>${safeText(item.name)}</h1><p>${safeText(item.subtitle)}</p><div class="price" style="margin-top:13px">${price(item)}</div></div><div class="detail-emoji">${item.emoji}</div></div>
      <div class="detail-body"><p style="max-width:680px;color:#bec1c4;line-height:1.7;font-size:14px">${safeText(item.about)}</p><div class="detail-tags">${item.tags.map((tag) => `<span class="detail-tag">${safeText(tag)}</span>`).join('')}</div><button class="primary-button" data-action="toggle-cart" data-id="${item.id}">${added ? '✓ Added to cart · remove' : `＋ &nbsp; Add to cart · ${price(item)}`}</button><h2 class="shelf-heading" style="margin-top:30px">You might also like</h2><div class="shelf-track">${related.map((entry) => card(entry)).join('')}</div></div>
    </section></div>`;
  }

  function switchTab(tab) {
    activeTab = tab;
    selectedItemId = null;
    modalRoot.innerHTML = '';
    if (tab !== 'search') searchQuery = '';
    renderMain();
    main.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', (event) => {
    const tabButton = event.target.closest('[data-tab]');
    if (tabButton) { switchTab(tabButton.dataset.tab); return; }

    const action = event.target.closest('[data-action]');
    if (action) {
      const kind = action.dataset.action;
      if (kind === 'toggle-cart') { event.preventDefault(); event.stopPropagation(); toggleCart(action.dataset.id); }
      else if (kind === 'hero-next') { heroIndex = (heroIndex + 1) % heroIds.length; renderMain(); }
      else if (kind === 'hero-prev') { heroIndex = (heroIndex - 1 + heroIds.length) % heroIds.length; renderMain(); }
      else if (kind === 'hero-to') { heroIndex = Number(action.dataset.index) || 0; renderMain(); }
      else if (kind === 'category') { selectedCategory = action.dataset.category; renderMain(); }
      else if (kind === 'close-detail') { selectedItemId = null; modalRoot.innerHTML = ''; }
      else if (kind === 'checkout') showToast('Checkout isn’t connected yet.');
      return;
    }

    if (event.target.matches('.detail-backdrop')) { selectedItemId = null; modalRoot.innerHTML = ''; return; }
    const open = event.target.closest('[data-open]');
    if (open) { selectedItemId = open.dataset.open; renderModal(); }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && selectedItemId) { selectedItemId = null; modalRoot.innerHTML = ''; }
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open]')) { event.preventDefault(); selectedItemId = event.target.dataset.open; renderModal(); }
  });

  main.addEventListener('input', (event) => {
    if (event.target.id !== 'search-input') return;
    searchQuery = event.target.value;
    document.querySelector('#search-results').innerHTML = renderSearchResults();
  });

  renderMain();
})();
