import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './Navbar.css'; // Import explicit component CSS if needed, though they import individually
import './Footer.css';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');
  const [ultraMode, setUltraMode] = useState(false);
  const [losslessMode, setLosslessMode] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleUltraMode = () => {
    const newUltraMode = !ultraMode;
    setUltraMode(newUltraMode);
    if (newUltraMode) {
      setLosslessMode(false); // Disable lossless if ultra is permitted
      setQuality(2); // Set to 2% for ultra compression
    } else {
      setQuality(80); // Reset to default
    }
  };

  const toggleLosslessMode = () => {
    const newLosslessMode = !losslessMode;
    setLosslessMode(newLosslessMode);
    if (newLosslessMode) {
      setUltraMode(false); // Disable ultra if lossless is permitted
      setQuality(100); // Visual indicator mostly
    } else {
      setQuality(80);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setOriginalSize(e.target.files[0].size);
      setCompressedImage(null);
      setCompressedSize(0);
      setError('');
    }
  };

  const handleQualityChange = (e) => {
    if (!ultraMode) { // Only allow manual changes when not in ultra mode
      setQuality(e.target.value);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('quality', quality);
    formData.append('lossless', losslessMode);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/compress`, formData, {
        responseType: 'blob',
      });

      const compressedBlob = response.data;
      setCompressedSize(compressedBlob.size);
      const url = URL.createObjectURL(compressedBlob);
      setCompressedImage(url);
    } catch (err) {
      console.error(err);
      setError('Failed to compress image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app-wrapper">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <div className="container">
          <div className="header-section">
            <h1>Optimize Your Images</h1>
            <p className="subtitle">Reduce file size without losing quality. Simple, fast, and secure.</p>
          </div>

          <div className="card">
            <div className="upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="fileInput"
                className="file-input"
              />
              <label htmlFor="fileInput" className="file-label">
                <svg xmlns="http://www.w3.org/2000/svg" className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {file ? file.name : 'Choose an Image'}
              </label>
            </div>

            {file && (
              <div className="controls">
                <div className="quality-control">
                  <div className="quality-header">
                    <label>Compression Quality</label>
                    <span className="quality-value">{quality}%</span>
                  </div>
                  {ultraMode && (
                    <>
                      <div className="ultra-mode-badge">
                        ⚡ Ultra Compress Mode Active
                      </div>
                      <p className="ultra-warning">
                        Caution: This mode maximizes compression, which may result in noticeable loss of detail. Recommended only when file size reduction is the priority.
                      </p>
                    </>
                  )}
                  {losslessMode && (
                    <div className="lossless-mode-badge">
                      🛡️ Lossless Mode Active
                    </div>
                  )}
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={handleQualityChange}
                    className={`slider ${ultraMode || losslessMode ? 'disabled' : ''}`}
                    disabled={ultraMode || losslessMode}
                  />
                  <div className="range-labels">
                    <span>Low</span>
                    <span>High</span>
                  </div>

                  <button
                    onClick={toggleUltraMode}
                    className={`ultra-toggle-btn ${ultraMode ? 'active' : ''}`}
                    type="button"
                  >
                    {ultraMode ? 'Disable Ultra-Compress' : '⚡ Switch to Ultra-Compress'}
                  </button>

                  <button
                    onClick={toggleLosslessMode}
                    className={`lossless-toggle-btn ${losslessMode ? 'active' : ''}`}
                    type="button"
                  >
                    {losslessMode ? 'Disable Lossless Mode' : '🛡️ Switch to Lossless Mode'}
                  </button>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Original Size</span>
                    <span className="info-value">{formatSize(originalSize)}</span>
                  </div>
                </div>

                <button onClick={handleCompress} disabled={loading} className="compress-btn">
                  {loading ? (
                    <>
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                      </svg>
                      Compressing...
                    </>
                  ) : 'Compress Image'}
                </button>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {compressedImage && (
              <div className="result-section">
                <h2>Compression Complete!</h2>
                <div className="result-comparison">
                  <div className="preview-container">
                    <img src={compressedImage} alt="Compressed" className="preview-image" />
                  </div>
                  <div className="stats-card">
                    <div className="stat-row">
                      <span>New Size:</span>
                      <span className="highlighted-stat">{formatSize(compressedSize)}</span>
                    </div>
                    <div className="savings-badge">
                      Saved {((originalSize - compressedSize) / originalSize * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                <a href={compressedImage} download={`compressed_${file.name}`} className="download-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Image
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
