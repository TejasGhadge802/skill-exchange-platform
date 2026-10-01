import { Link, NavLink } from 'react-router-dom';
import { Handshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) => `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-950'}`;
export default function Navbar() {
  const { user, logout } = useAuth();
  return <header className="border-b border-slate-200 bg-white"><nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
    <Link to="/" className="flex items-center gap-2 font-bold text-slate-950"><Handshake className="text-indigo-600" /> Skill Exchange</Link>
    <div className="flex items-center gap-5"><NavLink className={linkClass} to="/tasks">Tasks</NavLink><NavLink className={linkClass} to="/classes">Classes</NavLink>
      {user ? <><NavLink className={linkClass} to="/dashboard">Dashboard</NavLink><button onClick={logout} className="text-sm font-medium text-slate-600">Log out</button></> : <><NavLink className={linkClass} to="/login">Log in</NavLink><Link className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" to="/register">Get started</Link></>}
    </div>
  </nav></header>;
}
