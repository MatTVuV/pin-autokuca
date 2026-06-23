import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminStatistics = () => {
  const [counters, setCounters] = useState({ dostupni: 0, prodani: 0, posudeni: 0 });
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [topBrands, setTopBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const naziviMjeseci = [
    "", "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
    "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
  ];

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        // Paralelno dohvaćanje svih podataka s Dashboard kontrolera
        const [resCounters, resSales, resBrands] = await Promise.all([
          API.get('/dashboard/counters'),
          API.get('/dashboard/sales-by-month'),
          API.get('/dashboard/top-brands')
        ]);

        // Osiguranje ispravnog mapiranja neovisno o PascalCase/camelCase formatu s API-ja
        setCounters({
          dostupni: resCounters.data.dostupni ?? resCounters.data.Dostupni ?? 0,
          prodani: resCounters.data.prodani ?? resCounters.data.Prodani ?? 0,
          posudeni: resCounters.data.posudeni ?? resCounters.data.Posudeni ?? 0
        });

        setSalesByMonth(resSales.data || []);
        setTopBrands(resBrands.data || []);
      } catch (error) {
        console.error("Greška pri dohvaćanju statistike:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Učitavanje analitike...</p>
      </div>
    );
  }

  // Izračun maksimalne prodaje za skaliranje vizualnog grafa po mjesecima
  const maksProdajaUMjesecu = salesByMonth.length > 0 
    ? Math.max(...salesByMonth.map(m => m.brojProdanih ?? m.BrojProdanih ?? 0)) 
    : 1;

  // Izračun maksimalne prodaje po marki za skaliranje
  const maksProdajaPoMarki = topBrands.length > 0 
    ? Math.max(...topBrands.map(b => b.kolicina ?? b.Kolicina ?? 0)) 
    : 1;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--mobile-dark)' }}>
          <i className="fas fa-chart-pie text-warning me-2"></i>
          Nadzorna ploča & Analitika
        </h2>
      </div>

      {/* 1. SEKCIJA: BROJAČI (Dostupni, prodani, posuđeni) */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-muted text-uppercase fw-semibold mb-1 small">Dostupna vozila</h6>
                <h2 className="fw-bold mb-0 text-success">{counters.dostupni}</h2>
              </div>
              <div className="bg-success-subtle text-success rounded-circle p-3 fs-3">
                <i className="fas fa-car-side"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-muted text-uppercase fw-semibold mb-1 small">Prodana vozila</h6>
                <h2 className="fw-bold mb-0 text-danger">{counters.prodani}</h2>
              </div>
              <div className="bg-danger-subtle text-danger rounded-circle p-3 fs-3">
                <i className="fas fa-handshake"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white h-100">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <h6 className="text-muted text-uppercase fw-semibold mb-1 small">Posuđena vozila</h6>
                <h2 className="fw-bold mb-0 text-info">{counters.posudeni}</h2>
              </div>
              <div className="bg-info-subtle text-info rounded-circle p-3 fs-3">
                <i className="fas fa-key"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. SEKCIJA: STATISTIKA PRODAJE PO MJESECIMA */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm bg-white p-4 h-100">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--mobile-dark)' }}>
              <i className="fas fa-calendar-check me-2 text-secondary"></i>
              Statistika prodaje po mjesecima
            </h5>
            <div className="mt-3">
              {salesByMonth.length === 0 ? (
                <p className="text-muted small my-4 text-center">Nema evidentiranih prodaja za tekuću godinu.</p>
              ) : (
                salesByMonth.map((item, index) => {
                  const mj = item.mjesec ?? item.Mjesec;
                  const kom = item.brojProdanih ?? item.BrojProdanih ?? 0;
                  const postotak = (kom / maksProdajaUMjesecu) * 100;

                  return (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold small">{naziviMjeseci[mj]}</span>
                        <span className="badge bg-dark rounded-pill">{kom} kom</span>
                      </div>
                      <div className="progress rounded-flat" style={{ height: '14px' }}>
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ width: `${postotak}%`, backgroundColor: 'var(--mobile-orange)' }} 
                          aria-valuenow={kom} 
                          aria-valuemin="0" 
                          aria-valuemax={maksProdajaUMjesecu}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 3. SEKCIJA: NAJPRODAVANIJE MARKE */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm bg-white p-4 h-100">
            <h5 className="fw-bold mb-3" style={{ color: 'var(--mobile-dark)' }}>
              <i className="fas fa-fire me-2 text-danger"></i>
              Najprodavanije marke (Top 5)
            </h5>
            <div className="mt-3">
              {topBrands.length === 0 ? (
                <p className="text-muted small my-4 text-center">Nema dovoljno podataka za prikaz najprodavanijih marki.</p>
              ) : (
                topBrands.map((brand, index) => {
                  const imeMarke = brand.marka ?? brand.Marka;
                  const kolicina = brand.kolicina ?? brand.Kolicina ?? 0;
                  const postotakMarke = (kolicina / maksProdajaPoMarki) * 100;

                  return (
                    <div key={index} className="mb-3 d-flex align-items-center gap-3">
                      {/* Redni broj */}
                      <div className="fw-bold fs-5 text-muted" style={{ width: '20px' }}>{index + 1}.</div>
                      
                      {/* Naziv i grafikon */}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="fw-bold text-uppercase">{imeMarke}</span>
                          <span className="text-muted fw-semibold">{kolicina} prodano</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-secondary" 
                            role="progressbar" 
                            style={{ width: `${postotakMarke}%` }}
                            aria-valuenow={kolicina}
                            aria-valuemin="0"
                            aria-valuemax={maksProdajaPoMarki}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;