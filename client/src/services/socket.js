import { io } from 'socket.io-client';
import { auth } from '../firebase/firebase';

let socket;

export async function getSocket() {
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  if (!token) throw new Error('Please log in to use chat.');
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    socket = io(apiUrl.replace(/\/api\/v1$/, ''), { auth: { token } });
  }
  return socket;
}

export function disconnectSocket() { socket?.disconnect(); socket = undefined; }
