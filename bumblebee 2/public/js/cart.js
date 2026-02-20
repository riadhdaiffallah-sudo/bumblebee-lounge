// ============================================
// BUMBLEBEE LOUNGE — Cart Logic
// ============================================

const CART_KEY = 'bb_cart';

// === GET CART ===
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// === SAVE CART ===
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// === ADD ITEM ===
export function addToCart(item) {
  // item = { id, name, price, qty }
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
  updateCartBadge();
  return cart;
}

// === REMOVE ITEM ===
export function removeFromCart(itemId) {
  const cart = getCart().filter(i => i.id !== itemId);
  saveCart(cart);
  updateCartBadge();
  return cart;
}

// === UPDATE QUANTITY ===
export function updateQty(itemId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (item) {
    if (qty <= 0) return removeFromCart(itemId);
    item.qty = qty;
    saveCart(cart);
    updateCartBadge();
  }
  return getCart();
}

// === CLEAR CART ===
export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// === GET TOTAL ===
export function getTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

// === GET COUNT ===
export function getCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// === UPDATE CART BADGE (navbar) ===
export function updateCartBadge() {
  const count = getCount();
  // Update all badge elements on page
  document.querySelectorAll('.cart-badge, #cartCount, #cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  // Show/hide cart FAB button
  const fab = document.getElementById('cartFloat');
  if (fab) fab.classList.toggle('show', count > 0);
}

// === RENDER CART ITEMS (for cart.html) ===
export function renderCartItems(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--gray)">
        <div style="font-size:2.5rem;margin-bottom:16px">🛒</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:300;margin-bottom:8px">Panier vide</div>
        <div style="font-size:.62rem;letter-spacing:.1em;margin-bottom:24px">Ajoutez des articles depuis le menu</div>
        <a href="menu.html" style="display:inline-flex;padding:13px 28px;border:1px solid rgba(201,168,76,.4);color:var(--gold);font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;text-decoration:none;font-family:'Montserrat',sans-serif">Voir le menu →</a>
      </div>`;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item" id="item-${item.id}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} DA / unité</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-val" id="qty-${item.id}">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        <span class="item-subtotal" id="sub-${item.id}">${item.price * item.qty} DA</span>
        <button class="remove-btn" onclick="removeItem('${item.id}')">✕</button>
      </div>
    </div>
  `).join('');
}

// === CHANGE QTY (called from HTML) ===
window.changeQty = function(itemId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === itemId);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) {
    removeFromCart(itemId);
    document.getElementById('item-' + itemId)?.remove();
  } else {
    updateQty(itemId, newQty);
    const qtyEl = document.getElementById('qty-' + itemId);
    const subEl = document.getElementById('sub-' + itemId);
    if (qtyEl) qtyEl.textContent = newQty;
    if (subEl) subEl.textContent = (item.price * newQty) + ' DA';
  }
  // Update total
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = getTotal() + ' DA';
  updateCartBadge();
};

// === REMOVE ITEM (called from HTML) ===
window.removeItem = function(itemId) {
  removeFromCart(itemId);
  document.getElementById('item-' + itemId)?.remove();
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = getTotal() + ' DA';
  // If cart empty, reload to show empty state
  if (getCart().length === 0) location.reload();
};

// === INIT CART (call on every page) ===
export function initCart() {
  updateCartBadge();
}