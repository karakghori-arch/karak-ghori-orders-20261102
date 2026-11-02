const statuses = ['received', 'preparing', 'ready', 'completed'];
const methods = ['dine-in', 'takeaway', 'delivery'];

function normalizeOrder(order) {
  if (!order || typeof order !== 'object' || !Array.isArray(order.items) || !order.items.length) {
    throw new TypeError('A staff order must contain at least one item.');
  }
  if (!statuses.includes(order.status) || !methods.includes(order.method)) {
    throw new TypeError('A staff order has an invalid status or service method.');
  }
  const stringField = (value, field, maxLength) => {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'string' || value.length > maxLength) {
      throw new TypeError(`A staff order has an invalid ${field}.`);
    }
    return value;
  };
  const id = stringField(order.id, 'order number', 100);
  const createdAt = stringField(order.createdAt, 'creation date', 50);
  const customer = stringField(order.customer, 'customer or table', 80);
  const phone = stringField(order.phone, 'phone number', 40);
  const address = stringField(order.address, 'delivery address', 240);
  const notes = stringField(order.notes, 'kitchen notes', 300);
  if (!id.trim() || !createdAt.trim() || Number.isNaN(Date.parse(createdAt)) || !customer.trim()) {
    throw new TypeError('A staff order needs a valid order number, creation date, and customer or table.');
  }
  const items = order.items.map((item) => {
    if (!item || typeof item !== 'object') {
      throw new TypeError('A staff order contains an invalid menu item.');
    }
    const itemId = stringField(item.id, 'menu item identifier', 120);
    const name = stringField(item.name, 'menu item name', 120);
    const optionLabel = stringField(item.optionLabel, 'menu option', 80);
    const { price, quantity } = item;
    if (!itemId.trim() || !name.trim() || !Number.isSafeInteger(price) || price <= 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new TypeError('A staff order contains an invalid menu item.');
    }
    return {
      id: itemId,
      name,
      optionLabel,
      price,
      quantity,
    };
  });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!Number.isSafeInteger(total)) throw new TypeError('The staff order total is outside the supported range.');
  return {
    id,
    createdAt,
    customer,
    phone,
    address,
    method: order.method,
    notes,
    status: order.status,
    items,
    total,
  };
}

function loadStaffOrders(serialized) {
  if (!serialized) return [];
  const parsed = JSON.parse(serialized);
  if (!Array.isArray(parsed)) throw new TypeError('Saved staff orders must be a list.');
  return parsed.map(normalizeOrder);
}

function loadStaffDesk(serialized) {
  if (!serialized) return { cart: [], orders: [] };
  const parsed = JSON.parse(serialized);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.cart) || !Array.isArray(parsed.orders)) {
    throw new TypeError('Saved staff desk data is invalid.');
  }
  const cart = parsed.cart.map((entry) => {
    const optionIndex = Number(entry.optionIndex);
    const quantity = Number(entry.quantity);
    if (!entry.id || !Number.isSafeInteger(optionIndex) || optionIndex < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
      throw new TypeError('Saved staff cart data is invalid.');
    }
    return { id: String(entry.id), optionIndex, quantity };
  });
  return { cart, orders: parsed.orders.map(normalizeOrder) };
}

function createStaffOrder(values = {}) {
  const { id, createdAt, customer, method, notes, items } = values;
  const order = normalizeOrder({
    id, createdAt, customer, phone: values.phone, address: values.address,
    method, notes, status: 'received', items,
  });
  if (method === 'delivery' && !order.address.trim()) {
    throw new TypeError('A delivery staff order needs a delivery address.');
  }
  return order;
}

function advanceStaffOrder(orders, id) {
  const index = orders.findIndex((order) => order.id === id);
  if (index < 0) throw new RangeError(`Staff order not found: ${id}`);
  const statusIndex = statuses.indexOf(orders[index].status);
  if (statusIndex < 0 || statusIndex >= statuses.length - 1) {
    throw new RangeError('This staff order is already completed.');
  }
  const next = orders.slice();
  next[index] = { ...orders[index], status: statuses[statusIndex + 1] };
  return next;
}

const staffOrderApi = { statuses, methods, loadStaffOrders, loadStaffDesk, createStaffOrder, advanceStaffOrder };
if (typeof module !== 'undefined' && module.exports) module.exports = staffOrderApi;
if (typeof window !== 'undefined') window.KarakGhoriStaffOrders = staffOrderApi;
