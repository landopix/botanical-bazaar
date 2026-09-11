export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function restockEmail(record, phase) {
  if (phase === 'nurseryOwner') return {
    subject: 'Nursery release update request',
    text: `A customer requested nursery release updates: ${record.email}\nPlease follow up about upcoming releases.`,
    html: `<p>A customer requested nursery release updates: ${escapeHtml(record.email)}</p><p>Please follow up about upcoming releases.</p>`,
  };
  const back = phase === 'restock';
  const nursery = record.type === 'nursery_update_waitlist';
  const plant = `${record.name}${record.variantTitle ? ` — ${record.variantTitle}` : ''}`;
  const subject = back ? `Back in stock: ${plant}` : nursery ? 'You’re on the nursery update list' : `You’re on the waitlist: ${plant}`;
  const message = back
    ? `${plant} is available to order again. Stock can change quickly; this notification does not reserve a plant or guarantee availability at checkout.`
    : nursery ? 'Your nursery update request is saved. We’ll contact you about upcoming releases.'
      : `${plant} is currently sold out. Your request is saved, and we’ll email you when this selection is available again. We don’t have a confirmed restock date yet.`;
  const url = nursery ? 'https://thebotanicalbazaar.com/shop' : `https://thebotanicalbazaar.com/product/${encodeURIComponent(record.slug)}${record.variantId ? `?variant=${encodeURIComponent(record.variantId)}` : ''}`;
  const cancel = `https://thebotanicalbazaar.com/api/restock-unsubscribe?id=${record.id}&token=${record.token}`;
  return {
    subject,
    ...(!nursery ? { template: {
      id: back ? 'plant-back-in-stock-v1' : 'plant-waitlist-confirmation-v1',
      variables: { PLANT_NAME: escapeHtml(plant), PRODUCT_URL: url, CANCEL_URL: cancel },
    } } : {}),
    text: `${subject}\n\n${message}\n\nView plant: ${url}\n\nCancel this alert: ${cancel}\n\nThe Botanical Bazaar · St. Petersburg, FL\nQuestions? Reply to info@thebotanicalbazaar.com.`,
    html: `<div style="background:#00301E;color:#F5E7C4;padding:32px;font:17px Georgia,serif;max-width:560px;margin:auto;border:1px solid #D4B06A;border-radius:12px"><p style="color:#D4B06A;letter-spacing:2px">THE BOTANICAL BAZAAR</p><h1 style="color:#D4B06A;font-size:26px">${back ? 'Your plant is back' : 'You’re on the list'}</h1><h2 style="font-size:20px">${escapeHtml(plant)}</h2><p style="line-height:1.6">${escapeHtml(message)}</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#D4B06A;color:#00301E;padding:12px 20px;border-radius:24px;text-decoration:none">${back ? 'View available plant' : 'View the nursery'}</a></p><p style="font-size:14px;line-height:1.5">St. Petersburg, Florida<br>Questions? Reply to this email.</p><a href="${escapeHtml(cancel)}" style="color:#D4B06A;font-size:14px">Cancel this alert</a></div>`,
  };
}
