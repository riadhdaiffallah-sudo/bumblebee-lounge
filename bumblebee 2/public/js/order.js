// ============================================
// BUMBLEBEE LOUNGE — Order Logic
// ============================================

import { db } from '../../firebase-config.js';
import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy, where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getCart, clearCart, getTotal } from './cart.js';
import { generateOrderId, sendReceiptToClient, sendReceiptToOwner } from './receipt.js';

const OWNER_WHATSAPP = '213778097833';

// === PLACE ORDER ===
export async function placeOrder(clientInfo) {
  const cart = getCart();
  if (cart.length === 0) throw new Error('Cart is empty');

  const orderId = generateOrderId();
  const total = getTotal();

  const order = {
    orderId,
    clientName: clientInfo.name,
    clientPhone: clientInfo.phone,
    items: cart,
    total,
    paid: false,
    status: 'pending', // pending | preparing | ready | done
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'orders'), order);
    order.id = docRef.id;
    order.createdAt = new Date().toISOString();

    // Clear cart after order placed
    clearCart();

    // Send receipts via WhatsApp
    setTimeout(() => sendReceiptToClient(order), 500);
    setTimeout(() => sendReceiptToOwner(order), 1500);

    return order;
  } catch (err) {
    console.error('Error placing order:', err);
    throw err;
  }
}

// === UPDATE ORDER STATUS (worker/owner) ===
export async function updateOrderStatus(orderId, status) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status });
  } catch (err) {
    console.error('Error updating status:', err);
    throw err;
  }
}

// === UPDATE PAYMENT STATUS (worker) ===
export async function updatePaymentStatus(orderId, paid) {
  try {
    await updateDoc(doc(db, 'orders', orderId), { paid });
  } catch (err) {
    console.error('Error updating payment:', err);
    throw err;
  }
}

// === LISTEN TO ALL ORDERS (owner) ===
export function listenToAllOrders(callback) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// === LISTEN TO TODAY'S ORDERS (worker) ===
export function listenToTodayOrders(callback) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const q = query(
    collection(db, 'orders'),
    where('createdAt', '>=', today),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// === LISTEN TO PENDING ORDERS (worker dashboard) ===
export function listenToPendingOrders(callback) {
  const q = query(
    collection(db, 'orders'),
    where('status', 'in', ['pending', 'preparing']),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snapshot => {
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  });
}

// === FORMAT ORDER FOR DISPLAY ===
export function formatOrderCard(order) {
  const date = order.createdAt?.toDate?.() || new Date(order.createdAt);
  const timeStr = date.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });
  const itemsList = order.items?.map(i => `${i.name} x${i.qty}`).join(', ') || '';
  const statusLabels = {
    pending: '⏳ En attente',
    preparing: '🔥 En préparation',
    ready: '✅ Prêt',
    done: '✔️ Terminé'
  };
  const paidLabel = order.paid
    ? '<span style="color:#25d366">✅ PAYÉ</span>'
    : '<span style="color:#e05252">❌ NON PAYÉ</span>';

  return { timeStr, itemsList, statusLabels, paidLabel };
}

// === SEND PAID CONFIRMATION TO CLIENT ===
export function sendPaidConfirmation(order) {
  const text = `✅ *BUMBLEBEE LOUNGE — Paiement confirmé*

📋 Commande *${order.orderId}*
👤 ${order.clientName}
💰 Total: *${order.total} DA*
💵 Statut: *PAYÉ ✅*

Merci pour votre paiement ! 🙏
À bientôt chez Bumblebee 🐝`;

  const phone = order.clientPhone.replace(/\s/g, '').replace('+', '');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}