/**
 * ChatService — Firestore real-time chat utilities
 * Collection structure:
 *   chats/{chatId}           → { participants: [uid1, uid2], lastMessage, lastAt, names }
 *   chats/{chatId}/messages  → { text, senderId, senderName, senderRole, createdAt, read }
 */
import {
  collection, doc, addDoc, setDoc, getDoc, getDocs,
  query, orderBy, onSnapshot, where, serverTimestamp,
  updateDoc, limit
} from 'firebase/firestore';
import { db } from './config';

/** Generate a deterministic chat ID from two user IDs */
export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

/** Get or create a chat document between two users */
export async function getOrCreateChat(currentUser, otherUser) {
  const chatId = getChatId(String(currentUser.userId), String(otherUser.userId));
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [String(currentUser.userId), String(otherUser.userId)],
      participantNames: {
        [String(currentUser.userId)]: currentUser.fullName || currentUser.email,
        [String(otherUser.userId)]: otherUser.fullName || otherUser.email,
      },
      participantRoles: {
        [String(currentUser.userId)]: currentUser.role,
        [String(otherUser.userId)]: otherUser.role,
      },
      lastMessage: '',
      lastAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  return chatId;
}

/** Send a message to a chat */
export async function sendMessage(chatId, sender, text) {
  if (!text.trim()) return;

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    text: text.trim(),
    senderId: String(sender.userId),
    senderName: sender.fullName || sender.email,
    senderRole: sender.role,
    createdAt: serverTimestamp(),
    read: false,
  });

  // Update last message on chat doc
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: text.trim().length > 60 ? text.trim().substring(0, 60) + '...' : text.trim(),
    lastAt: serverTimestamp(),
  });
}

/** Subscribe to real-time messages in a chat — returns unsubscribe fn */
export function subscribeToMessages(chatId, callback) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}

/** Get all chats for a user */
export async function getUserChats(userId) {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', String(userId)), orderBy('lastAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Subscribe to user's chat list in real-time */
export function subscribeToUserChats(userId, callback) {
  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', String(userId)), orderBy('lastAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(chats);
  });
}
