import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { getChatSocketOrigin } from '../../shared/config/appConfig';

/** Matches server default for new conversations (faq-first). */
const defaultSupportMeta = () => ({
  chatPhase: 'faq_bot',
  supportRequestedAt: null,
  supportRequestNote: '',
  assignedTo: null,
  supportAcceptedAt: null,
  assignedAdminName: '',
});

const normalizeSupportMeta = (raw) => {
  if (!raw || typeof raw !== 'object') return defaultSupportMeta();
  return {
    chatPhase: raw.chatPhase || 'active',
    supportRequestedAt: raw.supportRequestedAt || null,
    supportRequestNote: raw.supportRequestNote || '',
    assignedTo: raw.assignedTo || null,
    supportAcceptedAt: raw.supportAcceptedAt || null,
    assignedAdminName:
      typeof raw.assignedAdminName === 'string'
        ? raw.assignedAdminName.trim().slice(0, 100)
        : '',
  };
};

/**
 * useChatSocket
 *
 * Handles both authenticated buyers and guests.
 * Seller dashboard (`eazseller` useSellerChatSocket) mirrors this hook: same phases, REST, and
 * socket events; only `chatAs`, API origin, and `x-platform` header differ. Admin Live Chat is a
 * separate surface (eazadmin) with optional filters for buyers/guests vs sellers.
 *
 * @param {boolean}      enabled     – connect when true
 * @param {object|null}  guestCreds  – { guestName, guestEmail, guestToken } for guests; null for auth users
 */
