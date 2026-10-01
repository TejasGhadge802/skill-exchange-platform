import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/applications/mine');
      setApplications(data.data.applications);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load applications.');
    }
  }

  useEffect(() => { load(); }, []);

  async function withdraw(id) {
    try {
      await api.patch(`/applications/${id}/withdraw`);
      toast.success('Application withdrawn.');
      load();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to withdraw application.');
    }
  }

  return (
    <section>
      <h1 className="text-3xl font-bold">My applications</h1>
      <p className="mt-2 text-slate-600">Track proposals you have sent to requesters.</p>
      {error ? (
        <p className="mt-6 text-red-700">{error}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          {applications.length ? applications.map((application) => (
            <div key={application._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 last:border-0">
              <div>
                <Link className="font-semibold hover:text-indigo-600" to={`/tasks/${application.task?._id}`}>
                  {application.task?.title || 'Deleted task'}
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {application.task?.category} · {application.status.replaceAll('_', ' ')}
                </p>
              </div>
              {['pending', 'shortlisted'].includes(application.status) && (
                <button onClick={() => withdraw(application._id)} className="text-sm font-semibold text-red-600">Withdraw</button>
              )}
              {application.status === 'accepted' && <Link className="text-sm font-semibold text-indigo-600" to={`/dashboard/tasks/${application.task?._id}/progress`}>Task progress</Link>}
            </div>
          )) : <p className="p-6 text-slate-600">You have not applied to a task yet.</p>}
        </div>
      )}
    </section>
  );
}
