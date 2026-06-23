import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './components/AuthContext';
import VehicleSearch from './components/VehicleSearch';
import Login from './components/Login';
import Register from './components/Register'; 
import ProtectedRoute from './components/ProtectedRoute';
import AdminCars from './components/AdminCars';
import UserListings from './components/UserListings';
import CarDetails from './components/CarDetails';
import AdminStatistics from './components/AdminStatistics';
import AdminUserControl from './components/AdminUserControl'; 

function App() {
  const { user, logout, isAdmin } = useContext(AuthContext);

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold fs-4" to="/">
            <span style={{ color: 'var(--mobile-orange)' }}>PIN</span> auto kuća
          </Link>

          {user && !isAdmin() && (
            <Link to="/moje-objave" className="btn btn-outline-warning btn-sm me-2">
              <i className="fas fa-warehouse me-1"></i> Moje Objave
            </Link>
          )}
          
          <div className="d-flex align-items-center">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-light text-sm d-none d-md-inline">
                  <i className="fas fa-user-circle me-1"></i> {user.username} 
                  {isAdmin() && <span className="badge bg-danger ms-2">Admin</span>}
                </span>
                
                {isAdmin() && (
                  <Link to="/admin/dashboard" className="btn btn-outline-light btn-sm">
                    Administracija
                  </Link>
                )}

                {isAdmin() && (
                  <Link to="/admin/statistika" className="btn btn-outline-light btn-sm">
                    Statistika
                  </Link>
                )}

                {isAdmin() && (
                  <Link to="/admin/korisnici" className="btn btn-outline-light btn-sm">
                    Korisnici
                  </Link>
                )}

                <button onClick={logout} className="btn btn-sm btn-outline-danger">
                  <i className="fas fa-sign-out-alt"></i> Odjava
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-mobile btn-sm px-3">
                  <i className="fas fa-sign-in-alt me-1"></i> Prijava
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-sm px-3">
                  <i className="fas fa-user-plus me-1"></i> Registracija
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<VehicleSearch />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route 
          path="/moje-objave" 
          element={
            <ProtectedRoute>
              <UserListings />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCars />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/statistika" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminStatistics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vozilo/:registracija" 
          element={<CarDetails />} 
        />
        <Route 
          path="/admin/korisnici" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUserControl />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;