export const useChatSocket = (enabled, guestCreds = null) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [convStatus, setConvStatus] = useState('open');
  const [supportMeta, setSupportMeta] = useState(null);
  const [adminTyping, setAdminTyping] = useState(false);
  /** Why the thread shows as closed (socket `conversation_closed.reason`); null if open or unknown. */
  const [closeReason, setCloseReason] = useState(null);
  const [socketError, setSocketError] = useState(null);
  /** Logged-in buyer only: socket handshake rejected (e.g. session expired). Guests use guest token. */
  const [authError, setAuthError] = useState(false);

  const applySupportPayload = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return;
    setSupportMeta(normalizeSupportMeta(payload));
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const socketUrl = getChatSocketOrigin();

    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    const token = getCookie('main_jwt') || getCookie('user_jwt');

    const authPayload = guestCreds
      ? {
          chatAs: 'buyer',
          guestName: guestCreds.guestName,
          guestEmail: guestCreds.guestEmail || '',
          guestToken: guestCreds.guestToken,
        }
      : { chatAs: 'buyer', token };

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: authPayload,
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setSocketError(null);
      setAuthError(false);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      setConnected(false);
      if (!guestCreds && err?.message === 'Authentication required') {
        setAuthError(true);
      }
      if (import.meta.env.DEV) {
        const code =
          err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
        // eslint-disable-next-line no-console
        console.warn(
          '[Chat] Socket connect_error:',
          err?.message || err,
          code ? `(engine code: ${code})` : ''
        );
        const isLocalPage =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1');
        if (
          isLocalPage &&
          socketUrl.includes('api.saiisai.com') &&
          (err?.message === 'server error' || err?.message === 'xhr poll error')
        ) {
          // eslint-disable-next-line no-console
          console.info(
            '[Chat] Hint: handshake failed against production API. Log in on the buyer site ' +
              'while using this API (so main_jwt is set for api.saiisai.com), complete the guest ' +
              'chat form, or point the app at http://localhost:4000 for local backend.'
          );
        }
        if (isLocalPage && String(code).toLowerCase().includes('parser')) {
          // eslint-disable-next-line no-console
          console.info(
            '[Chat] Hint: engine "parser error" means the poll response was not Socket.io data ' +
              '(often HTML from Vite). Use http://localhost:4000 for the API — not port 5173. ' +
              'Check VITE_API_BASE_URL / VITE_SOCKET_URL.'
          );
        }
      }
    });

    socket.on('chat:conversation_joined', (payload) => {
      if (payload?.conversationId != null) setConversationId(payload.conversationId);
      if (payload?.status) setConvStatus(payload.status);
      if (payload?.status === 'open') setCloseReason(null);
      applySupportPayload(payload);
    });

    socket.on('chat:support_request_ack', (payload) => {
      setSocketError(null);
      applySupportPayload(payload);
    });

    socket.on('chat:support_accepted', ({ conversation }) => {
      if (conversation) applySupportPayload(conversation);
    });

    socket.on('chat:message', ({ message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('chat:conversation_closed', (payload) => {
      setConvStatus('closed');
      setCloseReason(payload?.reason || 'support');
    });
    socket.on('chat:conversation_reopened', () => {
      setConvStatus('open');
      setCloseReason(null);
    });

    socket.on('chat:conversation_reset', ({ conversation } = {}) => {
      setMessages([]);
      setConvStatus('open');
      setCloseReason(null);
      if (conversation?.conversationId != null) {
        setConversationId(conversation.conversationId);
      }
      if (conversation) applySupportPayload(conversation);
    });

    socket.on('chat:typing', ({ role, typing }) => {
      if (role === 'admin') setAdminTyping(typing);
    });

    socket.on('chat:error', ({ message: msg }) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('[Chat]', msg);
      }
      if (msg) setSocketError(String(msg));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, guestCreds, applySupportPayload]);

  const loadHistory = useCallback(async () => {
    try {
      const base = getChatSocketOrigin();
      let url;
      let options;

      if (guestCreds?.guestToken) {
        url = `${base}/api/v1/chat/guest/messages?token=${encodeURIComponent(guestCreds.guestToken)}`;
        options = {};
      } else {
        url = `${base}/api/v1/chat/messages`;
        options = { credentials: 'include' };
      }

      const res = await fetch(url, options);
      if (!res.ok) return;
      const json = await res.json();
      const d = json.data;
      if (d?.messages) setMessages(d.messages);
      if (d?.conversationId != null) setConversationId(d.conversationId);
      if (d?.status) {
        setConvStatus(d.status);
        if (d.status === 'open') setCloseReason(null);
      }
      if (d?.conversation) applySupportPayload(d.conversation);
    } catch {
      // silently ignore
    }
  }, [guestCreds?.guestToken, applySupportPayload]);

  const sendMessage = useCallback((content) => {
    if (!socketRef.current?.connected || !content?.trim()) return;
    socketRef.current.emit('chat:send', { content: content.trim() });
  }, []);

  const submitSupportRequest = useCallback((note) => {
    if (!socketRef.current?.connected) {
      setSocketError('Not connected yet. Wait a moment and try again.');
      return;
    }
    setSocketError(null);
    const n = note != null ? String(note).trim().slice(0, 500) : '';
    socketRef.current.emit('chat:submit_support_request', { note: n });
  }, []);

  const clearSocketError = useCallback(() => setSocketError(null), []);

  const emitTyping = useCallback((isTyping) => {
    socketRef.current?.emit('chat:typing', { typing: isTyping });
  }, []);

  const endConversation = useCallback(() => {
    socketRef.current?.emit('chat:participant_end_conversation');
  }, []);

  const resetConversation = useCallback(() => {
    socketRef.current?.emit('chat:participant_reset_conversation');
  }, []);

  const meta = supportMeta || defaultSupportMeta();
  const effectivePhase = meta.chatPhase || 'active';
  const hasAssignedAgent = Boolean(meta.assignedTo);
  const needsSupportRequest =
    effectivePhase === 'faq_bot' ||
    effectivePhase === 'await_human_choice' ||
    (effectivePhase === 'awaiting_admin' && !meta.supportRequestedAt) ||
    (effectivePhase === 'active' &&
      !hasAssignedAgent &&
      !meta.supportRequestedAt);
  const waitingForAdminAcceptance =
    effectivePhase === 'awaiting_admin' && !!meta.supportRequestedAt;

  return {
    connected,
    authError,
    messages,
    conversationId,
    convStatus,
    closeReason,
    socketError,
    clearSocketError,
    supportMeta: meta,
    effectiveChatPhase: effectivePhase,
    needsSupportRequest,
    waitingForAdminAcceptance,
    adminTyping,
    sendMessage,
    submitSupportRequest,
    emitTyping,
    loadHistory,
    endConversation,
    resetConversation,
  };
};
