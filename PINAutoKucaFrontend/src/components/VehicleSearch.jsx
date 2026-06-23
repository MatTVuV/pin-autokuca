import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const mjenjacLabele = {
  0: 'Ručni',
  1: 'Automatski'
};

const motorLabele = {
  0: 'Diesel',
  1: 'Benzin',
  2: 'Hibrid',
  3: 'Električni'
};

const VehicleSearch = () => {
  const [cars, setCars] = useState([]);
  const [viewType, setViewType] = useState('grid'); 
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [cijenaOd, setCijenaOd] = useState('');
  const [cijenaDo, setCijenaDo] = useState('');
  const [godinaOd, setGodinaOd] = useState('');
  const [godinaDo, setGodinaDo] = useState('');
  const [maxKilometraza, setMaxKilometraza] = useState('');
  const [motor, setMotor] = useState('');
  const [mjenjac, setMjenjac] = useState('');
  const [statusVozila, setStatusVozila] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await API.get('/Car');
      setCars(response.data);
    } catch (error) {
      console.error("Greška pri dohvaćanju vozila:", error);
    }
  };

  // Za određivanje boje kartice/tablice na temelju datuma isteka registracije
  const getRegistrationStyle = (datumIstekaStr) => {
    const datumIsteka = new Date(datumIstekaStr);
    const danas = new Date();
    const u3Mjeseca = new Date();
    u3Mjeseca.setMonth(u3Mjeseca.getMonth() + 3);

    if (datumIsteka < danas) {
      return { borderLeft: "5px solid #f1172c", backgroundColor: "#f8d7da" }; //Istekla registracija
    } else if (datumIsteka <= u3Mjeseca) {
      return { borderLeft: "5px solid #f56e00", backgroundColor: "#fff3cd" }; //Ističe unutar 3 mjeseca
    }
    return {};
  };

  const filteredCars = cars.filter(car => {
    const matchesMarka = marka === '' || (car.marka && car.marka.toLowerCase().includes(marka.toLowerCase()));
    const matchesModel = model === '' || (car.model && car.model.toLowerCase().includes(model.toLowerCase()));
    const matchesCijenaOd = cijenaOd === '' || car.cijena >= parseFloat(cijenaOd);
    const matchesCijenaDo = cijenaDo === '' || car.cijena <= parseFloat(cijenaDo);
    const matchesGodinaOd = godinaOd === '' || car.godinaProizvodnje >= parseInt(godinaOd);
    const matchesGodinaDo = godinaDo === '' || car.godinaProizvodnje <= parseInt(godinaDo);
    const matchesKM = maxKilometraza === '' || car.prijedeniKilometri <= parseInt(maxKilometraza);
    
    const matchesMotor = motor === '' || String(car.motor) === String(motor);
    const matchesMjenjac = mjenjac === '' || String(car.mjenjac) === String(mjenjac);
    const matchesStatus = statusVozila === '' || String(car.status) === String(statusVozila);

    return matchesMarka && matchesModel && matchesCijenaOd && matchesCijenaDo && 
           matchesGodinaOd && matchesGodinaDo && matchesKM && matchesMotor && 
           matchesMjenjac && matchesStatus;
  });
  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4 bg-dark text-white border-0 shadow">
        <h5 className="mb-3 text-warning"><i className="fas fa-filter me-2"></i> Detaljno pretraživanje</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label small">Marka</label>
            <input type="text" className="form-control form-control-sm" placeholder="Npr. Audi" value={marka} onChange={e => setMarka(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Model</label>
            <input type="text" className="form-control form-control-sm" placeholder="Npr. A4" value={model} onChange={e => setModel(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Cijena od (€)</label>
            <input type="number" className="form-control form-control-sm" value={cijenaOd} onChange={e => setCijenaOd(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Cijena do (€)</label>
            <input type="number" className="form-control form-control-sm" value={cijenaDo} onChange={e => setCijenaDo(e.target.value)} />
          </div>

          <div className="col-md-2">
            <label className="form-label small">Godina od</label>
            <input type="number" className="form-control form-control-sm" value={godinaOd} onChange={e => setGodinaOd(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Godina do</label>
            <input type="number" className="form-control form-control-sm" value={godinaDo} onChange={e => setGodinaDo(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Maks. kilometraža (km)</label>
            <input type="number" className="form-control form-control-sm" value={maxKilometraza} onChange={e => setMaxKilometraza(e.target.value)} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Motor</label>
            <select className="form-select form-select-sm" value={motor} onChange={e => setMotor(e.target.value)}>
              <option value="">Sve</option>
              <option value="0">Diesel</option>
              <option value="1">Benzin</option>
              <option value="2">Hibrid</option>
              <option value="3">Električni</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small">Mjenjač</label>
            <select className="form-select form-select-sm" value={mjenjac} onChange={e => setMjenjac(e.target.value)}>
              <option value="">Sve</option>
              <option value="0">Ručni</option>
              <option value="1">Automatski</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rezultati i prebacivanje prikaza */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>Pronađeno rezultata: <span className="fw-bold text-primary">{filteredCars.length}</span></div>
        <div className="btn-group shadow-sm">
          <button className={`btn btn-sm btn-outline-dark ${viewType === 'grid' ? 'active' : ''}`} onClick={() => setViewType('grid')}>
            <i className="fas fa-th-large me-1"></i> Kartice
          </button>
          <button className={`btn btn-sm btn-outline-dark ${viewType === 'table' ? 'active' : ''}`} onClick={() => setViewType('table')}>
            <i className="fas fa-table me-1"></i> Tablica
          </button>
        </div>
      </div>

      {/* Prikaz kartica */}
      {viewType === 'grid' ? (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {filteredCars.map(car => (
            <div className="col" key={car.registracija}>
              <div className="card h-100 car-card shadow-sm border-0" onClick={() => navigate(`/vozilo/${car.registracija}`)} style={getRegistrationStyle(car.datumIstekaRegistracije)}>
                <div className="bg-secondary text-white text-center py-5 rounded-top">
                  {car.galerijaFotografija && car.galerijaFotografija.length > 0 ? (
                    car.galerijaFotografija.map((img, index) => (
                      <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={img.id}>
                        <img src={img.putanjaSlike} className="d-block w-100 img-fluid rounded" alt="Automobil" style={{ maxHeight: '450px', objectFit: 'contain' }} />
                      </div>
                    ))
                  ) : (
                    <div className="carousel-item active py-5 text-white">
                      <i className="fas fa-camera fa-4x mb-3 text-muted"></i>
                      <p>Nema dostupnih fotografija za ovo vozilo</p>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title fw-bold mb-0">{car.marka} {car.model}</h5>
                    <span className="text-danger fw-bold fs-5">{car.cijena.toLocaleString()} €</span>
                  </div>
                  
                  <div className="row text-muted small g-2 my-2">
                    <div className="col-6"><i className="fas fa-calendar-alt me-1"></i> {car.godinaProizvodnje}. god.</div>
                    <div className="col-6"><i className="fas fa-tachometer-alt me-1"></i> {car.prijedeniKilometri.toLocaleString()} km</div>
                    <div className="col-6"><i className="fas fa-cog me-1"></i> {mjenjacLabele[car.mjenjac] || car.mjenjac}</div>
                    <div className="col-6"><i className="fas fa-bolt me-1"></i> {car.snagaKW} kW</div>
                    <div className="col-6"><i className="fas fa-gas-pump me-1"></i> {motorLabele[car.motor] || car.motor}</div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <span className="text-xs text-secondary">
                      Reg. do: <strong>{new Date(car.datumIstekaRegistracije).toLocaleDateString('hr-HR')}</strong>
                    </span>
                    <span className={`badge ${car.status === 0 ? 'bg-success' : car.status === 1 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {car.status === 0 ? 'Raspoloživ' : car.status === 1 ? 'Prodan' : 'Posuđen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Prikaz tablice */
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Vozilo</th>
                <th>Godina</th>
                <th>Kilometraža</th>
                <th>Mjenjač</th>
                <th>Cijena</th>
                <th>Registracija</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map(car => (
                <tr key={car.registracija} onClick={() => navigate(`/vozilo/${car.registracija}`)} style={getRegistrationStyle(car.datumIstekaRegistracije)}>
                  <td><strong>{car.marka}</strong> {car.model}</td>
                  <td>{car.godinaProizvodnje}.</td>
                  <td>{car.prijedeniKilometri.toLocaleString()} km</td>
                  <td>{mjenjacLabele[car.mjenjac] || car.mjenjac}</td>
                  <td className="fw-bold text-danger">{car.cijena.toLocaleString()} €</td>
                  <td>{new Date(car.datumIstekaRegistracije).toLocaleDateString('hr-HR')}</td>
                  <td>
                    <span className={`badge ${car.status === 0 ? 'bg-success' : car.status === 1 ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {car.status === 0 ? 'Raspoloživ' : car.status === 1 ? 'Prodan' : 'Posuđen'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;