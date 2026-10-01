import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import TermsPanel from '../components/TermsPanel';

export default function Chat() {
  const { user } = useAuth(); const [profile, setProfile] = useState(null); const [conversations, setConversations] = useState([]); const [active, setActive] = useState(null); const [messages, setMessages] = useState([]); const [draft, setDraft] = useState(''); const [typing, setTyping] = useState(false); const [error, setError] = useState(''); const activeRef = useRef(null);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { Promise.all([api.get('/conversations'), api.get('/auth/me')]).then(([conversationsResponse, profileResponse]) => { const loaded = conversationsResponse.data.data.conversations; setConversations(loaded); setProfile(profileResponse.data.data.user); if (loaded[0]) setActive(loaded[0]); }).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load conversations.')); }, []);
  useEffect(() => {
    if (!active) return undefined; let cancelled = false; let connectedSocket;
    async function connect() {
      try {
        const { data } = await api.get(`/conversations/${active._id}/messages`); if (cancelled) return; setMessages(data.data.messages);
        connectedSocket = await getSocket(); connectedSocket.emit('join_conversation', { conversationId: active._id });
        connectedSocket.on('message_created', (message) => { if (String(message.conversation) === String(activeRef.current?._id)) setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]); });
        connectedSocket.on('typing_changed', ({ userId, isTyping }) => { if (String(userId) !== String(profile?.id)) setTyping(isTyping); });
      } catch (requestError) { if (!cancelled) setError(requestError.response?.data?.message || requestError.message || 'Unable to open this conversation.'); }
    }
    connect(); return () => { cancelled = true; connectedSocket?.off('message_created'); connectedSocket?.off('typing_changed'); };
  }, [active?._id, profile?.id]);
  function send(event) { event.preventDefault(); const content = draft.trim(); if (!content || !active) return; getSocket().then((connectedSocket) => connectedSocket.emit('send_message', { conversationId: active._id, content }, (result) => { if (!result.ok) setError(result.message); })).catch((requestError) => setError(requestError.message)); setDraft(''); }
  function changeDraft(value) { setDraft(value); if (active) getSocket().then((connectedSocket) => connectedSocket.emit('typing', { conversationId: active._id, isTyping: Boolean(value.trim()) })).catch(() => {}); }
  return <section className="h-[calc(100vh-9rem)] min-h-[500px]"><h1 className="text-3xl font-bold">Messages</h1>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-6 grid h-[calc(100%-4rem)] overflow-hidden rounded-xl bg-white shadow-sm md:grid-cols-[260px_1fr]"><aside className="border-b border-slate-200 md:border-b-0 md:border-r">{conversations.map((conversation) => <button key={conversation._id} onClick={() => setActive(conversation)} className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-50 ${active?._id === conversation._id ? 'bg-indigo-50' : ''}`}><p className="font-semibold">{conversation.task?.title || 'Task conversation'}</p><p className="mt-1 truncate text-sm text-slate-500">{conversation.lastMessagePreview || 'No messages yet'}</p></button>)}{!conversations.length && <p className="p-4 text-sm text-slate-500">Accepted applications will appear here.</p>}</aside><div className="flex min-h-0 flex-col">{active ? <><header className="border-b border-slate-200 p-4"><p className="font-semibold">{active.task?.title}</p><p className="text-sm text-slate-500">Private conversation</p></header><TermsPanel applicationId={active.application} userId={profile?.id} /><div className="flex-1 space-y-3 overflow-y-auto p-4">{messages.map((message) => { const mine = String(message.sender?._id || message.sender) === String(profile?.id); return <div key={message._id} className={mine ? 'text-right' : ''}><span className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>{message.content}</span></div>; })}{typing && <p className="text-sm text-slate-500">The other person is typing…</p>}</div><form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4"><input value={draft} onChange={(event) => changeDraft(event.target.value)} placeholder="Write a message" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2" /><button className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">Send</button></form></> : <div className="grid flex-1 place-items-center text-slate-500">Select a conversation.</div>}</div></div></section>;
}
