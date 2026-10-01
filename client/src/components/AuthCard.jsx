export default function AuthCard({ title, subtitle, children }) {
  return <section className="mx-auto max-w-md px-4 py-16"><div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><h1 className="text-3xl font-bold text-slate-950">{title}</h1><p className="mt-2 text-slate-600">{subtitle}</p>{children}</div></section>;
}
