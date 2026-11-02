const businessNumber = '97337212318';

function formatOrderMessage(order, language = 'en') {
  const arabic = language === 'ar';
  const money = (value) => {
    const formatted = new Intl.NumberFormat(arabic ? 'ar-BH' : 'en-BH', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value / 1000);
    return arabic ? `${formatted} د.ب` : `BHD ${formatted}`;
  };
  const method = arabic
    ? ({ delivery: 'توصيل', 'dine-in': 'تناول في المطعم', pickup: 'استلام من الفرع' })[order.method]
    : ({ delivery: 'Delivery', 'dine-in': 'Dine-in', pickup: 'Pickup' })[order.method];
  const paymentMethod = order.paymentMethod === 'benefitpay'
    ? (arabic ? 'BenefitPay (بانتظار تعليمات الموظفين والتحقق من الدفع)' : 'BenefitPay (await staff instructions and payment verification)')
    : (arabic
      ? (order.method === 'delivery' ? 'نقدًا عند التوصيل' : 'نقدًا في المطعم')
      : (order.method === 'delivery' ? 'Cash on delivery' : 'Cash at restaurant'));
  const lines = order.items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const option = item.optionLabel ? ` (${item.optionLabel})` : '';
    return `• ${quantity} × ${item.name}${option} — ${money(item.price)} each — ${money(item.price * quantity)}`;
  });

  if (arabic) {
    return [
      'طلب جديد — كرك غوري',
      `رقم الطلب: ${order.orderId}`,
      `الاسم: ${order.name}`,
      order.phone ? `هاتف العميل: ${order.phone}` : null,
      `طريقة الطلب: ${method}`,
      `طريقة الدفع: ${paymentMethod}`,
      order.address ? `العنوان: ${order.address}` : null,
      '',
      ...lines,
      '',
      `مجموع الأصناف: ${money(order.total)}`,
      order.notes ? `ملاحظات: ${order.notes}` : null,
      '',
      'يرجى تأكيد توفر الأصناف وأي رسوم توصيل عبر واتساب. الطلب غير مؤكد حتى رد الموظف.',
    ].filter((line) => line !== null).join('\n');
  }

  return [
    'New order request — Karak Ghori',
    `Order reference: ${order.orderId}`,
    `Name: ${order.name}`,
    order.phone ? `Customer phone: ${order.phone}` : null,
    `Order method: ${method}`,
    `Payment method: ${paymentMethod}`,
    order.address ? `Delivery address: ${order.address}` : null,
    '',
    ...lines,
    '',
    `Items subtotal: ${money(order.total)}`,
    order.notes ? `Notes: ${order.notes}` : null,
    '',
    'Please confirm item availability and any delivery charge in WhatsApp. The order is not confirmed until staff replies.',
  ].filter((line) => line !== null).join('\n');
}

function buildWhatsAppUrl(message) {
  const url = new URL(`https://wa.me/${businessNumber}`);
  url.searchParams.set('text', String(message));
  return url.toString();
}

const orderApi = { businessNumber, formatOrderMessage, buildWhatsAppUrl };
if (typeof module !== 'undefined' && module.exports) module.exports = orderApi;
if (typeof window !== 'undefined') window.KarakGhoriOrder = orderApi;
