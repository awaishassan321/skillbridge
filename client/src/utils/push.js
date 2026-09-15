import axios from 'axios';
import { API_BASE_URL } from '../config';

export const isPushSupported = () =>
  'serviceWorker' in navigator && 'PushManager' in window;

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const getPushPermissionState = () =>
  isPushSupported() ? Notification.permission : 'unsupported';

// Returns the current subscription, or null if the user isn't subscribed.
export const getCurrentSubscription = async () => {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
};

export const subscribeToPush = async () => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported on this browser.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const { data } = await axios.get(`${API_BASE_URL}/api/push/vapid-public-key`);
  if (!data.publicKey) {
    throw new Error('Push notifications are not configured on the server.');
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.publicKey)
  });

  const token = localStorage.getItem('token');
  await axios.post(`${API_BASE_URL}/api/push/subscribe`, subscription.toJSON(), {
    headers: { Authorization: `Bearer ${token}` }
  });

  return subscription;
};

export const unsubscribeFromPush = async () => {
  const subscription = await getCurrentSubscription();
  if (!subscription) return;

  const token = localStorage.getItem('token');
  await axios.post(
    `${API_BASE_URL}/api/push/unsubscribe`,
    { endpoint: subscription.endpoint },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  await subscription.unsubscribe();
};
