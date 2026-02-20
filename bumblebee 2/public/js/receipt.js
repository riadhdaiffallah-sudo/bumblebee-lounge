// ============================================
// BUMBLEBEE LOUNGE — Receipt Generator
// ============================================

import { db } from '../../firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const OWNER_WHATSAPP = '213778097833';

// === GENERATE ORDER ID ===
export function generateOrderId() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `BB-${num}`;
}

// === FORMAT RECEIPT TEXT ===
export function formatReceipt(order) {
  const date = new Date(order.createdAt || Date.now());
  const dateStr = date.toLocaleDateString('fr-DZ');
  const timeStr = date.toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' });

  let itemsText = '';
  let total = 0;
  order.items.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    itemsText += `• ${item.name} x${item.qty}     ${itemTotal} DA\n`;
  });

  const paymentStatus = order.paid ? '✅ PAYÉ' : '❌ NON PAYÉ';

  return `🐝 *BUMBLEBEE LOUNGE*
─────────────────
📋 Commande *${order.orderId}*
📅 ${dateStr} · ${timeStr}
👤 ${order.clientName}
─────────────────
${itemsText}─────────────────
💰 *TOTAL: ${total} DA*
─────────────────
💵 PAIEMENT: ${paymentStatus}
   Cash uniquement · Sur place
─────────────────
Merci de votre visite 🙏
📍 M69W+792, Djelfa`;
}

// === SEND RECEIPT TO CLIENT ===
export function sendReceiptToClient(order) {
  const text = formatReceipt(order);
  const phone = order.clientPhone.replace(/\s/g, '').replace('+', '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// === SEND RECEIPT TO OWNER ===
export function sendReceiptToOwner(order) {
  const text = `📥 *NOUVELLE COMMANDE*\n\n` + formatReceipt(order);
  const url = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// === SAVE ORDER TO FIREBASE ===
export async function saveOrder(orderData) {
  try {
    const order = {
      ...orderData,
      orderId: generateOrderId(),
      paid: false,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'orders'), order);
    order.id = docRef.id;
    return order;
  } catch (err) {
    console.error('Error saving order:', err);
    throw err;
  }
}

// === SAVE RESERVATION TO FIREBASE ===
export async function saveReservation(reservationData) {
  try {
    const reservation = {
      ...reservationData,
      reservationId: `RES-${Math.floor(Math.random() * 9000) + 1000}`,
      status: 'pending',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'reservations'), reservation);
    reservation.id = docRef.id;
    return reservation;
  } catch (err) {
    console.error('Error saving reservation:', err);
    throw err;
  }
}

// === FORMAT RESERVATION RECEIPT ===
export function formatReservationReceipt(res) {
  return `🐝 *BUMBLEBEE LOUNGE — Réservation*
─────────────────
📋 Réservation *${res.reservationId}*
👤 ${res.clientName}
📞 ${res.clientPhone}
📅 ${res.date} · ${res.time}
👥 ${res.guests} personne(s)
🪄 Chicha: ${res.hookah || '—'}
─────────────────
⏳ En attente de confirmation
Notre équipe vous contactera bientôt.
─────────────────
📍 M69W+792, Djelfa
🐝 Bumblebee Lounge`;
}

// === SEND RESERVATION TO CLIENT ===
export function sendReservationToClient(res) {
  const text = formatReservationReceipt(res);
  const phone = res.clientPhone.replace(/\s/g, '').replace('+', '');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// === SEND RESERVATION TO OWNER ===
export function sendReservationToOwner(res) {
  const text = `📥 *NOUVELLE RÉSERVATION*\n\n` + formatReservationReceipt(res);
  window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank');
}

// === CALCULATE TOTAL ===
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
}