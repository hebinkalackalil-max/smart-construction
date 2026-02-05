import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminSites from './pages/admin/Sites';
import Users from './pages/admin/Users';
import AdminEquipment from './pages/admin/Equipment';
import AdminReports from './pages/admin/Reports';

// Supervisor pages
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorSites from './pages/supervisor/Sites';
import SupervisorAttendance from './pages/supervisor/Attendance';
import SupervisorTasks from './pages/supervisor/Tasks';
import SupervisorEquipment from './pages/supervisor/Equipment';

// Worker pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerAttendance from './pages/worker/Attendance';
import WorkerTasks from './pages/worker/Tasks';
import WorkerPayments from './pages/worker/Payments';
import WorkerPayslip from './pages/worker/Payslip';

// Accountant pages
import AccountantDashboard from './pages/accountant/Dashboard';
import Calculate from './pages/accountant/Calculate';
import AccountantPayments from './pages/accountant/Payments';
import AccountantReports from './pages/accountant/Reports';
import Payslip from './pages/accountant/Payslip';

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
        <Route
          path="/admin/sites"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminSites />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/equipment"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminEquipment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout>
                <AdminReports />
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
        <Route
          path="/supervisor/sites"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <SupervisorSites />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/attendance"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <SupervisorAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/tasks"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <SupervisorTasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/equipment"
          element={
            <ProtectedRoute allowedRoles={['supervisor']}>
              <Layout>
                <SupervisorEquipment />
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
        <Route
          path="/worker/attendance"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout>
                <WorkerAttendance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/tasks"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout>
                <WorkerTasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/payments"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout>
                <WorkerPayments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/payslip/:id"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <Layout>
                <WorkerPayslip />
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
        <Route
          path="/accountant/calculate"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <Layout>
                <Calculate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/payments"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <Layout>
                <AccountantPayments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/reports"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <Layout>
                <AccountantReports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/payslip/:id"
          element={
            <ProtectedRoute allowedRoles={['accountant']}>
              <Layout>
                <Payslip />
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
