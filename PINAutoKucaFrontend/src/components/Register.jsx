import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await API.post('/auth/register', {
        username,
        email,
        password,
        role: "User" 
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000); 
    } catch (err) {
      setError(err.response?.data?.[0]?.description || "Registracija nije uspjela. Pokušajte ponovno.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-sm p-4" style={{ width: '100%', maxWidth: '420px', border: 'none' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold"><span style={{ color: 'var(--mobile-orange)' }}>PIN</span> Registracija</h3>
          <p className="text-muted">Kreirajte račun za više mogućnosti</p>
        </div>

        {error && <div className="alert alert-danger p-2 fs-6">{error}</div>}
        {success && <div className="alert alert-success p-2 fs-6">Uspješna registracija</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Korisničko ime</label>
            <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">E-mail adresa</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Lozinka</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-mobile w-100 py-2 fs-5">Registriraj se</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none" style={{ color: 'var(--mobile-dark)' }}>Već imate račun? Prijavite se</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;