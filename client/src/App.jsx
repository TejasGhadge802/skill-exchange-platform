import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Classes from './pages/Classes';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import CreateTask from './pages/CreateTask';
import MyTasks from './pages/MyTasks';
import TaskDetail from './pages/TaskDetail';
import MyApplications from './pages/MyApplications';
import TaskApplications from './pages/TaskApplications';
import Chat from './pages/Chat';
import TaskProgress from './pages/TaskProgress';
import CreateClass from './pages/CreateClass';
import ClassDetail from './pages/ClassDetail';
import MyClasses from './pages/MyClasses';
import Notifications from './pages/Notifications';
import AdminModeration from './pages/AdminModeration';

export default function App() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/tasks/:taskId" element={<TaskDetail />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/:classId" element={<ClassDetail />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks/new" element={<CreateTask />} />
        <Route path="/dashboard/tasks" element={<MyTasks />} />
        <Route path="/dashboard/applications" element={<MyApplications />} />
        <Route path="/dashboard/tasks/:taskId/applications" element={<TaskApplications />} />
        <Route path="/dashboard/messages" element={<Chat />} />
        <Route path="/dashboard/tasks/:taskId/progress" element={<TaskProgress />} />
        <Route path="/classes/new" element={<CreateClass />} />
        <Route path="/dashboard/classes" element={<MyClasses />} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
        <Route path="/admin/moderation" element={<AdminModeration />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
