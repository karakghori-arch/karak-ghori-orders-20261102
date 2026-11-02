const menuData = typeof module !== 'undefined' && module.exports
  ? require('./menu-data.js')
  : window.KarakGhoriMenuData;
const { categories: menuCategories } = menuData;
const menuImages = typeof module !== 'undefined' && module.exports
  ? require('./menu-image-data.js')
  : window.KarakGhoriMenuImages;
const categoryById = new Map(menuCategories.map((category) => [category.id, category]));
const categoryStyles = {
  'karak-hot-beverages': ['☕', '#60452e', '#d2a35c'],
  'hibiscus-tea': ['🌺', '#65304c', '#d85f91'],
  'fresh-juices': ['🍹', '#426b42', '#8cc76d'],
  'pure-juices': ['🥤', '#455f3c', '#9fc56b'],
  sarbath: ['🍋', '#5f7040', '#c4bd5f'],
  'fruit-ice-cream': ['🍨', '#714a72', '#d792b9'],
  'milk-shakes': ['🥤', '#69445e', '#bd7e9a'],
  mojitos: ['🍸', '#356b61', '#7ecba0'],
  'ghori-special': ['✨', '#68502e', '#e3b15b'],
  sandwiches: ['🥪', '#70482d', '#d39a55'],
  'club-sandwiches': ['🥪', '#6e4c32', '#c69a62'],
  malgoum: ['🌯', '#70452a', '#da9c54'],
  'mini-roomi': ['🌯', '#70452a', '#d7a268'],
  plates: ['🍽️', '#5b4332', '#b98a59'],
  bakery: ['🥟', '#80521f', '#dfb66a'],
};

const menuItems = menuData.menuItems.map((item) => {
  const category = categoryById.get(item.cat);
  const [emoji, color1, color2] = categoryStyles[item.cat] || ['🍽️', '#604b35', '#c39354'];
  const options = item.options.length ? item.options : [{ label: 'Regular', price: 0 }];
  return {
    ...item,
    subtitle: item.desc,
    about: item.desc,
    tagline: item.desc,
    category: category?.label || item.cat,
    categoryArabic: category?.ar || item.cat,
    price: options[0].price,
    options,
    image: menuImages.localImageFor(item),
    video: menuImages.localVideoFor(item),
    emoji,
    colors: [color1, color2],
  };
});

function searchItems(query) {
  const normalized = String(query ?? '').trim().toLocaleLowerCase();
  if (!normalized) return menuItems;
  return menuItems.filter((item) => [
    item.name, item.ar, item.category, item.categoryArabic, item.desc,
    ...item.options.map((option) => option.label),
  ].filter(Boolean).join(' ').toLocaleLowerCase().includes(normalized));
}

function toggleCartItem(items, item) {
  return items.some((entry) => entry.id === item.id)
    ? items.filter((entry) => entry.id !== item.id)
    : [...items, item];
}

function selectedOptionIndex(item) {
  if (!item.options?.length) return undefined;
  const index = Number(item.optionIndex);
  return Number.isInteger(index) && index >= 0 && index < item.options.length ? index : 0;
}

function sameCartItem(entry, id, optionIndex) {
  if (entry.id !== id) return false;
  if (optionIndex === undefined) return true;
  return selectedOptionIndex(entry) === optionIndex;
}

function addCartItem(items, item) {
  const optionIndex = selectedOptionIndex(item);
  const option = optionIndex === undefined ? null : item.options[optionIndex];
  const cartItem = {
    ...item,
    ...(option ? { optionIndex, optionLabel: option.label, price: option.price } : {}),
  };
  const existing = items.find((entry) => sameCartItem(entry, item.id, optionIndex));
  return existing
    ? items.map((entry) => sameCartItem(entry, item.id, optionIndex)
      ? { ...entry, quantity: (entry.quantity ?? 1) + 1 }
      : entry)
    : [...items, { ...cartItem, quantity: 1 }];
}

function setCartQuantity(items, id, quantity, optionIndex) {
  const nextQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
  if (nextQuantity === 0) return items.filter((entry) => !sameCartItem(entry, id, optionIndex));
  return items.map((entry) => sameCartItem(entry, id, optionIndex) ? { ...entry, quantity: nextQuantity } : entry);
}

function cartTotal(items) {
  return items.reduce((total, item) => total + item.price * (item.quantity ?? 1), 0);
}

const api = { menuItems, menuCategories, searchItems, toggleCartItem, addCartItem, setCartQuantity, cartTotal };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.KarakGhoriCatalog = api;
