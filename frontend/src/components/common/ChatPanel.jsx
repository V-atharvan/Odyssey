import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, ArrowLeft, Search,
  Users, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getOrCreateChat, sendMessage,
  subscribeToMessages, subscribeToUserChats
} from '../../firebase/ChatService';
import { analyticsEvents } from '../../firebase/analytics';
import axiosInstance from '../../api/api';

// Who can chat with whom
const CHAT_ALLOWED_ROLES = {
  // Students can chat with companies, college admins, and other students (project co-members)
  STUDENT: ['COMPANY', 'COLLEGE_ADMIN', 'STUDENT'],
  COMPANY: ['STUDENT', 'COLLEGE_ADMIN', 'COMPANY'],
  COLLEGE_ADMIN: ['COMPANY', 'STUDENT', 'COLLEGE_ADMIN'],
  ADMIN: ['STUDENT', 'COMPANY', 'COLLEGE_ADMIN', 'ADMIN'],
};

const ROLE_LABEL = {
  STUDENT: 'Student',
  COMPANY: 'Company',
  COLLEGE_ADMIN: 'College Admin',
  ADMIN: 'Admin',
};

// Role badge colors — works in both light and dark
const ROLE_BADGE = {
  STUDENT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  COMPANY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  COLLEGE_ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

function Avatar({ name = '?', role }) {
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${ROLE_BADGE[role] || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white'}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ROLE_BADGE[role] || 'bg-slate-100 text-slate-500'}`}>
      {ROLE_LABEL[role] || role}
    </span>
  );
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeOtherUser, setActiveOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Allowed roles this user can chat with
  const allowedRoles = CHAT_ALLOWED_ROLES[user?.role] || [];

  // Subscribe to user's chat list
  useEffect(() => {
    if (!user?.userId || !isOpen) return;
    const unsub = subscribeToUserChats(user.userId, setChats);
    return () => unsub();
  }, [user?.userId, isOpen]);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!activeChatId) return;
    const unsub = subscribeToMessages(activeChatId, setMessages);
    return () => unsub();
  }, [activeChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when entering chat
  useEffect(() => {
    if (view === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  }, [view]);

  const openChat = async (otherUser) => {
    try {
      const chatId = await getOrCreateChat(user, otherUser);
      setActiveChatId(chatId);
      setActiveOtherUser(otherUser);
      setView('chat');
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) {
      console.error('Failed to open chat:', e);
    }
  };

  const openExistingChat = (chat) => {
    const otherId = chat.participants.find((p) => p !== String(user.userId));
    const otherName = chat.participantNames?.[otherId] || 'Unknown';
    const otherRole = chat.participantRoles?.[otherId] || 'STUDENT';
    openChat({ userId: otherId, fullName: otherName, role: otherRole });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChatId || sending) return;
    setSending(true);
    try {
      await sendMessage(activeChatId, user, newMessage);
      analyticsEvents.chatMessageSent(user.role);
      setNewMessage('');
    } catch (e) {
      console.error('Failed to send:', e);
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(q)}`);
      // Normalize: backend returns `id`, ChatPanel expects `userId`
      // Backend already enforces role/project-based filtering server-side
      const results = (res.data?.data || [])
        .map((u) => ({ ...u, userId: u.userId ?? u.id }))
        .filter((u) => String(u.userId) !== String(user.userId));
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const unreadCount = 0;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="chat-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-[200] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90
          ${isOpen
            ? 'bg-red-500 shadow-red-500/30'
            : 'bg-primary-600 shadow-primary-500/30 hover:bg-primary-500'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageSquare size={22} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                  {unreadCount}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 left-6 z-[199] w-[360px] h-[540px] flex flex-col overflow-hidden rounded-[2rem] shadow-2xl
              bg-white dark:bg-[#0B0F19]
              border border-slate-200/80 dark:border-white/10"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-3 bg-gradient-to-r from-primary-600/5 dark:from-primary-600/10 to-transparent shrink-0">
              {view === 'chat' && (
                <button
                  onClick={() => setView('list')}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              {view === 'chat' && activeOtherUser ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={activeOtherUser.fullName} role={activeOtherUser.role} />
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white text-sm leading-none truncate">{activeOtherUser.fullName}</p>
                    <RoleBadge role={activeOtherUser.role} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                    <MessageSquare size={16} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-normal text-sm">Messages</h3>
                </div>
              )}
            </div>

            {/* List View */}
            {view === 'list' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                    <input
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-8 pr-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {/* Search Results */}
                  {searchQuery.length >= 2 && (
                    <div className="px-2 py-2">
                      <p className="text-[10px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest px-3 mb-2">Search Results</p>
                      {searching ? (
                        <div className="flex justify-center py-6">
                          <div className="w-5 h-5 border-2 border-primary-200 dark:border-primary-500/20 border-t-primary-600 dark:border-t-primary-500 rounded-full animate-spin" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <p className="text-xs text-slate-400 dark:text-white/20 text-center py-6 font-bold">
                          {allowedRoles.length === 0 ? 'Chat not available for your role' : 'No users found'}
                        </p>
                      ) : searchResults.map((u) => (
                        <button
                          key={u.userId}
                          onClick={() => openChat(u)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group text-left"
                        >
                          <Avatar name={u.fullName} role={u.role} />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 dark:text-white text-sm truncate">{u.fullName}</p>
                            <RoleBadge role={u.role} />
                          </div>
                          <ChevronRight size={14} className="text-slate-300 dark:text-white/20 group-hover:text-primary-500 transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Existing Chats */}
                  {searchQuery.length < 2 && (
                    <div className="px-2 py-2">
                      <p className="text-[10px] text-slate-400 dark:text-white/30 font-black uppercase tracking-widest px-3 mb-2">Recent Conversations</p>
                      {chats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                            <Users size={24} className="text-slate-300 dark:text-white/20" />
                          </div>
                          <p className="text-xs font-black text-slate-400 dark:text-white/30 uppercase tracking-widest text-center leading-relaxed">
                            No conversations yet.<br />Search to start chatting.
                          </p>
                        </div>
                      ) : chats.map((chat) => {
                        const otherId = chat.participants?.find((p) => p !== String(user.userId));
                        const otherName = chat.participantNames?.[otherId] || 'Unknown';
                        const otherRole = chat.participantRoles?.[otherId];
                        return (
                          <button
                            key={chat.id}
                            onClick={() => openExistingChat(chat)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group text-left"
                          >
                            <Avatar name={otherName} role={otherRole} />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-900 dark:text-white text-sm truncate">{otherName}</p>
                              <p className="text-[11px] text-slate-500 dark:text-white/40 truncate font-medium mt-0.5">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 dark:text-white/20 group-hover:text-primary-500 transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chat View */}
            {view === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                      <MessageSquare size={32} className="text-slate-400 dark:text-white/20" />
                      <p className="text-xs font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Start the conversation</p>
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isMine = String(msg.senderId) === String(user.userId);
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {!isMine && <Avatar name={msg.senderName} role={msg.senderRole} />}
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed
                            ${isMine
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-md'}`}
                          >
                            {msg.text}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-white/20 font-bold px-1">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-2 shrink-0 bg-white dark:bg-transparent">
                  <input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500/50 transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
