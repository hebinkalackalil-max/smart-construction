import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Placeholder dashboard components (will be created in next phases)
const AdminDashboard = () => <div style={{ padding: '2rem' }}><h1>Admin Dashboard</h1></div>;
const SupervisorDashboard = () => <div style={{ padding: '2rem' }}><h1>Supervisor Dashboard</h1></div>;
const WorkerDashboard = () => <div style={{ padding: '2rem' }}><h1>Worker Dashboard</h1></div>;
const AccountantDashboard = () => <div style={{ padding: '2rem' }}><h1>Accountant Dashboard</h1></div>;

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        {user && <Sidebar user={user} />}
        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes - Admin */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Supervisor */}
        <Route
          path="/supervisor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <SupervisorDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Worker */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout>
                <WorkerDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Accountant */}
        <Route
          path="/accountant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <Layout>
                <AccountantDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
