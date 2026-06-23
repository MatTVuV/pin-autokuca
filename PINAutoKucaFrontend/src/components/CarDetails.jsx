import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from './AuthContext';

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

const CarDetails = () => {
  const { registracija } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await API.get(`/Car/${registracija}`);
        setCar(response.data);
      } catch (error) {
        console.error("Greška pri učitavanju detalja:", error);
        alert("Automobil nije pronađen u bazi PIN auto kuće.");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (registracija) {
      fetchCarDetails();
    }
  }, [registracija, navigate]);

  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-warning" role="status"></div></div>;
  if (!car) return null;

  return (
    <div className="container mt-4">
      {/* Gumb za povratak */}
      <button className="btn btn-sm btn-outline-dark mb-3" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left me-2"></i>Natrag na pretragu
      </button>

      {/* NASLOV I GLAVNI PODACI */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 className="fw-bold mb-1">{car.marka} {car.model}</h1>
          <p className="text-muted fs-5">
            {car.godinaProizvodnje}. god. &middot; {car.prijedeniKilometri.toLocaleString()} km &middot; {motorLabele[car.motor] || car.motor} &middot; {mjenjacLabele[car.mjenjac] || car.mjenjac}
          </p>
        </div>
        <div className="text-end">
          <h1 className="fw-bold text-danger mb-0">{car.cijena.toLocaleString()} €</h1>
          <span className="text-muted small">PDV uključen u cijenu</span>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          {/* Vrtuljak za slike */}
          <div id="carImageCarousel" className="carousel slide bg-dark rounded shadow-sm mb-4" data-bs-ride="carousel">
            <div className="carousel-inner text-center">
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
            {car.galerijaFotografija?.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target="#carImageCarousel" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carImageCarousel" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
              </>
            )}
          </div>

          {/* Tablica tehničkih podataka */}
          <div className="card p-4 border-0 shadow-sm mb-4">
            <h4 className="fw-bold mb-3 border-bottom pb-2">Tehnički podaci</h4>
            <div className="row g-3">
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Kategorija</span>
                <span className="fw-semibold">Rabljeno vozilo</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Registracijska oznaka</span>
                <span className="fw-bold text-uppercase">{car.registracija}</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Godina proizvodnje</span>
                <span className="fw-semibold">{car.godinaProizvodnje}.</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Kilometraža</span>
                <span className="fw-semibold">{car.prijedeniKilometri.toLocaleString()} km</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Vrsta motora</span>
                <span className="fw-semibold">{motorLabele[car.motor] || car.motor}</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Snaga motora</span>
                <span className="fw-semibold">{car.snagaKW} kW ({Math.round(car.snagaKW * 1.34)} KS)</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Mjenjač</span>
                <span className="fw-semibold">{mjenjacLabele[car.mjenjac] || car.mjenjac}</span>
              </div>
              <div className="col-md-6 border-bottom pb-2 d-flex justify-content-between">
                <span className="text-muted">Registriran do</span>
                <span className="fw-semibold">{new Date(car.datumIstekaRegistracije).toLocaleDateString('hr-HR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bočna traka s kontaktom i statusom */}
        <div className="col-lg-4">
          <div className="card p-4 border-0 shadow-sm mb-3 bg-white text-center">
            <h5 className="text-muted mb-2">Status vozila</h5>
            <span className={`fs-5 fw-bold badge p-3 w-100 ${car.status === 0 ? 'bg-success' : car.status === 1 ? 'bg-danger' : 'bg-warning text-dark'}`}>
              {car.status === 0 ? 'RASPOLOŽIVO' : car.status === 1 ? 'PRODANO' : 'POSUĐENO'}
            </span>
          </div>

          <div className="card p-4 border-0 shadow-sm bg-dark text-white mb-3">
            <h5 className="fw-bold mb-3 text-warning"><i className="fas fa-store me-2"></i>Prodavač</h5>
            <h4 className="fw-bold mb-1">PIN auto kuća</h4>
            <p className="text-muted small mb-3">Profesionalna prodaja i najam vozila</p>
            
            <div className="d-flex align-items-center mb-2">
              <i className="fas fa-phone-alt text-warning me-3 fs-5"></i>
              <div>
                <span className="text-muted d-block small">Telefon za upite</span>
                <a href="tel:+3851234567" className="text-white text-decoration-none fw-bold">+385 1 234 567</a>
              </div>
            </div>

            <div className="d-flex align-items-center mb-3">
              <i className="fas fa-map-marker-alt text-warning me-3 fs-5"></i>
              <div>
                <span className="text-muted d-block small">Lokacija salona</span>
                <span className="fw-semibold">Slavonska avenija 14, Zagreb</span>
              </div>
            </div>

            <hr className="bg-secondary" />

            {user ? (
              <button 
                className="btn btn-mobile w-100 py-2" 
                disabled={car.status !== 0}
                onClick={() => alert("Zahtjev poslan timu PIN auto kuće!")}
              >
                <i className="fas fa-paper-plane me-2"></i>Pošalji upit za kupnju/najam
              </button>
            ) : (
              <div className="alert alert-warning text-center p-2 mb-0 small" role="alert">
                <i className="fas fa-info-circle me-1"></i> Prijavite se kako biste poslali izravan upit prodavaču.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails;