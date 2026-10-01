import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthNotice from './AuthNotice';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
export default function Register() {
  const navigate = useNavigate(); const { register, firebaseConfigured } = useAuth(); const [submitting, setSubmitting] = useState(false);
  async function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); const password = form.get('password'); if (password !== form.get('confirmPassword')) return toast.error('Passwords do not match.'); setSubmitting(true); try { await register({ name: form.get('name'), email: form.get('email'), password }); toast.success('Your account is ready.'); navigate('/dashboard'); } catch (error) { toast.error(error.message); } finally { setSubmitting(false); } }
  return <AuthCard title="Create your account" subtitle="Join to request services, offer skills, and manage your work.">{!firebaseConfigured && <AuthNotice />}<form onSubmit={submit} className="mt-6 space-y-4"><input required name="name" minLength="2" placeholder="Your name" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input required name="email" type="email" placeholder="Email address" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input required name="password" type="password" minLength="6" placeholder="Password (at least 6 characters)" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input required name="confirmPassword" type="password" minLength="6" placeholder="Confirm password" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><button disabled={submitting || !firebaseConfigured} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{submitting ? 'Creating account…' : 'Create account'}</button></form><p className="mt-5 text-sm">Already registered? <Link className="text-indigo-600" to="/login">Log in</Link></p></AuthCard>;
}
