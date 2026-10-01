import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function AdminNavLink() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setIsAdmin(data.data.user.role === 'admin')).catch(() => setIsAdmin(false));
  }, []);
  return isAdmin ? <Link className="block rounded px-3 py-2 font-semibold text-indigo-600 hover:bg-indigo-50" to="/admin/moderation">Admin moderation</Link> : null;
}
