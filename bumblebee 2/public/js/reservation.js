// ============================================
// BUMBLEBEE LOUNGE — Reservation Logic
// ============================================

import { db } from '../../firebase-config.js';
import {
  collection, addDoc, updateDoc, doc,
  onSnapshot, query, orderBy, where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  generateOrderId,
  sendReservationToClient,
  sendReservationToOwner
} from './receipt.js';

// === PLACE RESERVATION ===
export async function placeReservation(data) {
  const reservation = {
    reservationId: `RES-${Math.floor(Math.random() * 9000) + 1000}`,
    clientName: data.name,
    clientPhone: data.phone,
    date: data.date,
    time: data.time,
    guests: data.guests,
    hookah: data.hookah || '—',
    match: data.match || null,
    status: 'pending', // pending | confirmed | cancelled | arrived
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'reservations'), reservation);
    reservation.id = docRef.id;
    reservation.createdAt = new Date().toISOString();

    // Send confirmations via WhatsApp
    setTimeout(() => sendReservationToClient(reservation), 500);
    setTimeout(() => sendReservationToOwner(reservation), 1500);

    return reservation;
  } catch (err) {
    console.error('Error placing reservation:', err);
    throw err;
  }
}

// === UPDATE RESERVATION STATUS ===
export async function updateReservationStatus(reservationId, status) {
  try {
    await updateDoc(doc(db, 'reservations', reservationId), { status });
  } catch (err) {
    console.error('Error updating reservation:', err);
    throw err;
  }
}

// === LISTEN TO ALL RESERVATIONS (owner) ===
export function listenToAllReservations(callback) {
  const q = query(
    collection(db, 'reservations'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snapshot => {
    const reservations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reservations);
  });
}

// === LISTEN TO TODAY'S RESERVATIONS (worker) ===
export function listenToTodayReservations(callback) {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'reservations'),
    where('date', '==', today),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snapshot => {
    const reservations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reservations);
  });
}

// === LISTEN TO UPCOMING RESERVATIONS ===
export function listenToUpcomingReservations(callback) {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'reservations'),
    where('date', '>=', today),
    where('status', 'in', ['pending', 'confirmed']),
    orderBy('date', 'asc')
  );
  return onSnapshot(q, snapshot => {
    const reservations = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(reservations);
  });
}

// === GET STATUS LABEL ===
export function getStatusLabel(status) {
  const labels = {
    pending:   { text: '⏳ En attente',   color: '#c9a84c' },
    confirmed: { text: '✅ Confirmée',    color: '#25d366' },
    cancelled: { text: '❌ Annulée',      color: '#e05252' },
    arrived:   { text: '🟢 Arrivé',       color: '#25d366' },
  };
  return labels[status] || labels['pending'];
}

// === SEND CONFIRMATION TO CLIENT ===
export function sendConfirmationToClient(reservation) {
  const text = `✅ *BUMBLEBEE LOUNGE — Réservation confirmée !*

📋 *${reservation.reservationId}*
👤 ${reservation.clientName}
📅 ${reservation.date} · ${reservation.time}
👥 ${reservation.guests} personne(s)
🪄 Chicha: ${reservation.hookah}

Votre réservation est *confirmée* ✅
Nous vous attendons !

📍 M69W+792, Djelfa
🐝 Bumblebee Lounge`;

  const phone = reservation.clientPhone.replace(/\s/g, '').replace('+', '');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// === SEND CANCELLATION TO CLIENT ===
export function sendCancellationToClient(reservation) {
  const text = `❌ *BUMBLEBEE LOUNGE — Réservation annulée*

📋 *${reservation.reservationId}*
👤 ${reservation.clientName}
📅 ${reservation.date} · ${reservation.time}

Votre réservation a été annulée.
Pour plus d'infos, contactez-nous :
📞 +213 778 097 833

🐝 Bumblebee Lounge`;

  const phone = reservation.clientPhone.replace(/\s/g, '').replace('+', '');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}

// === VALIDATE RESERVATION FORM ===
export function validateReservation(data) {
  const errors = {};
  if (!data.name || data.name.trim().length < 2)
    errors.name = 'Nom invalide';
  if (!data.phone || data.phone.replace(/\s/g, '').length < 9)
    errors.phone = 'Numéro invalide';
  if (!data.date)
    errors.date = 'Date requise';
  if (!data.time)
    errors.time = 'Heure requise';
  if (!data.guests)
    errors.guests = 'Nombre de personnes requis';

  // Check date is not in the past
  if (data.date) {
    const selected = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today)
      errors.date = 'La date ne peut pas être dans le passé';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}