(() => {
  const config = window.KarakGhoriCloudConfig || {};

  function getEndpoint(path) {
    const url = String(config.supabaseUrl || '').trim();
    const key = String(config.anonKey || '').trim();
    if (!url || !key) {
      throw new Error('Online order receiving is not configured. Restaurant setup requires a Supabase project URL and public anon/publishable key, the orders schema and payment migration, and a newly published app. Please contact the restaurant.');
    }

    let base;
    try {
      base = new URL(url);
    } catch {
      throw new Error('The online order service URL is invalid.');
    }
    if (base.protocol !== 'https:' || base.username || base.password) {
      throw new Error('The online order service must use a secure HTTPS URL.');
    }
    if (/(^|\.)netlify\.app$/i.test(base.hostname)) {
      throw new Error('The configured URL is a Netlify website, not a Supabase project. Use the project URL from Supabase Project Settings > API.');
    }
    return { url: `${base.origin}/rest/v1/${path}`, key };
  }

  async function submitOrder(order, fetchImplementation = window.fetch.bind(window)) {
    const { url, key } = getEndpoint('orders');
    const payload = {
      order_reference: order.orderId,
      customer_name: order.name,
      customer_phone: order.phone,
      method: order.method,
      payment_method: order.paymentMethod,
      delivery_address: order.address,
      notes: order.notes,
      items: order.items.map((item) => ({
        name: item.name,
        option_label: item.optionLabel || '',
        unit_price: item.price,
        quantity: item.quantity,
      })),
      subtotal: order.total,
    };
    const response = await fetchImplementation(url, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const guidance = response.status === 401 || response.status === 403
        ? ' Check the Supabase public key and anonymous order-insert policy.'
        : response.status === 404
          ? ' The Supabase orders table or REST endpoint may be missing; apply the staff-app schema and required migration.'
          : response.status === 400
            ? ' Check that the deployed database schema matches the app version.'
            : '';
      throw new Error(`Could not send the order to staff (${response.status}).${guidance} Please try again.`);
    }
    return true;
  }

  window.KarakGhoriCloudOrders = Object.freeze({ submitOrder });
})();
