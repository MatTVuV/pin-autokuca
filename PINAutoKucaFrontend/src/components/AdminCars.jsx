import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminCars = () => {
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]); 
  const [formData, setFormData] = useState({
    registracija: '', marka: '', model: '', 
    godinaProizvodnje: new Date().getFullYear(),
    motor: 0, snagaKW: '', mjenjac: 0, prijedeniKilometri: '', cijena: '',
    datumIstekaRegistracije: '', datumDolaska: new Date().toISOString().split('T')[0],
    status: 0 
  });
  const [isEditing, setIsEditing] = useState(false);

  // Slike odabrane prilikom kreiranja novog vozila
  const [newCarImages, setNewCarImages] = useState([]);

  // Modal / Sekcije stanja za naknadne Transakcije i Slike
  const [selectedCar, setSelectedCar] = useState(null);
  const [transactionType, setTransactionType] = useState('sell'); 
  const [transactionData, setTransactionData] = useState({ userId: '', datum: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    loadCars();
    loadUsers();
  }, []);

  const loadCars = async () => {
    try {
      const res = await API.get('/Car');
      setCars(res.data);
    } catch (err) {
      alert("Greška pri učitavanju automobila.");
    }
  };

  const loadUsers = async () => {
    try {
      const res = await API.get('/User');
      setUsers(res.data || []);
    } catch (err) {
      console.warn("Ruta /User nije dostupna ili nema korisnika u bazi.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'number' || name === 'motor' || name === 'mjenjac' || name === 'status') {
      finalValue = value === '' ? '' : Number(value);
    }
    setFormData({ ...formData, [name]: finalValue });
  };

  // Obrada odabira slika pri kreiranju novog auta
  const handleNewCarImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Maksimalno možete odabrati 10 slika.");
      e.target.value = null;
      setNewCarImages([]);
      return;
    }
    setNewCarImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      godinaProizvodnje: Number(formData.godinaProizvodnje),
      motor: Number(formData.motor),
      mjenjac: Number(formData.mjenjac),
      snagaKW: Number(formData.snagaKW),
      prijedeniKilometri: Number(formData.prijedeniKilometri),
      cijena: Number(formData.cijena),
      status: Number(formData.status),
      datumIstekaRegistracije: new Date(formData.datumIstekaRegistracije).toISOString(),
      datumDolaska: new Date(formData.datumDolaska).toISOString()
    };

    try {
      if (isEditing) {
        await API.put(`/Car/${payload.registracija}`, payload);
        alert("Automobil uspješno ažuriran!");
      } else {
        // 1. Kreiranje automobila
        await API.post('/Car', payload);

        // 2. Ako postoje odabrane slike, odmah ih prenesi na novi auto
        if (newCarImages.length > 0) {
          const formDataImages = new FormData();
          newCarImages.forEach(file => formDataImages.append('files', file));
          
          await API.post(`/Car/${payload.registracija}/upload-images`, formDataImages, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        alert("Automobil uspješno kreiran zajedno sa slikama!");
      }
      resetForm();
      loadCars();
    } catch (err) {
      console.error("Validacijska greška:", err.response?.data?.errors);
      alert(err.response?.data || "Došlo je do pogreške. Provjerite pravila baze.");
    }
  };

  const handleEdit = (car) => {
    setIsEditing(true);
    setFormData({
      registracija: car.registracija,
      marka: car.marka,
      model: car.model,
      godinaProizvodnje: car.godinaProizvodnje,
      motor: car.motor,
      snagaKW: car.snagaKW,
      mjenjac: car.mjenjac,
      prijedeniKilometri: car.prijedeniKilometri,
      cijena: car.cijena,
      status: car.status,
      datumIstekaRegistracije: car.datumIstekaRegistracije?.split('T')[0] || '',
      datumDolaska: car.datumDolaska?.split('T')[0] || ''
    });
  };

  const handleDelete = async (reg) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati vozilo s registracijom ${reg}?`)) {
      try {
        await API.delete(`/Car/${reg}`);
        alert("Vozilo obrisano.");
        loadCars();
      } catch (err) {
        alert(err.response?.data || "Brisanje nije moguće.");
      }
    }
  };

  const handleProcessTransaction = async (e) => {
    e.preventDefault();
    if (!transactionData.userId) return alert("Molimo odaberite korisnika.");

    const noviStatus = transactionType === 'sell' ? 1 : 2; 

    try {
      await API.post('/Transaction', {
        registracija: selectedCar.registracija,
        userId: transactionData.userId,
        tip: transactionType === 'sell' ? 0 : 1, 
        datumTransakcije: new Date(transactionData.datum).toISOString(),
        iznos: selectedCar.cijena
      });

      await API.put(`/Car/${selectedCar.registracija}`, {
        ...selectedCar,
        status: noviStatus
      });

      alert(`Vozilo proknjiženo kao: ${transactionType === 'sell' ? 'PRODANO' : 'POSUĐENO'}`);
      setSelectedCar(null);
      loadCars();
    } catch (err) {
      alert(err.response?.data || "Greška prilikom izvršavanja transakcije.");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const trenutniBrojSlika = selectedCar.galerijaFotografija?.length || 0;

    if (trenutniBrojSlika + files.length > 10) {
      alert(`Maksimalan broj slika po vozilu je 10. Trenutno imate: ${trenutniBrojSlika}`);
      return;
    }

    const formDataImages = new FormData();
    files.forEach(file => formDataImages.append('files', file));

    try {
      await API.post(`/Car/${selectedCar.registracija}/upload-images`, formDataImages, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Slike uspješno dodane!");
      
      const osvjezeniAutomobili = await API.get('/Car');
      setCars(osvjezeniAutomobili.data);
      setSelectedCar(osvjezeniAutomobili.data.find(c => c.registracija === selectedCar.registracija));
    } catch (err) {
      alert("Greška pri uploadu slika.");
    }
  };

  const handleImageDelete = async (imageId) => {
    if (window.confirm("Želite li obrisati ovu sliku?")) {
      try {
        await API.delete(`/Car/images/${imageId}`);
        const osvjezeniAutomobili = await API.get('/Car');
        setCars(osvjezeniAutomobili.data);
        setSelectedCar(osvjezeniAutomobili.data.find(c => c.registracija === selectedCar.registracija));
      } catch (err) {
        alert("Greška pri brisanju slike.");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setNewCarImages([]);
    setFormData({
      registracija: '', marka: '', model: '', godinaProizvodnje: new Date().getFullYear(),
      motor: 0, snagaKW: '', mjenjac: 0, prijedeniKilometri: '', cijena: '',
      datumIstekaRegistracije: '', datumDolaska: new Date().toISOString().split('T')[0], status: 0
    });
  };

  const isStatusLocked = (status) => status === 1 || status === 2;

  return (
    <div className="container mt-4 mb-5">
      <div className="row">
        {/* LIJEVA STRANA: FORMULAR */}
        <div className="col-md-4 mb-4">
          <div className="card p-3 shadow-sm bg-white border-0">
            <h5 className="fw-bold mb-3">{isEditing ? "📝 Uredi Automobil" : "🚗 Dodaj Novi Automobil"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label text-sm fw-semibold">Registracija</label>
                <input type="text" name="registracija" className="form-control form-control-sm text-uppercase" value={formData.registracija} onChange={handleInputChange} disabled={isEditing} required />
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Marka</label>
                  <input type="text" name="marka" className="form-control form-control-sm" value={formData.marka} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Model</label>
                  <input type="text" name="model" className="form-control form-control-sm" value={formData.model} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Godina</label>
                  <input type="number" name="godinaProizvodnje" className="form-control form-control-sm" value={formData.godinaProizvodnje} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Motor</label>
                  <select name="motor" className="form-select form-select-sm" value={formData.motor} onChange={handleInputChange}>
                    <option value={0}>Diesel</option>
                    <option value={1}>Benzin</option>
                    <option value={2}>Hibrid</option>
                    <option value={3}>Električni</option>
                  </select>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Snaga (kW)</label>
                  <input type="number" name="snagaKW" className="form-control form-control-sm" value={formData.snagaKW} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Mjenjač</label>
                  <select name="mjenjac" className="form-select form-select-sm" value={formData.mjenjac} onChange={handleInputChange}>
                    <option value={0}>Mehanički</option>
                    <option value={1}>Automatski</option>
                  </select>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Kilometri</label>
                  <input type="number" name="prijedeniKilometri" className="form-control form-control-sm" value={formData.prijedeniKilometri} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Cijena (€)</label>
                  <input type="number" name="cijena" className="form-control form-control-sm" value={formData.cijena} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Istek registracije</label>
                  <input type="date" name="datumIstekaRegistracije" className="form-control form-control-sm" value={formData.datumIstekaRegistracije} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="form-label text-sm fw-semibold">Status vozila</label>
                  <select name="status" className="form-select form-select-sm" value={formData.status} onChange={handleInputChange}>
                    <option value={0}>Raspoloživ</option>
                    <option value={3}>Rezerviran (Dopušta izmjene)</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD SLIKA PRILIKOM KREIRANJA (Vidljivo samo kod novog unosa) */}
              {!isEditing && (
                <div className="mb-2 mt-3 p-2 bg-light rounded border border-dashed">
                  <label className="form-label text-sm fw-bold mb-1"><i className="fas fa-images me-1 text-warning"></i> Dodaj slike vozila (Max 10)</label>
                  <input type="file" className="form-control form-control-sm" accept="image/*" multiple onChange={handleNewCarImagesChange} />
                  {newCarImages.length > 0 && <p className="text-success text-xs mt-1 mb-0">Odabrano slika: {newCarImages.length}</p>}
                </div>
              )}
              
              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-warning btn-sm fw-bold flex-grow-1 text-white">{isEditing ? "Spremi izmjene" : "Kreiraj oglas"}</button>
                {isEditing && <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Odustani</button>}
              </div>
            </form>
          </div>
        </div>

        {/* DESNA STRANA: TABLICA */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm bg-white border-0 table-responsive">
            <h5 className="fw-bold mb-3">📋 Popis Vozila i Logistika</h5>
            <table className="table table-sm table-hover align-middle mt-2">
              <thead className="table-light">
                <tr>
                  <th>Registracija</th>
                  <th>Vozilo</th>
                  <th>Cijena</th>
                  <th>Status</th>
                  <th className="text-end">Upravljanje i Akcije</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => {
                  const locked = isStatusLocked(car.status);
                  return (
                    <tr key={car.registracija}>
                      <td><span className="badge bg-dark font-monospace px-2 py-1">{car.registracija}</span></td>
                      <td><strong>{car.marka}</strong> {car.model} <span className="text-muted small">({car.godinaProizvodnje}.)</span></td>
                      <td className="fw-semibold">{car.cijena.toLocaleString()} €</td>
                      <td>
                        <span className={`badge ${car.status === 0 ? 'bg-success' : car.status === 1 ? 'bg-danger' : car.status === 2 ? 'bg-info' : 'bg-warning text-dark'}`}>
                          {car.status === 0 ? 'Raspoloživ' : car.status === 1 ? 'Prodan' : car.status === 2 ? 'Posuđen' : 'Rezerviran'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary me-1 px-2" onClick={() => { setSelectedCar(car); setTransactionType('images'); }} title="Galerija slika">
                          <i className="fas fa-images"></i> <span className="small">({car.galerijaFotografija?.length || 0})</span>
                        </button>
                        
                        {!locked && (
                          <button className="btn btn-sm btn-outline-dark me-1 px-2" onClick={() => { setSelectedCar(car); setTransactionType('sell'); }} title="Procesuiraj prodaju/posudbu">
                            <i className="fas fa-cash-register"></i>
                          </button>
                        )}

                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(car)} disabled={locked} title={locked ? "Zaključano" : "Uredi"}>
                          <i className="fas fa-edit"></i>
                        </button>
                        
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(car.registracija)} disabled={locked} title={locked ? "Zaključano" : "Ukloni"}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL ZA TRANSAKCIJE I UPRAVLJANJE SLIKAMA --- */}
      {selectedCar && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white py-2">
                <h6 className="modal-title fw-bold">Vozilo: {selectedCar.marka} {selectedCar.model} ({selectedCar.registracija})</h6>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setSelectedCar(null)}></button>
              </div>
              <div className="modal-body p-4">
                
                {transactionType === 'images' && (
                  <div>
                    <h5 className="fw-bold mb-3"><i className="fas fa-camera text-warning me-2"></i>Galerija slika</h5>
                    <div className="mb-3 p-3 bg-light rounded">
                      <label className="form-label small fw-bold">Dodaj fotografije:</label>
                      <input type="file" className="form-control form-control-sm" accept="image/*" multiple onChange={handleImageUpload} disabled={(selectedCar.galerijaFotografija?.length || 0) >= 10} />
                      <p className="text-muted small mt-1 mb-0">Slike: {selectedCar.galerijaFotografija?.length || 0} / 10.</p>
                    </div>

                    <div className="row g-2">
                      {selectedCar.galerijaFotografija && selectedCar.galerijaFotografija.map((img, i) => (
                        <div key={i} className="col-6 col-sm-4 col-md-3 position-relative">
                          <div className="card h-100 border">
                            <img src={img.putanjaSlike || "https://via.placeholder.com/150"} alt="Automobil" className="card-img-top object-fit-cover" style={{ height: '100px' }} />
                            <div className="card-body p-1 text-center bg-light">
                              <button type="button" className="btn btn-xs btn-danger w-100 py-0" onClick={() => handleImageDelete(img.id)}>
                                <i className="fas fa-trash-alt me-1"></i>Obriši
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {transactionType !== 'images' && (
                  <form onSubmit={handleProcessTransaction}>
                    <h5 className="fw-bold mb-3"><i className="fas fa-file-invoice-dollar text-success me-2"></i>Evidentiranje Transakcije</h5>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Tip poslovne akcije</label>
                        <select className="form-select form-select-sm" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                          <option value="sell">Prodaja vozila</option>
                          <option value="rent">Posudba (Najam)</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Kupac / Korisnik</label>
                        <select className="form-select form-select-sm" value={transactionData.userId} onChange={(e) => setTransactionData({...transactionData, userId: e.target.value})} required>
                          <option value="">-- Odaberi korisnika --</option>
                          {users.map(u => {
                            const uId = u.id ?? u.Id;
                            const uIme = u.ime ?? u.Ime ?? '';
                            const uPrezime = u.prezime ?? u.Prezime ?? '';
                            const uOib = u.oib ?? u.OIB ?? '';
                            const uEmail = u.email ?? u.Email ?? u.userName ?? u.UserName ?? 'Korisnik';
                            
                            // Fleksibilni prikaz teksta: ako ima ime i prezime, prikaži ih, inače koristi email/username baze
                            const labelaPrikaza = (uIme || uPrezime) ? `${uIme} ${uPrezime} (${uOib})` : uEmail;

                            return (
                              <option key={uId} value={uId}>{labelaPrikaza}</option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Datum realizacije</label>
                        <input type="date" className="form-control form-control-sm" value={transactionData.datum} onChange={(e) => setTransactionData({...transactionData, datum: e.target.value})} required />
                      </div>
                    </div>
                    <div className="text-end mt-4">
                      <button type="button" className="btn btn-secondary btn-sm me-2" onClick={() => setSelectedCar(null)}>Odustani</button>
                      <button type="submit" className="btn btn-success btn-sm px-4 fw-bold">Završi i Proknjiži</button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;