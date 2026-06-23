import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from './AuthContext';

const UserListings = () => {
  const { user } = useContext(AuthContext);
  const [myCars, setMyCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    registracija: '', marka: '', model: '', godinaProizvodnje: new Date().getFullYear(),
    motor: 0, snagaKW: '', mjenjac: 0, prijedeniKilometri: '', cijena: '',
    datumIstekaRegistracije: '', datumDolaska: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    try {
      const res = await API.get('/Car');
      const filtered = res.data.filter(car => car.userId === user.username);
      setMyCars(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const payload = {
    registracija: formData.registracija,
    marka: formData.marka,
    model: formData.model,
    godinaProizvodnje: parseInt(formData.godinaProizvodnje, 10),
    motor: parseInt(formData.motor, 10), 
    snagaKW: parseInt(formData.snagaKW, 10),
    mjenjac: parseInt(formData.mjenjac, 10), 
    prijedeniKilometri: parseInt(formData.prijedeniKilometri, 10),
    cijena: parseFloat(formData.cijena),
    datumIstekaRegistracije: new Date(formData.datumIstekaRegistracije).toISOString(),
    datumDolaska: new Date(formData.datumDolaska).toISOString()
  };

  try {
    await API.post('/Car', payload); 
    alert("Automobil uspješno objavljen!");
    setShowForm(false);
    loadMyListings();
  } catch (err) {
    console.error(err.response?.data); 
    alert("Greška pri spremanju. Provjerite konzolu za detalje.");
  }
};

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Moje Objave</h2>
        <button className="btn btn-mobile" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Zatvori formu" : "Dodaj novo vozilo"}
        </button>
      </div>

      {showForm && (
        <div className="card p-4 mb-4 border-0 shadow-sm">
          <h5>Unos novog oglasa automobila</h5>
          <form onSubmit={handleSubmit} className="row g-3 mt-1">
            <div className="col-md-3"><label className="form-label">Registracija</label><input type="text" className="form-control" onChange={e => setFormData({...formData, registracija: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Marka</label><input type="text" className="form-control" onChange={e => setFormData({...formData, marka: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Model</label><input type="text" className="form-control" onChange={e => setFormData({...formData, model: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Cijena (€)</label><input type="number" className="form-control" onChange={e => setFormData({...formData, cijena: e.target.value})} required /></div>
            <div className="col-md-3">
            <label className="form-label text-sm">Motor</label>
              <select 
                name="motor" 
                className="form-control form-select-sm" 
                value={formData.motor} 
                onChange={e => setFormData({...formData, motor: e.target.value})} 
                required
              >
                <option value={0}>Benzin</option>
                <option value={1}>Diesel</option>
                <option value={2}>Hibrid</option>
                <option value={3}>Električni</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-sm">Mjenjač</label>
              <select name="mjenjac" className="form-control form-select-sm" value={formData.mjenjac} onChange={e => setFormData({...formData, mjenjac: e.target.value})} required>
                <option value={0}>Mehanicki</option>
                <option value={1}>Automatski</option>
              </select>
            </div>
            <div className="col-md-3"><label className="form-label">Godina proizvodnje</label><input type="number" className="form-control" onChange={e => setFormData({...formData, godinaProizvodnje: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Kilometri</label><input type="number" className="form-control" onChange={e => setFormData({...formData, prijedeniKilometri: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Snaga (kW)</label><input type="number" className="form-control" onChange={e => setFormData({...formData, snagaKW: e.target.value})} required /></div>
            <div className="col-md-3"><label className="form-label">Istek registracije</label><input type="date" className="form-control" onChange={e => setFormData({...formData, datumIstekaRegistracije: e.target.value})} required /></div>
            <div className="col-12"><button type="submit" className="btn btn-success px-4">Objavi oglas</button></div>
          </form>
        </div>
      )}

      <div className="card p-3 border-0 shadow-sm">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Registracija</th>
              <th>Vozilo</th>
              <th>Cijena</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myCars.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-3">Nema objavljenih vozila.</td></tr>
            ) : (
              myCars.map(car => (
                <tr key={car.registracija}>
                  <td><code>{car.registracija}</code></td>
                  <td><strong>{car.marka}</strong> {car.model}</td>
                  <td>{car.cijena.toLocaleString()} €</td>
                  <td>
                    <span className={`badge ${car.status === 0 ? 'bg-success' : 'bg-danger'}`}>
                      {car.status === 0 ? 'Aktivno / Raspoloživo' : 'Prodan / Nedostupan'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListings;