(() => {
  const { menuItems, menuCategories, searchItems, addCartItem, setCartQuantity, cartTotal } = window.KarakGhoriCatalog;
  const { uiText, itemText } = window.KarakGhoriI18n;
  const { formatOrderMessage, buildWhatsAppUrl } = window.KarakGhoriOrder;
  const { loadStaffDesk, createStaffOrder, advanceStaffOrder } = window.KarakGhoriStaffOrders;
  const itemById = new Map(menuItems.map((item) => [item.id, item]));
  const heroIds = ['ghori-kabab', 'karak-tea', 'fresh-orange', 'chicken-burger', 'fresh-mango', 'mojito-classic'];
  const shelves = {
    samosasChapathiChef: [...menuItems.filter((item) => item.cat === 'bakery').map((item) => item.id), 'ghori-kabab'],
    hibiscusTea: menuItems.filter((item) => item.cat === 'hibiscus-tea').map((item) => item.id),
    continueOrdering: ['karak-flask-special', 'sarbath-lemon', 'club-chicken', 'malgoum-egg', 'fresh-juice-family-combo'],
    mustSee: ['ghori-kabab', 'karak-tea', 'fresh-orange', 'chicken-burger', 'mojito-classic'],
    topItems: ['ghori-kabab', 'karak-tea', 'fresh-orange', 'chicken-burger', 'fresh-mango'],
    newReleases: ['karak-flask-special', 'ghori-mango-pieces', 'club-beef', 'samosa-combo', 'mojito-strawberry'],
    iceCold: ['fresh-orange', 'mojito-classic', 'shake-mango'],
  };
  const categories = menuCategories.map((category) => category.id);
  const categoryById = new Map(menuCategories.map((category) => [category.id, category]));
  const main = document.querySelector('#app-main');
  const modalRoot = document.querySelector('#modal-root');
  const toast = document.querySelector('#toast');
  const staffDeskStorageKey = 'karak-ghori-staff-desk';

  let activeTab = 'ghori';
  let heroIndex = 0;
  let cart = restoreCart('karak-ghori-cart');
  let staffCart = [];
  let staffOrders = [];
  let staffDeskError = '';
  try {
    const staffDesk = loadStaffDesk(localStorage.getItem(staffDeskStorageKey));
    staffCart = restoreCartEntries(staffDesk.cart);
    staffOrders = staffDesk.orders;
  } catch (error) {
    console.error('Unable to load saved staff orders:', error);
    staffDeskError = 'read';
  }
  let language = localStorage.getItem('karak-ghori-language') === 'ar' ? 'ar' : 'en';
  let searchQuery = '';
  let staffSearchQuery = '';
  let staffForm = { customer: '', phone: '', method: 'dine-in', address: '', notes: '' };
  let selectedCategory = 'all';
  let selectedItemId = null;
  let modalMode = null;
  let pendingOrder = null;
  let toastTimer;
  let slideTimer;

  const text = (key) => uiText(key, language);
  const localized = (item) => ({
    ...item,
    ...itemText(item.id, language),
    ...(language === 'ar' ? {
      name: item.ar || item.name,
      category: item.categoryArabic || item.category,
    } : {}),
  });
  const quantityOf = (item) => Math.max(1, Math.floor(Number(item?.quantity) || 1));
  const cartQuantity = () => cart.reduce((sum, item) => sum + quantityOf(item), 0);
  const number = (value) => new Intl.NumberFormat(language === 'ar' ? 'ar-BH' : 'en-BH', { maximumFractionDigits: 0 }).format(value);
  const money = (value) => {
    const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-BH' : 'en-BH', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value / 1000);
    return language === 'ar' ? `${formatted} ${text('priceText')}` : `${text('priceText')} ${formatted}`;
  };
  const price = (item) => money(item.price);
  const lineTotal = (item) => money(item.price * quantityOf(item));
  const optionLabel = (label) => {
    if (language !== 'ar') return label;
    return ({
      Cup: 'كوب', 'Large cup': 'كوب كبير', Flask: 'ترمس', Small: 'صغير', Medium: 'متوسط',
      Large: 'كبير', Regular: 'عادي', Combo: 'وجبة مشتركة',
    })[label] || label;
  };
  const categoryLabel = (id) => {
    const category = categoryById.get(id);
    return language === 'ar' ? category?.ar || category?.label || id : category?.label || id;
  };
  const safeText = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const styleFor = (item) => `--c1:${item.colors[0]};--c2:${item.colors[1]}`;

  function restoreCart(storageKey) {
    try {
      return restoreCartEntries(JSON.parse(localStorage.getItem(storageKey) || '[]'));
    } catch (error) {
      console.error(`Unable to load ${storageKey}:`, error);
      return [];
    }
  }

  function restoreCartEntries(stored) {
      return stored.map((entry) => {
        const id = typeof entry === 'string' ? entry : entry?.id;
        const product = itemById.get(id);
        if (!product) return null;
        const optionIndex = typeof entry === 'string' ? 0 : Number(entry.optionIndex) || 0;
        const option = product.options[optionIndex] || product.options[0];
        return {
          ...product,
          price: option.price,
          optionIndex,
          optionLabel: option.label,
          quantity: typeof entry === 'string' ? 1 : Math.max(1, Math.floor(Number(entry.quantity) || 1)),
        };
      }).filter(Boolean);
  }

  function serializeCart(items) {
    return items.map(({ id, quantity, optionIndex }) => ({
      id, quantity: quantityOf({ quantity }), optionIndex,
    }));
  }

  function persistCart(items = cart, storageKey = 'karak-ghori-cart') {
    localStorage.setItem(storageKey, JSON.stringify(serializeCart(items)));
  }

  function persistStaffDesk(nextCart, nextOrders) {
    if (staffDeskError === 'read') return false;
    try {
      localStorage.setItem(staffDeskStorageKey, JSON.stringify({
        cart: serializeCart(nextCart),
        orders: nextOrders,
      }));
      staffCart = nextCart;
      staffOrders = nextOrders;
      staffDeskError = '';
      return true;
    } catch (error) {
      console.error('Unable to save staff orders:', error);
      staffDeskError = 'write';
      return false;
    }
  }

  function matchingItems(query) {
    const q = String(query ?? '').trim().toLocaleLowerCase();
    if (!q) return menuItems;
    if (language === 'en') return searchItems(query);
    return menuItems.filter((item) => [
      item.name, item.ar, item.subtitle, item.desc, item.category, item.categoryArabic,
      ...item.options.map((option) => optionLabel(option.label)),
    ].filter(Boolean).join(' ').toLocaleLowerCase().includes(q));
  }

  function updateChrome() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('.brand').setAttribute('aria-label', text('ghori'));
    document.querySelector('.brand-name small').textContent = text('brandTagline');
    document.querySelectorAll('.nav-button').forEach((button) => {
      const badge = button.querySelector('.count-badge');
      button.textContent = text(button.dataset.tab);
      if (button.dataset.tab === 'cart') { button.append(document.createTextNode(' ')); if (badge) button.append(badge); }
    });
    const count = document.querySelector('#cart-count');
    count.textContent = number(cartQuantity());
    count.classList.toggle('hidden', cartQuantity() === 0);
    const languageButton = document.querySelector('.language-toggle');
    languageButton.textContent = language === 'en' ? 'عربي' : 'EN';
    languageButton.setAttribute('aria-label', language === 'en' ? 'Switch to Arabic' : 'Switch to English');
    document.querySelector('.search-shortcut kbd').textContent = text('search');
    document.querySelector('#footer-made-fresh').textContent = text('madeFresh');
    document.querySelector('#footer-price-label').textContent = text('samplePrices');
    document.querySelector('#privacy-link').textContent = text('privacyPolicy');
    document.querySelector('#terms-link').textContent = text('termsConditions');
  }

  function card(item, style = 'poster', rank = null, addLabelKey = null) {
    const product = localized(item);
    const currentCart = activeTab === 'staff' ? staffCart : cart;
    const inCart = currentCart.filter((entry) => entry.id === item.id);
    const inCartQuantity = inCart.reduce((sum, entry) => sum + quantityOf(entry), 0);
    const label = addLabelKey ? text(addLabelKey) : inCartQuantity ? text('addAnother') : text('addToCart');
    const staffLocked = activeTab === 'staff' && staffDeskError === 'read';
    const startingPrice = item.options[0]?.price ?? item.price;
    const priceText = `${item.options.length > 1 ? `${safeText(text('fromPrice'))} ` : ''}${money(startingPrice)}`;
    return `<article class="product-card card--${style}${item.image ? ' has-photo' : ''}" style="${styleFor(item)}" data-emoji="${item.emoji}" data-open="${item.id}" tabindex="0" role="button" aria-label="${safeText(text('viewItem'))}: ${safeText(product.name)}">
      ${item.image ? `<img class="product-photo" src="${safeText(item.image)}" alt="" loading="lazy" decoding="async">` : ''}
      ${item.image ? '<img class="photo-mark photo-mark--card" src="assets/karak-ghori-watermark.png" alt="" aria-hidden="true">' : ''}
      ${rank ? `<span class="card-rank">${rank}</span>` : ''}${product.badge ? `<span class="card-badge">${safeText(product.badge)}</span>` : ''}
      ${inCartQuantity ? `<span class="card-quantity">${number(inCartQuantity)}</span>` : ''}
      <div class="card-content"><h3 class="card-name">${safeText(product.name)}</h3>${style === 'landscape' ? `<div class="card-category">${safeText(product.category)}</div>` : ''}<div class="price card-price">${priceText}</div></div>
      <button class="card-add" data-action="add-cart" data-id="${item.id}" data-option-index="0" title="${safeText(label)}" aria-label="${safeText(label)}: ${safeText(product.name)}"${staffLocked ? ' disabled' : ''}>+</button>
    </article>`;
  }

  function shelf(key, ids, style = 'poster') {
    return `<section class="shelf"><h2 class="shelf-heading">${safeText(text(key))} <span class="arrow">›</span></h2><div class="shelf-track">${ids.map((id, i) => card(itemById.get(id), style, style === 'ranked' ? i + 1 : null)).join('')}</div></section>`;
  }

  function featuredMedia(item, className) {
    if (item.video) {
      return `<video class="${className}" src="${safeText(item.video)}" poster="${safeText(item.image || '')}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>`;
    }
    return item.image ? `<img class="${className}" src="${safeText(item.image)}" alt="" decoding="async">` : '';
  }

  function hero() {
    const item = itemById.get(heroIds[heroIndex]);
    const p = localized(item);
    return `<section class="hero${item.image ? ' has-photo' : ''}" style="--hero-a:${item.colors[1]};--hero-b:${item.colors[0]}" data-emoji="${item.emoji}">${featuredMedia(item, 'hero-photo')}${item.image ? '<img class="photo-mark photo-mark--hero" src="assets/karak-ghori-watermark.png" alt="" aria-hidden="true">' : ''}<div class="hero-shade"></div><div class="hero-copy">
      <span class="eyebrow">${safeText(text('heroEyebrow'))}</span>${p.badge ? `<span class="pill">${safeText(p.badge)}</span>` : ''}
      <h1>${safeText(p.name)}</h1><p class="hero-subtitle">${safeText(p.subtitle)}</p><div class="hero-meta">${safeText(p.category)} · <span class="price">${price(item)}</span></div><div class="hero-tagline">${safeText(p.tagline)}</div>
      <div class="hero-actions"><button class="primary-button" data-action="add-cart" data-id="${item.id}">＋ &nbsp; ${safeText(text('addToCart'))} · ${price(item)}</button><button class="secondary-button" data-open="${item.id}">${safeText(text('viewItem'))} ↗</button></div>
      </div><div class="hero-bottom"><div class="dots">${heroIds.map((id, i) => `<button class="dot ${i === heroIndex ? 'active' : ''}" data-action="hero-to" data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}</div><div class="slide-controls"><button data-action="hero-prev" aria-label="Previous slide">‹</button><button data-action="hero-next" aria-label="Next slide">›</button></div></div></section>`;
  }

  function intro(title, subtitle) { return `<div class="page-intro"><h1>${safeText(title)}</h1><p>${safeText(subtitle)}</p></div>`; }
  function renderBrandStory() {
    const story = language === 'ar' ? ['كرك غوري، نكهة تجمعنا.', 'شاي كرك ومأكولات طازجة — نكهة دافئة في كل زيارة.'] : ['Karak Ghori, made to be shared.', 'Karak tea and fresh bites, served with the warmth of a familiar place.'];
    return `<section class="brand-story"><div class="brand-story-copy"><span class="eyebrow">${safeText(text('brandStory'))}</span><h2>${safeText(story[0])}</h2><p>${safeText(story[1])}</p><img class="brand-story-logo" src="assets/restaurant-media/ed72f2b1-0193-4fa7-a2a6-af27642f0797.jpeg" alt="Karak Ghori takeaway bag"></div><img class="brand-story-banner" src="assets/restaurant-media/874d44da-e5be-4531-9198-e6556acf05ac.jpg" alt="Karak Ghori storefront"></section>`;
  }
  function renderGhori() { return `${shelf('samosasChapathiChef', shelves.samosasChapathiChef, 'landscape')}${shelf('hibiscusTea', shelves.hibiscusTea, 'landscape')}${hero()}${shelf('continueOrdering', shelves.continueOrdering, 'landscape')}${shelf('mustSee', shelves.mustSee)}${shelf('topItems', shelves.topItems, 'ranked')}${shelf('newReleases', shelves.newReleases)}`; }
  function renderHome() { return `${intro(text('homeTitle'), text('homeSubtitle'))}${shelf('iceCold', shelves.iceCold, 'feature')}${shelf('mustSeeHome', shelves.mustSee)}${shelf('continueOrdering', shelves.continueOrdering, 'landscape')}${renderBrandStory()}`; }
  function renderMenu() {
    const items = selectedCategory === 'all' ? menuItems : menuItems.filter((item) => item.cat === selectedCategory);
    return `${intro(text('menuTitle'), text('menuSubtitle'))}<div class="category-row">${categories.map((category) => `<button class="filter-chip ${category === selectedCategory ? 'active' : ''}" data-action="category" data-category="${safeText(category)}">${safeText(categoryLabel(category))}</button>`).join('')}</div><div class="menu-grid">${items.map((item) => card(item, 'landscape')).join('')}</div>`;
  }
  function renderSearchResults() {
    const items = matchingItems(searchQuery);
    return items.length ? `<div class="menu-grid">${items.map((item) => card(item, 'landscape')).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">⌕</div><h2>${safeText(text('noMatches'))}</h2><p>${safeText(text('noMatchesHint'))}</p></div>`;
  }
  function renderSearch() {
    return `${intro(text('searchTitle'), text('searchSubtitle'))}<label class="search-box"><span>⌕</span><input id="search-input" type="search" placeholder="${safeText(text('searchPlaceholder'))}" value="${safeText(searchQuery)}" autocomplete="off" aria-label="${safeText(text('search'))}"></label><div id="search-results">${renderSearchResults()}</div>`;
  }
  function renderCart() {
    if (!cart.length) return `${intro(text('cartTitle'), text('checkoutNote'))}<div class="empty-state"><div class="empty-icon">🛍️</div><h2>${safeText(text('emptyCart'))}</h2><p>${safeText(text('emptyCartHint'))}</p><button class="primary-button" data-tab="menu">${safeText(text('browseMenu'))}</button></div>`;
    const units = cartQuantity();
    const rows = cart.map((item) => { const p = localized(item); const option = item.options.length > 1 ? `<p>${safeText(optionLabel(item.optionLabel))}</p>` : ''; const optionIndex = item.optionIndex ?? 0; return `<article class="cart-row"><div class="cart-thumb${item.image ? ' has-photo' : ''}" style="${styleFor(item)}">${item.image ? `<img class="cart-photo" src="${safeText(item.image)}" alt="" loading="lazy" decoding="async"><img class="photo-mark photo-mark--cart" src="assets/karak-ghori-watermark.png" alt="" aria-hidden="true">` : ''}<span aria-hidden="true">${item.emoji}</span></div><div class="cart-item-copy"><h3>${safeText(p.name)}</h3>${option}<p>${safeText(p.subtitle)}</p><div class="price cart-line-total">${lineTotal(item)}</div></div><div class="quantity-stepper" aria-label="${safeText(text('qty'))}: ${safeText(p.name)}"><button data-action="quantity-down" data-id="${item.id}" data-option-index="${optionIndex}" aria-label="Decrease quantity">−</button><span>${number(quantityOf(item))}</span><button data-action="quantity-up" data-id="${item.id}" data-option-index="${optionIndex}" aria-label="Increase quantity">+</button></div><button class="remove-button" data-action="remove-cart" data-id="${item.id}" data-option-index="${optionIndex}">${safeText(text('remove'))}</button></article>`; }).join('');
    return `${intro(text('cartTitle'), `${number(units)} ${safeText(units === 1 ? text('selectedOne') : text('selectedMany'))}`)}<div class="cart-layout"><div class="cart-list">${rows}</div><aside class="summary-card"><h2>${safeText(text('orderSummary'))}</h2><div class="summary-line"><span>${safeText(text('items'))} (${number(units)})</span><span>${money(cartTotal(cart))}</span></div><div class="summary-line"><span>${safeText(text('pickupDelivery'))}</span><span>${safeText(text('chooseLater'))}</span></div><div class="summary-line summary-total"><span>${safeText(text('total'))}</span><span class="price">${money(cartTotal(cart))}</span></div><button class="primary-button whatsapp-button" data-action="checkout"><span aria-hidden="true">◉</span> ${safeText(text('checkout'))}</button><p class="checkout-note">${safeText(text('checkoutNote'))}</p></aside></div>`;
  }

  function renderStaffCart() {
    if (!staffCart.length) return `<div class="staff-cart-empty">${safeText(text('staffNoItems'))}</div>`;
    const staffLocked = staffDeskError === 'read';
    return staffCart.map((item) => {
      const optionIndex = item.optionIndex ?? 0;
      const product = localized(item);
      return `<article class="staff-order-line"><div><strong>${safeText(product.name)}</strong>${item.options.length > 1 ? `<span>${safeText(optionLabel(item.optionLabel))}</span>` : ''}<span>${money(item.price)} · ${money(item.price * quantityOf(item))}</span></div><div class="quantity-stepper"><button type="button" data-action="quantity-down" data-id="${item.id}" data-option-index="${optionIndex}" aria-label="${safeText(text('staffDecreaseQuantity'))}"${staffLocked ? ' disabled' : ''}>−</button><span>${number(quantityOf(item))}</span><button type="button" data-action="quantity-up" data-id="${item.id}" data-option-index="${optionIndex}" aria-label="${safeText(text('staffIncreaseQuantity'))}"${staffLocked ? ' disabled' : ''}>+</button></div><button type="button" class="remove-button" data-action="remove-cart" data-id="${item.id}" data-option-index="${optionIndex}"${staffLocked ? ' disabled' : ''}>${safeText(text('remove'))}</button></article>`;
    }).join('');
  }

  function renderSavedStaffOrders() {
    if (!staffOrders.length) return `<div class="staff-cart-empty">${safeText(text('staffNoOrders'))}</div>`;
    const statusText = {
      received: text('staffReceived'),
      preparing: text('staffPreparing'),
      ready: text('staffReady'),
      completed: text('staffCompleted'),
    };
    const methodText = {
      'dine-in': text('staffDineIn'),
      takeaway: text('staffTakeaway'),
      delivery: text('staffDelivery'),
    };
    return staffOrders.map((order) => {
      const date = Number.isNaN(Date.parse(order.createdAt))
        ? order.createdAt
        : new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-BH' : 'en-BH');
      const orderItems = order.items.map((item) =>
        `<li>${number(item.quantity)} × ${safeText(item.name)}${item.optionLabel ? ` · ${safeText(item.optionLabel)}` : ''}</li>`
      ).join('');
      const nextStatus = order.status !== 'completed'
        ? `<button class="secondary-button staff-advance" data-action="staff-advance" data-id="${safeText(order.id)}"${staffDeskError === 'read' ? ' disabled' : ''}>${safeText(text('staffAdvance'))}</button>`
        : '';
      return `<article class="staff-saved-order"><div class="staff-saved-order-head"><div><strong>${safeText(order.id)}</strong><span>${safeText(date)}</span></div><span class="staff-status status-${order.status}">${safeText(statusText[order.status])}</span></div><div class="staff-saved-order-meta"><span>${safeText(order.customer)}</span><span>${safeText(methodText[order.method])}</span><strong class="price">${money(order.total)}</strong></div>${order.phone ? `<p class="staff-order-contact">${safeText(text('staffPhone'))}: ${safeText(order.phone)}</p>` : ''}${order.address ? `<p class="staff-order-contact">${safeText(text('staffAddress'))}: ${safeText(order.address)}</p>` : ''}<ul>${orderItems}</ul>${order.notes ? `<p class="staff-order-notes">${safeText(order.notes)}</p>` : ''}${nextStatus}</article>`;
    }).join('');
  }

  function renderStaffMenu() {
    const query = staffSearchQuery.trim().toLocaleLowerCase();
    const items = menuItems.filter((item) => {
      if (selectedCategory !== 'all' && item.cat !== selectedCategory) return false;
      if (!query) return true;
      const product = localized(item);
      return [product.name, product.category, product.subtitle, item.name, item.ar]
        .filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
    });
    return items.length
      ? items.map((item) => card(item, 'landscape', null, 'staffAddItem')).join('')
      : `<div class="staff-cart-empty">${safeText(text('noMatches'))}</div>`;
  }

  function renderStaff() {
    const methods = [
      ['dine-in', text('staffDineIn')],
      ['takeaway', text('staffTakeaway')],
      ['delivery', text('staffDelivery')],
    ];
    const itemCount = cartTotal(staffCart);
    const storageMessage = staffDeskError === 'read' ? text('staffInvalidSavedOrders') : text('staffStorageError');
    const delivery = staffForm.method === 'delivery';
    return `${intro(text('staffTitle'), text('staffSubtitle'))}
      <p class="staff-offline-note"><span aria-hidden="true">●</span> ${safeText(text('staffOfflineNote'))}</p>
      ${staffDeskError ? `<p class="staff-storage-error" role="alert">${safeText(storageMessage)}</p>` : ''}
      <section class="staff-workspace">
        <form id="staff-order-form" class="staff-order-form">
          <div class="staff-order-details">
            <label class="checkout-field">${safeText(text('staffCustomer'))}<input name="customer" required maxlength="80" autocomplete="off" value="${safeText(staffForm.customer)}"></label>
            <label class="checkout-field">${safeText(text('staffPhone'))}<input name="phone" type="tel" maxlength="40" autocomplete="tel" inputmode="tel" value="${safeText(staffForm.phone)}"></label>
            <label class="checkout-field">${safeText(text('staffMethod'))}<select name="method">${methods.map(([value, label]) => `<option value="${value}"${staffForm.method === value ? ' selected' : ''}>${safeText(label)}</option>`).join('')}</select></label>
            <label class="checkout-field delivery-address"${delivery ? '' : ' hidden'}>${safeText(text('staffAddress'))}<textarea name="address" rows="2" maxlength="240"${delivery ? ' required' : ''}>${safeText(staffForm.address)}</textarea></label>
            <label class="checkout-field">${safeText(text('staffNotes'))}<textarea name="notes" rows="2" maxlength="300">${safeText(staffForm.notes)}</textarea></label>
            <div class="staff-current-order">
              <h2>${safeText(text('staffCurrentOrder'))}</h2>
              <div class="staff-order-lines">${renderStaffCart()}</div>
              <div class="staff-total"><span>${safeText(text('total'))}</span><strong class="price">${money(itemCount)}</strong></div>
              <button class="primary-button staff-save-button" type="submit"${!staffCart.length || staffDeskError === 'read' ? ' disabled' : ''}>${safeText(text('staffSaveOrder'))}</button>
            </div>
          </div>
        </form>
        <section class="staff-menu-section">
          <div class="staff-menu-head"><h2>${safeText(text('staffMenu'))}</h2><label class="search-box staff-search-box"><span aria-hidden="true">⌕</span><input id="staff-search-input" type="search" placeholder="${safeText(text('searchPlaceholder'))}" value="${safeText(staffSearchQuery)}" autocomplete="off" aria-label="${safeText(text('search'))}"></label></div>
          <div class="category-row">${categories.map((category) => `<button type="button" class="filter-chip ${category === selectedCategory ? 'active' : ''}" data-action="category" data-category="${safeText(category)}">${safeText(categoryLabel(category))}</button>`).join('')}</div>
          <div id="staff-menu-items" class="menu-grid">${renderStaffMenu()}</div>
        </section>
      </section>
      <section class="staff-orders-section"><h2>${safeText(text('staffOrders'))}</h2><div class="staff-orders-list">${renderSavedStaffOrders()}</div></section>`;
  }

  function updateMain() {
    main.innerHTML = activeTab === 'home' ? renderHome() : activeTab === 'menu' ? renderMenu() : activeTab === 'cart' ? renderCart() : activeTab === 'search' ? renderSearch() : activeTab === 'staff' ? renderStaff() : renderGhori();
    main.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }
  function renderMain() {
    updateChrome();
    document.querySelectorAll('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.tab === activeTab));
    updateMain();
    clearInterval(slideTimer);
    if (activeTab === 'ghori') slideTimer = setInterval(() => { heroIndex = (heroIndex + 1) % heroIds.length; updateMain(); }, 6500);
  }
  function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600); }
  function addToCart(id, optionIndex = 0) {
    const item = itemById.get(id);
    if (!item) return;
    if (modalMode === 'item') {
      optionIndex = Number(modalRoot.querySelector('[name="item-option"]')?.value ?? optionIndex);
    }
    optionIndex = Math.max(0, Math.min(item.options.length - 1, Number(optionIndex) || 0));
    if (activeTab === 'staff') {
      const nextStaffCart = addCartItem(staffCart, { ...item, optionIndex });
      if (!persistStaffDesk(nextStaffCart, staffOrders)) {
        showToast(text('staffStorageError'));
        return;
      }
    } else {
      cart = addCartItem(cart, { ...item, optionIndex });
      persistCart();
    }
    renderMain();
    if (modalMode === 'item') renderModal();
    showToast(`${localized(item).name} · ${text('addAnother')}`);
  }
  function changeQuantity(id, delta, optionIndex) {
    const index = optionIndex === undefined ? undefined : Number(optionIndex);
    const currentCart = activeTab === 'staff' ? staffCart : cart;
    const item = currentCart.find((entry) => entry.id === id && (index === undefined || entry.optionIndex === index));
    if (!item) return;
    if (activeTab === 'staff') {
      const nextStaffCart = setCartQuantity(staffCart, id, quantityOf(item) + delta, index);
      if (!persistStaffDesk(nextStaffCart, staffOrders)) { showToast(text('staffStorageError')); return; }
    } else {
      cart = setCartQuantity(cart, id, quantityOf(item) + delta, index);
      persistCart();
    }
    renderMain();
  }
  function closeModal() { selectedItemId = null; modalMode = null; modalRoot.innerHTML = ''; }

  function renderItemModal() {
    const item = itemById.get(selectedItemId);
    if (!item) { closeModal(); return; }
    const p = localized(item);
    const staffLocked = activeTab === 'staff' && staffDeskError === 'read';
    const related = menuItems.filter((entry) => entry.id !== item.id && entry.cat === item.cat).slice(0, 4);
    const optionControl = item.options.length > 1
      ? `<label class="detail-option-field">${safeText(text('sizeLabel'))}<select name="item-option">${item.options.map((option, index) => `<option value="${index}">${safeText(optionLabel(option.label))} · ${money(option.price)}</option>`).join('')}</select></label>`
      : `<div class="detail-option-summary">${safeText(optionLabel(item.options[0]?.label || ''))}</div>`;
    modalRoot.innerHTML = `<div class="detail-backdrop"><section class="detail-panel" role="dialog" aria-modal="true" aria-label="${safeText(p.name)}"><button class="detail-close" data-action="close-modal" aria-label="${safeText(text('cancel'))}">×</button><div class="detail-hero${item.image ? ' has-photo' : ''}" style="--c1:${item.colors[0]};--c2:${item.colors[1]}">${featuredMedia(item, 'detail-photo')}${item.image ? '<img class="photo-mark photo-mark--detail" src="assets/karak-ghori-watermark.png" alt="" aria-hidden="true">' : ''}<div class="detail-copy"><span class="eyebrow">${safeText(p.category)}</span>${p.badge ? `<div class="pill detail-pill">${safeText(p.badge)}</div>` : ''}<h1>${safeText(p.name)}</h1><p>${safeText(p.subtitle)}</p><div class="price detail-price">${price(item)}</div></div><div class="detail-emoji">${item.emoji}</div></div><div class="detail-body"><p class="detail-description">${safeText(p.about)}</p>${optionControl}<button class="primary-button" data-action="add-cart" data-id="${item.id}" data-option-index="0"${staffLocked ? ' disabled' : ''}>＋ &nbsp; ${safeText(text('addToCart'))} · ${price(item)}</button><h2 class="shelf-heading detail-related-title">${safeText(text('mustSee'))}</h2><div class="shelf-track">${related.map((entry) => card(entry)).join('')}</div></div></section></div>`;
  }
  function renderCheckoutModal() {
    modalRoot.innerHTML = `<div class="detail-backdrop"><section class="checkout-panel" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><button class="detail-close" data-action="close-modal" aria-label="${safeText(text('cancel'))}">×</button><span class="eyebrow">${safeText(text('orderDraft'))}</span><h2 id="checkout-title">${safeText(text('checkoutTitle'))}</h2><p class="checkout-note">${safeText(text('checkoutNote'))}</p><form id="checkout-form" novalidate><label class="checkout-field">${safeText(text('customerName'))}<input name="name" required maxlength="80" autocomplete="name"></label><label class="checkout-field phone-field">${safeText(text('customerPhone'))}<input name="phone" maxlength="40" autocomplete="tel" inputmode="tel"><small>${safeText(text('paymentPhoneRequired'))}</small></label><fieldset class="order-method"><legend>${safeText(text('orderMethod'))}</legend><label><input type="radio" name="method" value="pickup" checked> ${safeText(text('pickup'))}</label><label><input type="radio" name="method" value="delivery"> ${safeText(text('delivery'))}</label><label><input type="radio" name="method" value="dine-in"> ${safeText(text('dineIn'))}</label></fieldset><label class="checkout-field delivery-address" hidden>${safeText(text('address'))}<textarea name="address" rows="2" maxlength="240"></textarea></label><fieldset class="order-method"><legend>${safeText(text('paymentMethod'))}</legend><label><input type="radio" name="paymentMethod" value="cash" checked> ${safeText(text('payCash'))}</label><label><input type="radio" name="paymentMethod" value="benefitpay"> ${safeText(text('payBenefitPay'))}</label></fieldset><p class="checkout-note benefitpay-notice" hidden>${safeText(text('benefitPayNotice'))}</p><label class="checkout-field">${safeText(text('instructions'))}<textarea name="notes" rows="2" maxlength="300"></textarea></label><div class="checkout-form-error" id="checkout-error" role="alert" hidden></div><div class="checkout-total"><span>${safeText(text('total'))}</span><strong>${money(cartTotal(cart))}</strong></div><p class="checkout-legal">${safeText(text('checkoutLegal'))} <a href="terms-conditions.html">${safeText(text('termsConditions'))}</a> ${safeText(language === 'ar' ? 'و' : 'and')} <a href="privacy-policy.html">${safeText(text('privacyPolicy'))}</a>.</p><button class="primary-button whatsapp-button" type="submit"><span aria-hidden="true">◉</span> ${safeText(text('sendWhatsApp'))}</button><button class="text-button" type="button" data-action="close-modal">${safeText(text('cancel'))}</button></form></section></div>`;
    const consent = document.createElement('label');
    consent.className = 'checkout-consent';
    consent.innerHTML = `<input name="online-consent" type="checkbox" required><span>${safeText(text('cloudOrderConsent'))}</span>`;
    modalRoot.querySelector('#checkout-error').before(consent);
    modalRoot.querySelector('[name="name"]')?.focus();
  }
  function renderPendingModal() {
    if (!pendingOrder) { closeModal(); return; }
    modalRoot.innerHTML = `<div class="detail-backdrop"><section class="pending-panel" role="dialog" aria-modal="true" aria-labelledby="pending-title"><button class="detail-close" data-action="close-modal" aria-label="${safeText(text('cancel'))}">×</button><div class="pending-icon" aria-hidden="true">✓</div><span class="eyebrow">${safeText(text('orderDraft'))}</span><h2 id="pending-title">${safeText(text('whatsappPending'))}</h2><p>${safeText(text('whatsappPendingText'))}</p><div class="pending-reference"><span>${safeText(pendingOrder.orderId)}</span><strong>${money(pendingOrder.total)}</strong></div><div class="pending-warning"><strong>${safeText(text('orderNotConfirmed'))}</strong><span>${safeText(text('staffConfirmationNotice'))}</span></div><button class="primary-button whatsapp-button" data-action="open-whatsapp-again"><span aria-hidden="true">◉</span> ${safeText(text('openChatAgain'))}</button><button class="text-button" data-action="close-modal">${safeText(text('continueOrder'))}</button></section></div>`;
  }
  function renderModal() {
    if (!modalMode) { modalRoot.innerHTML = ''; return; }
    if (modalMode === 'item') renderItemModal();
    else if (modalMode === 'checkout') renderCheckoutModal();
    else if (modalMode === 'pending') renderPendingModal();
  }
  function openCheckout() { if (cart.length) { modalMode = 'checkout'; selectedItemId = null; renderModal(); } }
  function switchTab(tab) {
    activeTab = tab; selectedItemId = null; modalMode = null; modalRoot.innerHTML = '';
    if (tab !== 'search') searchQuery = '';
    renderMain(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function switchLanguage() {
    language = language === 'en' ? 'ar' : 'en';
    localStorage.setItem('karak-ghori-language', language);
    renderMain(); renderModal();
  }
  async function submitOrder(form) {
    const fields = new FormData(form);
    const name = String(fields.get('name') || '').trim();
    const phone = String(fields.get('phone') || '').trim();
    const method = String(fields.get('method') || 'pickup');
    const paymentMethod = String(fields.get('paymentMethod') || 'cash');
    const address = String(fields.get('address') || '').trim();
    const notes = String(fields.get('notes') || '').trim();
    const error = document.querySelector('#checkout-error');
    const addressInput = form.querySelector('[name="address"]');
    addressInput.required = method === 'delivery';
    const hasConsent = fields.get('online-consent') === 'on';
    if (!name || (method === 'delivery' && !address) || (paymentMethod === 'benefitpay' && !phone) || !hasConsent) {
      error.textContent = !name ? text('requiredName') : method === 'delivery' && !address ? text('requiredAddress') : paymentMethod === 'benefitpay' && !phone ? text('requiredPhoneForPayment') : text('requiredConsent');
      error.hidden = false;
      (!name ? form.querySelector('[name="name"]') : method === 'delivery' && !address ? addressInput : paymentMethod === 'benefitpay' && !phone ? form.querySelector('[name="phone"]') : form.querySelector('[name="online-consent"]')).focus();
      return;
    }
    error.hidden = true;
    const order = {
      orderId: `KG-${Date.now().toString(36).toUpperCase()}`, name, phone, method, paymentMethod, address, notes,
      items: cart.map((item) => ({
        name: localized(item).name,
        optionLabel: item.options.length > 1 ? optionLabel(item.optionLabel) : '',
        price: item.price,
        quantity: quantityOf(item),
      })),
      total: cartTotal(cart),
    };
    const url = buildWhatsAppUrl(formatOrderMessage(order, language));
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    const webWhatsAppWindow = window.karakGhori?.openWhatsAppOrder ? null : window.open('');
    if (webWhatsAppWindow) webWhatsAppWindow.opener = null;
    try {
      if (!window.KarakGhoriCloudOrders) throw new Error('Online order receiving is unavailable. Rebuild and launch the desktop app.');
      await window.KarakGhoriCloudOrders.submitOrder(order);
      pendingOrder = { orderId: order.orderId, total: order.total, url };
      modalMode = 'pending'; renderModal(); showToast(text('checkoutWaiting'));
      try {
        if (window.karakGhori?.openWhatsAppOrder) await window.karakGhori.openWhatsAppOrder(url);
        else if (webWhatsAppWindow && !webWhatsAppWindow.closed) webWhatsAppWindow.location.href = url;
        else throw new Error('Your browser blocked the WhatsApp tab. Use the button below to open it.');
      } catch (cause) {
        showToast(`Order sent to staff, but WhatsApp could not be opened: ${cause?.message || 'Unknown error.'}`);
      }
    } catch (cause) {
      if (webWhatsAppWindow && !webWhatsAppWindow.closed) webWhatsAppWindow.close();
      error.textContent = cause?.message || 'Could not send the order to staff.';
      error.hidden = false;
    } finally {
      submitButton.disabled = false;
    }
  }
  async function openPendingWhatsApp() {
    if (!pendingOrder?.url) return;
    try {
      if (window.karakGhori?.openWhatsAppOrder) await window.karakGhori.openWhatsAppOrder(pendingOrder.url);
      else {
        const opened = window.open(pendingOrder.url, '_blank');
        if (!opened) throw new Error('Your browser blocked the WhatsApp tab.');
        opened.opener = null;
      }
    }
    catch (cause) { showToast(cause?.message || 'Could not open WhatsApp.'); }
  }

  function submitStaffOrder(form) {
    const fields = new FormData(form);
    staffForm = {
      customer: String(fields.get('customer') || '').trim(),
      phone: String(fields.get('phone') || '').trim(),
      method: String(fields.get('method') || 'dine-in'),
      address: String(fields.get('address') || '').trim(),
      notes: String(fields.get('notes') || '').trim(),
    };
    if (!staffForm.customer || !staffCart.length) {
      showToast(text('staffOrderRequired'));
      form.querySelector('[name="customer"]').focus();
      return;
    }
    if (staffForm.method === 'delivery' && !staffForm.address) {
      showToast(text('staffDeliveryAddressRequired'));
      form.querySelector('[name="address"]').focus();
      return;
    }
    const orderNumber = `KG-${Date.now().toString(36).toUpperCase()}-${(staffOrders.length + 1).toString(36).toUpperCase()}`;
    const order = createStaffOrder({
      id: orderNumber,
      createdAt: new Date().toISOString(),
      customer: staffForm.customer,
      phone: staffForm.phone,
      method: staffForm.method,
      address: staffForm.method === 'delivery' ? staffForm.address : '',
      notes: staffForm.notes,
      items: staffCart.map((item) => ({
        id: item.id,
        name: localized(item).name,
        optionLabel: item.options.length > 1 ? optionLabel(item.optionLabel) : '',
        price: item.price,
        quantity: quantityOf(item),
      })),
    });
    if (!persistStaffDesk([], [order, ...staffOrders])) {
      showToast(text('staffStorageError'));
      renderMain();
      return;
    }
    staffForm = { customer: '', phone: '', method: 'dine-in', address: '', notes: '' };
    renderMain();
    showToast(text('staffOrderSaved'));
  }

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]');
    if (tab) { switchTab(tab.dataset.tab); return; }
    const action = event.target.closest('[data-action]');
    if (action) {
      const kind = action.dataset.action;
      if (kind === 'add-cart') { event.preventDefault(); event.stopPropagation(); addToCart(action.dataset.id, action.dataset.optionIndex); }
      else if (kind === 'hero-next') { heroIndex = (heroIndex + 1) % heroIds.length; updateMain(); }
      else if (kind === 'hero-prev') { heroIndex = (heroIndex - 1 + heroIds.length) % heroIds.length; updateMain(); }
      else if (kind === 'hero-to') { heroIndex = Number(action.dataset.index) || 0; updateMain(); }
      else if (kind === 'category') { selectedCategory = action.dataset.category; updateMain(); }
      else if (kind === 'quantity-up') changeQuantity(action.dataset.id, 1, action.dataset.optionIndex);
      else if (kind === 'quantity-down') changeQuantity(action.dataset.id, -1, action.dataset.optionIndex);
      else if (kind === 'remove-cart') {
        const index = Number(action.dataset.optionIndex);
        const currentCart = activeTab === 'staff' ? staffCart : cart;
        const item = currentCart.find((entry) => entry.id === action.dataset.id && entry.optionIndex === index);
        if (item) changeQuantity(item.id, -quantityOf(item), index);
      }
      else if (kind === 'staff-advance') {
        const nextOrders = advanceStaffOrder(staffOrders, action.dataset.id);
        if (!persistStaffDesk(staffCart, nextOrders)) showToast(text('staffStorageError'));
        else renderMain();
      }
      else if (kind === 'language') switchLanguage();
      else if (kind === 'checkout') openCheckout();
      else if (kind === 'close-modal') closeModal();
      else if (kind === 'open-whatsapp-again') openPendingWhatsApp();
      return;
    }
    if (event.target.matches('.detail-backdrop')) { closeModal(); return; }
    const open = event.target.closest('[data-open]');
    if (open) { selectedItemId = open.dataset.open; modalMode = 'item'; renderModal(); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalMode) closeModal();
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-open]')) { event.preventDefault(); selectedItemId = event.target.dataset.open; modalMode = 'item'; renderModal(); }
  });
  document.addEventListener('change', (event) => {
    if (event.target.name === 'item-option') {
      const item = itemById.get(selectedItemId);
      if (!item) return;
      const option = item.options[Number(event.target.value)];
      const button = modalRoot.querySelector('[data-action="add-cart"]');
      modalRoot.querySelector('.detail-price').textContent = money(option.price);
      if (button) button.innerHTML = `＋ &nbsp; ${safeText(text('addToCart'))} · ${money(option.price)}`;
      return;
    }
    if (event.target.name === 'method') {
      updateCheckoutRequirements(event.target.closest('form'));
    }
    if (event.target.name === 'paymentMethod') {
      updateCheckoutRequirements(event.target.closest('form'));
    }
    if (event.target.closest('#staff-order-form')) {
      staffForm[event.target.name] = event.target.value;
    }
  });
  function updateCheckoutRequirements(form) {
    if (!form) return;
    const method = form.querySelector('[name="method"]:checked')?.value;
    const delivery = method === 'delivery';
    const address = form.querySelector('.delivery-address');
    const addressInput = address?.querySelector('textarea');
    if (address && addressInput) {
      address.hidden = !delivery;
      addressInput.required = delivery;
    }
    const benefitPay = form.querySelector('[name="paymentMethod"]:checked')?.value === 'benefitpay';
    const phone = form.querySelector('[name="phone"]');
    const notice = form.querySelector('.benefitpay-notice');
    if (phone) phone.required = benefitPay;
    const phoneHelp = form.querySelector('.phone-field small');
    if (phoneHelp) phoneHelp.hidden = !benefitPay;
    if (notice) notice.hidden = !benefitPay;
  }
  document.addEventListener('submit', (event) => {
    if (event.target.id === 'staff-order-form') {
      event.preventDefault();
      submitStaffOrder(event.target);
      return;
    }
    if (event.target.id !== 'checkout-form') return;
    event.preventDefault(); submitOrder(event.target);
  });
  document.addEventListener('error', (event) => {
    if (event.target.matches('video.hero-photo, video.detail-photo')) return;
    if (!event.target.matches('.product-photo, .hero-photo, .detail-photo, .cart-photo')) return;
    event.target.closest('.product-card, .hero, .detail-hero, .cart-thumb')?.classList.remove('has-photo');
    event.target.remove();
  }, true);
  main.addEventListener('input', (event) => {
    if (event.target.id === 'search-input') {
      searchQuery = event.target.value;
      document.querySelector('#search-results').innerHTML = renderSearchResults();
      return;
    }
    if (event.target.id === 'staff-search-input') {
      staffSearchQuery = event.target.value;
      document.querySelector('#staff-menu-items').innerHTML = renderStaffMenu();
      return;
    }
    if (event.target.closest('#staff-order-form')) {
      staffForm[event.target.name] = event.target.value;
    }
  });

  renderMain();
})();
