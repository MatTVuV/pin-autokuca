import React, { useState, useEffect } from 'react';
import API from '../api';

export const AdminUserControl = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: 0,
    imePrezime: '',
    oib: '',
    email: '',
    telefon: '',
    adresa: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stanje za modal s poviješću transakcija klijenta
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/User');
      setUsers(res.data);
    } catch (err) {
      alert("Greška pri učitavanju korisnika.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Osiguravamo ispravnu duljinu OIB-a
    if (formData.oib.length !== 11) {
      alert("OIB mora sadržavati točno 11 znamenki.");
      return;
    }

    try {
      if (isEditing) {
        await API.put(`/User/${formData.id}`, formData);
        alert("Podaci o korisniku uspješno ažurirani!");
      } else {
        await API.post('/User', formData);
        alert("Korisnik uspješno dodan u bazu!");
      }
      resetForm();
      loadUsers();
    } catch (err) {
      alert(err.response?.data || "Došlo je do greške na serveru. Provjerite jedinstvenost OIB-a.");
    }
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      imePrezime: user.imePrezime,
      oib: user.oib || user.OIB || '',
      email: user.email,
      telefon: user.telefon,
      adresa: user.adresa
    });
  };

  const handleDelete = async (id, imePrezime) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati korisnika ${imePrezime}?`)) {
      try {
        await API.delete(`/User/${id}`);
        alert("Korisnik uklonjen iz baze.");
        loadUsers();
      } catch (err) {
        alert(err.response?.data || "Brisanje nije moguće. Korisnik vjerojatno ima vezane transakcije.");
      }
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setFormData({ id: 0, imePrezime: '', oib: '', email: '', telefon: '', adresa: '' });
  };

  if (loading) return <div className="container mt-5 text-center"><div className="spinner-border text-warning" role="status"></div></div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--mobile-dark)' }}>
          <i className="fas fa-users-cog text-warning me-2"></i> Upravljanje Korisnicima i Klijentima
        </h2>
      </div>

      <div className="row">
        {/* LIJEVA STRANA: FORMA ZA DODAVANJE / UREĐIVANJE */}
        <div className="col-md-4 mb-4">
          <div className="card p-3 shadow-sm bg-white border-0">
            <h5 className="fw-bold mb-3">{isEditing ? "📝 Uredi podatke" : "👤 Registriraj novog klijenta"}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label text-sm fw-semibold">Ime i Prezime</label>
                <input type="text" name="imePrezime" className="form-control form-control-sm" value={formData.imePrezime} onChange={handleInputChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label text-sm fw-semibold">OIB</label>
                <input type="text" name="oib" className="form-control form-control-sm" value={formData.oib} onChange={handleInputChange} maxLength={11} required />
              </div>
              <div className="mb-2">
                <label className="form-label text-sm fw-semibold">E-mail adresa</label>
                <input type="email" name="email" className="form-control form-control-sm" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label text-sm fw-semibold">Telefon</label>
                <input type="text" name="telefon" className="form-control form-control-sm" value={formData.telefon} onChange={handleInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label text-sm fw-semibold">Adresa stanovanja</label>
                <input type="text" name="adresa" className="form-control form-control-sm" value={formData.adresa} onChange={handleInputChange} required />
              </div>
              
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-mobile btn-sm flex-grow-1">{isEditing ? "Spremi promjene" : "Kreiraj klijenta"}</button>
                {isEditing && <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>Odustani</button>}
              </div>
            </form>
          </div>
        </div>

        {/* DESNA STRANA: POPIS KORISNIKA */}
        <div className="col-md-8">
          <div className="card p-3 shadow-sm bg-white border-0 table-responsive">
            <h5 className="fw-bold mb-3">👥 Baza klijenata auto kuće</h5>
            <table className="table table-sm table-hover align-middle mt-2">
              <thead className="table-light">
                <tr>
                  <th>Ime i Prezime</th>
                  <th>OIB</th>
                  <th>E-mail</th>
                  <th>Telefon</th>
                  <th className="text-end">Opcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.imePrezime}</strong></td>
                    <td><code>{u.oib}</code></td>
                    <td>{u.email}</td>
                    <td>{u.telefon}</td>
                    <td className="text-end">
                      {/* Gumb za povijest transakcija */}
                      <button className="btn btn-sm btn-outline-dark me-1 px-2" onClick={() => setSelectedUser(u)} title="Pregled povijesti kupnje/najma">
                        <i className="fas fa-history me-1"></i> Povijest
                      </button>
                      {/* Uređivanje */}
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(u)}>
                        <i className="fas fa-user-edit"></i>
                      </button>
                      {/* Brisanje */}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.id, u.imePrezime)}>
                        <i className="fas fa-user-times"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL ZA PRIKAZ POVIJESTI POSUDBI I KUPNJI --- */}
      {selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-dark text-white py-2">
                <h6 className="modal-title fw-bold"><i className="fas fa-folder-open text-warning me-2"></i>Dosje klijenta: {selectedUser.imePrezime}</h6>
                <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3 bg-light p-3 rounded small">
                  <div className="row">
                    <div className="col-sm-6"><strong>Adresa:</strong> {selectedUser.adresa}</div>
                    <div className="col-sm-6"><strong>OIB:</strong> {selectedUser.oib}</div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 border-bottom pb-2">📦 Povijest kupnji i posudbi automobila</h6>
                
                {!selectedUser.povijestTransakcija || selectedUser.povijestTransakcija.length === 0 ? (
                  <p className="text-muted text-center py-3 small">Ovaj korisnik još nema zabilježenih kupnji ili posudbi vozila.</p>
                ) : (
                  <table className="table table-sm table-striped align-middle small">
                    <thead>
                      <tr>
                        <th>Registracija</th>
                        <th>Vozilo</th>
                        <th>Tip transakcije</th>
                        <th>Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.povijestTransakcija.map((t, idx) => (
                        <tr key={idx}>
                          <td><span className="badge bg-secondary font-monospace">{t.carRegistracija || t.CarRegistracija}</span></td>
                          <td>{t.carInfo || "Podaci o vozilu"}</td>
                          <td>
                            <span className={`badge ${t.tip === 0 ? 'bg-danger' : 'bg-info'}`}>
                              {t.tip === 0 ? 'KUPNJA (PRODANO)' : 'POSUDBA (NAJAM)'}
                            </span>
                          </td>
                          <td>{new Date(t.datumTransakcije).toLocaleDateString('hr-HR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="text-end mt-3">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(null)}>Zatvori</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserControl;