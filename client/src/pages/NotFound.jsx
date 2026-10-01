import { Link } from 'react-router-dom';
export default function NotFound() { return <main className="grid min-h-screen place-items-center p-4 text-center"><div><p className="text-6xl font-bold text-indigo-600">404</p><h1 className="mt-3 text-2xl font-bold">Page not found</h1><Link className="mt-6 inline-block text-indigo-600" to="/">Return home</Link></div></main>; }
