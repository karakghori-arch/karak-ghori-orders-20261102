(() => {
  const config = window.KarakGhoriCloudConfig || {};
  const sessionKey = 'karak-ghori-staff-session';
  const loginView = document.querySelector('#login-view');
  const ordersView = document.querySelector('#orders-view');
  const loginForm = document.querySelector('#login-form');
  const loginError = document.querySelector('#login-error');
  const orderList = document.querySelector('#order-list');
  const connectionStatus = document.querySelector('#connection-status');
  const signoutButton = document.querySelector('#signout-button');
  const installButton = document.querySelector('#install-button');
  let session = null;
  let pollTimer = null;
  let lastOrderIds = new Set();
  let installPrompt = null;

  function serviceUrl(path) {
    let base;
    try {
      base = new URL(String(config.supabaseUrl || ''));
    } catch {
      throw new Error('The staff app cloud service has not been configured.');
    }
    if (base.protocol !== 'https:' || base.username || base.password || !config.anonKey) {
      throw new Error('The staff app cloud service configuration is invalid.');
    }
    return `${base.origin}/${path}`;
  }

  function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  async function responseError(response) {
    const detail = await response.text();
    return new Error(`Cloud service returned ${response.status}. ${detail.slice(0, 240)}`);
  }

  async function authenticate(email, password) {
    const response = await fetch(serviceUrl('auth/v1/token?grant_type=password'), {
      method: 'POST',
      headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw await responseError(response);
    return response.json();
  }

  async function api(path, options = {}, canRefresh = true) {
    if (!session?.access_token) throw new Error('Your staff session has ended. Sign in again.');
    const response = await fetch(serviceUrl(`rest/v1/${path}`), {
      ...options,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${session.access_token}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
    if (response.status === 401 && canRefresh && session.refresh_token) {
      await refreshSession();
      return api(path, options, false);
    }
    if (!response.ok) throw await responseError(response);
    if (response.status === 204) return null;
    const body = await response.text();
    return body ? JSON.parse(body) : null;
  }

  async function refreshSession() {
    const response = await fetch(serviceUrl('auth/v1/token?grant_type=refresh_token'), {
      method: 'POST',
      headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (!response.ok) {
      clearSession();
      throw new Error('Your staff session expired. Sign in again.');
    }
    session = await response.json();
    localStorage.setItem(sessionKey, JSON.stringify(session));
  }

  function showOrders() {
    loginView.hidden = true;
    ordersView.hidden = false;
    signoutButton.hidden = false;
    loginError.hidden = true;
    if (!pollTimer) pollTimer = window.setInterval(() => loadOrders(false), 12000);
  }

  async function verifyStaffMembership() {
    const membership = await api('staff_members?select=user_id&limit=1');
    if (!Array.isArray(membership) || membership.length !== 1) {
      throw new Error('This account is not authorized for the staff order desk.');
    }
  }

  function clearSession() {
    session = null;
    localStorage.removeItem(sessionKey);
    if (pollTimer) window.clearInterval(pollTimer);
    pollTimer = null;
    loginView.hidden = false;
    ordersView.hidden = true;
    signoutButton.hidden = true;
    orderList.replaceChildren();
  }

  function displayDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
  }

  function nextStatus(status) {
    return ({ received: 'preparing', preparing: 'ready', ready: 'completed' })[status] || null;
  }

  function renderOrders(orders, announceNew) {
    const currentIds = new Set(orders.map((order) => order.id));
    if (announceNew && [...currentIds].some((id) => !lastOrderIds.has(id)) && lastOrderIds.size) {
      connectionStatus.textContent = 'New customer order received.';
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Karak Ghori: new order', { body: 'A new customer order has arrived.' });
      }
    }
    lastOrderIds = currentIds;
    if (!orders.length) {
      orderList.innerHTML = '<div class="empty-state">No customer orders yet. New orders will appear here automatically.</div>';
      return;
    }
    orderList.innerHTML = orders.map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const itemMarkup = items.map((item) => `<li><span>${safeText(item.quantity)} × ${safeText(item.name)}${item.option_label ? ` · ${safeText(item.option_label)}` : ''}</span><span>${(Number(item.unit_price) * Number(item.quantity) / 1000).toFixed(3)} BHD</span></li>`).join('');
      const status = ['received', 'preparing', 'ready', 'completed'].includes(order.status) ? order.status : 'received';
      const next = nextStatus(status);
      return `<article class="order-card">
        <header class="order-header"><div><strong>${safeText(order.order_reference)}</strong><time>${safeText(displayDate(order.created_at))}</time></div><span class="status status-${status}">${safeText(status)}</span></header>
        <div class="customer"><strong>${safeText(order.customer_name)}</strong><span>${safeText(order.method)}${order.customer_phone ? ` · ${safeText(order.customer_phone)}` : ''}</span></div>
        <p class="order-detail"><b>Payment:</b> ${safeText(order.payment_method === 'benefitpay' ? 'BenefitPay · manual verification' : 'Cash')} · ${safeText(order.payment_status)}</p>
        ${order.delivery_address ? `<p class="order-detail"><b>Delivery address:</b> ${safeText(order.delivery_address)}</p>` : ''}
        <ul class="items">${itemMarkup}</ul>
        ${order.notes ? `<p class="order-detail"><b>Notes:</b> ${safeText(order.notes)}</p>` : ''}
        <footer class="order-footer"><strong>${(Number(order.subtotal) / 1000).toFixed(3)} BHD</strong><span>${order.payment_status === 'paid' ? 'Payment received' : `<button class="secondary-button payment-button" type="button" data-order-id="${safeText(order.id)}" data-next-payment-status="paid">Mark payment received</button>`}</span>${next ? `<button class="primary-button status-button" type="button" data-order-id="${safeText(order.id)}" data-next-status="${next}">Mark ${safeText(next)}</button>` : '<span class="complete-label">Completed</span>'}</footer>
      </article>`;
    }).join('');
  }

  async function loadOrders(announceNew = true) {
    try {
      const orders = await api('orders?select=id,order_reference,created_at,customer_name,customer_phone,method,payment_method,payment_status,delivery_address,notes,items,subtotal,status&order=created_at.desc&limit=100');
      renderOrders(orders, announceNew);
      connectionStatus.textContent = `Connected · refreshed ${new Date().toLocaleTimeString()}`;
      connectionStatus.classList.remove('notice-error');
    } catch (error) {
      connectionStatus.textContent = error.message;
      connectionStatus.classList.add('notice-error');
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    loginError.hidden = true;
    const button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const fields = new FormData(loginForm);
      session = await authenticate(String(fields.get('email')).trim(), String(fields.get('password')));
      localStorage.setItem(sessionKey, JSON.stringify(session));
      await verifyStaffMembership();
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.error('Staff order notifications could not be enabled:', error);
        }
      }
      loginForm.reset();
      showOrders();
      await loadOrders(false);
    } catch (error) {
      if (session) clearSession();
      loginError.textContent = error.message;
      loginError.hidden = false;
    } finally {
      button.disabled = false;
    }
  });

  signoutButton.addEventListener('click', clearSession);
  document.querySelector('#refresh-button').addEventListener('click', () => loadOrders(false));
  orderList.addEventListener('click', async (event) => {
    const paymentButton = event.target.closest('[data-order-id][data-next-payment-status]');
    const button = event.target.closest('[data-order-id][data-next-status]');
    if (!paymentButton && !button) return;
    const selectedButton = paymentButton || button;
    selectedButton.disabled = true;
    try {
      const id = encodeURIComponent(selectedButton.dataset.orderId);
      const field = paymentButton ? 'payment_status' : 'status';
      const value = paymentButton ? selectedButton.dataset.nextPaymentStatus : selectedButton.dataset.nextStatus;
      await api(`orders?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ [field]: value }),
      });
      await loadOrders(false);
    } catch (error) {
      connectionStatus.textContent = error.message;
      connectionStatus.classList.add('notice-error');
      selectedButton.disabled = false;
    }
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });

  try {
    const stored = JSON.parse(localStorage.getItem(sessionKey) || 'null');
    if (stored?.access_token && stored?.refresh_token) {
      session = stored;
      verifyStaffMembership().then(() => {
        showOrders();
        loadOrders(false);
      }).catch((error) => {
        clearSession();
        loginError.textContent = error.message;
        loginError.hidden = false;
      });
    }
  } catch (error) {
    console.error('Unable to restore the staff session:', error);
    localStorage.removeItem(sessionKey);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js')
      .catch((error) => console.error('Staff app offline cache registration failed:', error)));
  }
})();
