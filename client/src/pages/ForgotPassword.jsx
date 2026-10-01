import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthNotice from './AuthNotice';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
export default function ForgotPassword() { const { resetPassword, firebaseConfigured } = useAuth(); const [submitting, setSubmitting] = useState(false); async function submit(event) { event.preventDefault(); setSubmitting(true); try { await resetPassword(new FormData(event.currentTarget).get('email')); toast.success('Password reset email sent.'); } catch (error) { toast.error(error.message); } finally { setSubmitting(false); } } return <AuthCard title="Reset password" subtitle="We’ll send a secure reset link to your email.">{!firebaseConfigured && <AuthNotice />}<form onSubmit={submit} className="mt-6 space-y-4"><input required name="email" type="email" placeholder="Email address" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><button disabled={submitting || !firebaseConfigured} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{submitting ? 'Sending…' : 'Send reset link'}</button></form><Link className="mt-6 inline-block text-indigo-600" to="/login">Back to log in</Link></AuthCard>; }
