import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from './AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await API.post('/auth/login', { username, password });
      const { token, roles } = response.data;
      
      login(token, roles, username);
      
      if (roles.includes('Admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Pogrešno korisničko ime ili lozinka.');
      } else {
        setError('Došlo je do pogreške na poslužitelju. Pokušajte ponovno.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '420px', border: 'none' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: 'var(--mobile-dark)' }}>
            <span style={{ color: 'var(--mobile-orange)' }}>PIN</span> auto kuća
          </h3>
          <p className="text-muted text-sm">Prijavite se u sustav za evidenciju</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center p-2 mb-3" role="alert" style={{ fontSize: '14px' }}>
            <i className="fas fa-exclamation-circle me-2"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Korisničko ime</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="fas fa-user text-muted"></i></span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0" 
                placeholder="Unesite korisničko ime"
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Lozinka</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><i className="fas fa-lock text-muted"></i></span>
              <input 
                type="password" 
                className="form-control border-start-0 ps-0" 
                placeholder="Unesite lozinku"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-mobile w-100 py-2 fs-5" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Prijava...
              </>
            ) : (
              'Prijavi se'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;