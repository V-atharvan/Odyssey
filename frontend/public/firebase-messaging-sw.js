// Firebase Messaging Service Worker
// This file MUST be at the root of /public/ to be served at /firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDXeD4ae4UZcKDfNBJOHa8QkhyiZ6nbkfc",
  authDomain: "odyssey-talent-platform.firebaseapp.com",
  projectId: "odyssey-talent-platform",
  storageBucket: "odyssey-talent-platform.firebasestorage.app",
  messagingSenderId: "729868513653",
  appId: "1:729868513653:web:084bcaa89efa3e7de4633c",
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'Odyssey', {
    body: body || 'You have a new notification.',
    icon: icon || '/logo.png',
    badge: '/logo.png',
    tag: 'odyssey-notification',
    requireInteraction: false,
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open Odyssey' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
