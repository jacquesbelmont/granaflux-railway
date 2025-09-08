import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { apiService } from './services/api';
import { User } from './types/api';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import CashierDashboard from './components/dashboard/CashierDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await apiService.getProfile();
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        apiService.removeToken();
        setIsLoggedIn(false);
        setUser(null);
      }
    }
    setIsLoadingUser(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    apiService.removeToken();
    setUser(null);
    setIsLoggedIn(false);
  };

  // Renderizar dashboard baseado no role do usuário
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'OWNER':
      case 'ADMIN':
        return <DashboardPage isLoggedIn={isLoggedIn} />;
      case 'CASHIER':
        return <CashierDashboard user={user} onLogout={handleLogout} />;
      case 'USER':
        return <EmployeeDashboard user={user} onLogout={handleLogout} />;
      default:
        return <DashboardPage isLoggedIn={isLoggedIn} />;
    }
  };

  if (isLoadingUser) {
    return <LoadingSpinner message="Verificando autenticação..." size="lg" />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={handleLogin} />} />
          <Route path="/dashboard" element={renderDashboard()} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;