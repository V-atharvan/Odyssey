/**
 * useFCM — Firebase Cloud Messaging hook
 * - Requests browser notification permission
 * - Gets FCM device token
 * - Saves token to backend
 * - Listens for foreground push messages
 */
import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './config';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import axiosInstance from '../api/api';

// ⚠️ Replace with your VAPID key from Firebase Console:
// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = 'YOUR_VAPID_PUBLIC_KEY';

export function useFCM(user) {
  useEffect(() => {
    if (!user || !messaging) return;

    let unsubscribe = null;

    const initFCM = async () => {
      try {
        // 1. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[FCM] Notification permission denied');
          return;
        }

        // 2. Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
        });

        if (token) {
          console.log('[FCM] Token obtained:', token.substring(0, 20) + '...');
          // 3. Save token to backend (best effort — don't block app if this fails)
          try {
            await axiosInstance.post('/users/fcm-token', { token });
          } catch (e) {
            console.debug('[FCM] Could not save token to backend:', e.message);
          }
        }

        // 4. Listen for foreground messages
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground message:', payload);
          const { title, body } = payload.notification || {};

          toast.custom(
            (t) => (
              <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                  max-w-sm w-full bg-surface-900/95 border border-emerald-500/20 
                  backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto 
                  flex items-start gap-4 p-4 ring-1 ring-black/10`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-normal leading-tight">
                    {title || 'Odyssey'}
                  </p>
                  <p className="mt-1 text-xs text-white/60 font-semibold leading-relaxed">
                    {body || 'You have a new notification.'}
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-white/30 hover:text-white text-lg leading-none transition-colors"
                >
                  ×
                </button>
              </div>
            ),
            { duration: 6000 }
          );
        });
      } catch (err) {
        console.warn('[FCM] Initialization error:', err.message);
      }
    };

    initFCM();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.userId]);
}
