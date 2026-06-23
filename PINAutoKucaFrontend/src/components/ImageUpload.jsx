import React, { useState } from 'react';
import API from '../api';

const ImageUpload = ({ registracija, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return alert("Odaberite barem jednu sliku!");

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }

    setUploading(true);
    try {
      await API.post(`/Car/${registracija}/upload-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Slike uspješno prenesene na AWS S3!");
      setSelectedFiles([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Greška pri uploadu:", error);
      alert(error.response?.data || "Greška prilikom uploada slika.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card p-3 border-0 shadow-sm mt-3">
      <h5 className="fw-bold mb-3"><i className="fas fa-images text-warning me-2"></i>Dodaj slike u galeriju (AWS S3)</h5>
      <form onSubmit={handleUpload}>
        <div className="mb-3">
          <input 
            type="file" 
            className="form-control" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <div className="form-text">Možete odabrati više slika odjednom.</div>
        </div>
        <button 
          type="submit" 
          className="btn btn-warning w-100 fw-bold text-dark" 
          disabled={uploading || selectedFiles.length === 0}
        >
          {uploading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Slanje na AWS S3...
            </>
          ) : (
            <><i className="fas fa-cloud-upload-alt me-2"></i>Učitaj slike</>
          )}
        </button>
      </form>
    </div>
  );
};

export default ImageUpload;