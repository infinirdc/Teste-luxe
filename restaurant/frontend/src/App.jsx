import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';

// Layout
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import InventoryManagement from './pages/InventoryManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-dark text-white">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          <main className="pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              } />
              
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin>
                  <OrderManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/inventory" element={
                <ProtectedRoute requireAdmin>
                  <InventoryManagement />
                </ProtectedRoute>
              } />
              
              {/* 404 Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#fff',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
  );
}

export default App;