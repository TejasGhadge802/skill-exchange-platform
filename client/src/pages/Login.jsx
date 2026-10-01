import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthNotice from './AuthNotice';
import { useAuth } from '../context/AuthContext';
import AuthCard from '../components/AuthCard';
export default function Login() {
  const location = useLocation(); const navigate = useNavigate(); const { login, loginWithGoogle, firebaseConfigured } = useAuth(); const [submitting, setSubmitting] = useState(false);
  async function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); setSubmitting(true); try { await login({ email: form.get('email'), password: form.get('password') }); toast.success('Welcome back!'); navigate('/dashboard'); } catch (error) { toast.error(error.message); } finally { setSubmitting(false); } }
  async function google() { setSubmitting(true); try { await loginWithGoogle(); toast.success('Welcome back!'); navigate('/dashboard'); } catch (error) { toast.error(error.message); } finally { setSubmitting(false); } }
  return <AuthCard title="Welcome back" subtitle="Log in to manage your work and services.">{(location.state?.configurationRequired || !firebaseConfigured) && <AuthNotice />}<form onSubmit={submit} className="mt-6 space-y-4"><input required name="email" type="email" placeholder="Email address" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><input required name="password" type="password" minLength="6" placeholder="Password" className="w-full rounded-lg border border-slate-300 px-3 py-2" /><button disabled={submitting || !firebaseConfigured} className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{submitting ? 'Logging in…' : 'Log in'}</button></form><button onClick={google} disabled={submitting || !firebaseConfigured} className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Continue with Google</button><p className="mt-5 text-sm">New here? <Link className="text-indigo-600" to="/register">Create an account</Link></p><Link className="mt-3 inline-block text-sm text-indigo-600" to="/forgot-password">Forgot password?</Link></AuthCard>;
}
