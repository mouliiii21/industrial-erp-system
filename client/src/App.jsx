import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Enquiries from './pages/Enquiries';
import Quotations from './pages/Quotations';
import SalesOrders from './pages/SalesOrders';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Inventory from './pages/Inventory';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/enquiries"
        element={
          <ProtectedRoute>
            <Layout>
              <Enquiries />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <Layout>
              <Quotations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-orders"
        element={
          <ProtectedRoute>
            <Layout>
              <SalesOrders />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
  path="/inventory"
  element={
    <ProtectedRoute>
      <Layout>
        <Inventory />
      </Layout>
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/enquiries" replace />} />
    </Routes>
  );
}
