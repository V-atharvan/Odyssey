/**
 * Odyssey Analytics — Firebase Analytics wrapper
 * Usage: import { logOdysseyEvent } from '../firebase/analytics';
 *        logOdysseyEvent('project_viewed', { projectId: '123', projectTitle: 'AI App' });
 */
import { logEvent } from 'firebase/analytics';
import { analytics } from './config';

/**
 * Log a custom event to Firebase Analytics.
 * Silently skips if Analytics is not yet initialized (e.g. SSR, ad blocker).
 */
export function logOdysseyEvent(eventName, params = {}) {
  try {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch (e) {
    // Never crash the app due to analytics
    console.debug('[Analytics] Failed to log event:', eventName, e.message);
  }
}

// ─── Pre-defined Event Helpers ───────────────────────────────────────────────

export const analyticsEvents = {
  login: (method = 'email') =>
    logOdysseyEvent('login', { method }),

  signUp: (role, method = 'email') =>
    logOdysseyEvent('sign_up', { role, method }),

  pageView: (pageName) =>
    logOdysseyEvent('page_view', { page_title: pageName }),

  projectViewed: (projectId, projectTitle) =>
    logOdysseyEvent('select_content', { content_type: 'project', item_id: projectId, content_id: projectTitle }),

  applicationSubmitted: (projectId, projectTitle) =>
    logOdysseyEvent('application_submitted', { project_id: projectId, project_title: projectTitle }),

  assessmentStarted: (assessmentId, subject) =>
    logOdysseyEvent('assessment_started', { assessment_id: assessmentId, subject }),

  assessmentCompleted: (assessmentId, score, passed) =>
    logOdysseyEvent('assessment_completed', { assessment_id: assessmentId, score, passed }),

  resumeUploaded: (method) =>
    logOdysseyEvent('resume_uploaded', { method }), // 'file' | 'url'

  avatarUploaded: () =>
    logOdysseyEvent('avatar_uploaded'),

  chatMessageSent: (senderRole) =>
    logOdysseyEvent('chat_message_sent', { sender_role: senderRole }),

  notificationOpened: (type) =>
    logOdysseyEvent('notification_opened', { type }),

  profileCompleted: (role) =>
    logOdysseyEvent('profile_completed', { role }),
};
