import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks/mine')
      .then(({ data }) => setTasks(data.data.tasks))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Unable to load your tasks.'));
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My tasks</h1>
        <Link className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white" to="/tasks/new">
          Post a task
        </Link>
      </div>

      {error ? (
        <p className="mt-6 text-red-700">{error}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
          {tasks.length ? tasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between border-b border-slate-100 p-4 last:border-0">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{task.category}</p>
              </div>
              <div className="flex items-center gap-3"><Link className="text-sm font-semibold text-indigo-600" to={`/dashboard/tasks/${task._id}/applications`}>Applicants</Link>{['in_progress', 'completed'].includes(task.status) && <Link className="text-sm font-semibold text-indigo-600" to={`/dashboard/tasks/${task._id}/progress`}>Progress</Link>}<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{task.status.replaceAll('_', ' ')}</span></div>
            </div>
          )) : <p className="p-6 text-slate-600">You have not posted any tasks yet.</p>}
        </div>
      )}
    </>
  );
}
