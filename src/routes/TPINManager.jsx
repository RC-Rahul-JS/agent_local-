import React, { useState,useEffect } from 'react';
import { ref, set,get } from 'firebase/database';
import { database } from '../DB/Firebase';  
import { useLoader } from '../loader/LoaderContext';

const TPINManager = () => {
  const [step, setStep] = useState('verify');
  const [TPIN, setTPIN] = useState('');
  const [currentTPIN, setCurrentTPIN] = useState('');
  const [newTPIN, setNewTPIN] = useState('');
  const [confirmTPIN, setConfirmTPIN] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasTPIN, sethasTPIN] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  // Mock: Agent ID (in real app, get from auth)
  const agentId = localStorage.getItem("AUID"); // e.g., from Firebase Auth or login state


   useEffect(() => {
   (async()=>{
    showLoader()
    try {
        let snap= await get( ref(database, `Agent/TPIN/${agentId}`))
        console.log(snap.val())
        setTPIN(snap.val()?.tpin||null)
        sethasTPIN(snap.val()?.hasTPIN||false)
    } catch (error) {
        console.log(error)
    }finally{
      hideLoader()
    }
   })()
  }, [])

  // Inline styles (same as before)
  const pageStyle = {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    minHeight: '100vh',
    margin: 0,
    lineHeight: '1.6',
    fontSize: '14px',
  };

  const containerStyle = {
    maxWidth: '100%',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#2c3e50',
    fontSize: '18px',
    fontWeight: '600',
  };

  const inputGroupStyle = {
    marginBottom: '16px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const buttonStyle = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: '600',
    marginTop: '10px',
  };

  const buttonDisabledStyle = { ...buttonStyle, backgroundColor: '#95a5a6', cursor: 'wait' };

  const errorStyle = {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '6px',
  };

  const successStyle = {
    color: '#27ae60',
    fontSize: '14px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#d5f5e3',
    borderRadius: '6px',
    marginBottom: '16px',
  };

  // Save TPIN to Firebase Realtime Database
  const saveTPINToFirebase = async (tpin) => {
    showLoader()
    const agentRef = ref(database, `Agent/TPIN/${agentId}`);
    try {
      // 🔥 In production: send to Cloud Function to hash
      // Here we store as example only (NEVER do this in real apps)
      await set(agentRef, {
        tpin: tpin, // ❌ Plaintext — for demo only
        lastUpdated: new Date().toISOString(),
        hasTPIN: true,
      });
      setSuccess('TPIN saved successfully!');
      setStep('success');
    } catch (err) {
      setError('Failed to save TPIN. Please try again.');
      console.error('Firebase write error:', err);
    } finally {
      hideLoader()
    }
  };

  const handleVerify = () => {
    setStep(hasTPIN ? 'change' : 'set');
    setError('');
    setSuccess('');
  };

  const handleSetTPIN = () => {
    setError('');
    if (newTPIN.length !== 4 || !/^\d{4}$/.test(newTPIN)) {
      setError('TPIN must be 4 digits.');
      return;
    }
    if (newTPIN !== confirmTPIN) {
      setError('TPINs do not match.');
      return;
    }
    saveTPINToFirebase(newTPIN);
  };

  const handleChangeTPIN = () => {
    setError('');
    if (currentTPIN.length !== 4 || !/^\d{4}$/.test(currentTPIN)) {
      setError('Current TPIN is invalid.');
      return;
    }
    if (newTPIN.length !== 4 || !/^\d{4}$/.test(newTPIN)) {
      setError('New TPIN must be 4 digits.');
      return;
    }
    if (newTPIN === currentTPIN) {
      setError('New TPIN cannot be the same as current.');
      return;
    }
    if (newTPIN !== confirmTPIN) {
      setError('New TPINs do not match.');
      return;
    }
    if (currentTPIN !== TPIN) {
      setError('Current TPIN is invalid.');
      return;
    }
    saveTPINToFirebase(newTPIN);
  };

  const handleBack = () => {
    setStep('verify');
    setCurrentTPIN('');
    setNewTPIN('');
    setConfirmTPIN('');
    setError('');
    setSuccess('');
  };

  return (
    <div style={pageStyle}>
       <h2 style={{ textAlign: 'center',color: '#b4a383', fontSize: '18px', marginBottom: '20px', position: 'relative' }}>
  
                {/* Back Arrow */}
                <i 
                    className="fa-solid fa-arrow-left"
                    style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: '#b4a383',
                    marginLeft: '10px'
                    }}
                    onClick={() => window.history.back()} // Or use your custom navigate(-1) if using React Router
                ></i> TPIN
            </h2>
      <div style={containerStyle}>
        <h2 style={headerStyle}>
          {step === 'set' ? 'Set TPIN' : step === 'change' ? 'Change TPIN' : 'Manage TPIN'}
        </h2>

        {success && <div style={successStyle}>{success}</div>}
        {/* {error && <div style={errorStyle}>{error}</div>} */}

        {step === 'verify' && (
          <div>
            <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>
              {hasTPIN
                ? 'You already have a TPIN. You can change it below.'
                : 'Please set a 4-digit TPIN for your account.'}
            </p>
            <button style={buttonStyle} onClick={handleVerify}>
              Continue
            </button>
          </div>
        )}

        {step === 'set' && (
          <div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New TPIN (4 digits)</label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                placeholder="4-digit TPIN"
                value={newTPIN}
                onChange={(e) => setNewTPIN(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm TPIN</label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                placeholder="Confirm TPIN"
                value={confirmTPIN}
                onChange={(e) => setConfirmTPIN(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
              />
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <button
              style={loading ? buttonDisabledStyle : buttonStyle}
              onClick={handleSetTPIN}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Set TPIN'}
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#95a5a6', marginTop: '10px' }} onClick={handleBack}>
              Back
            </button>
          </div>
        )}

        {step === 'change' && (
          <div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Current TPIN</label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                placeholder="Enter current TPIN"
                value={currentTPIN}
                onChange={(e) => setCurrentTPIN(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New TPIN</label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                placeholder="Enter new TPIN"
                value={newTPIN}
                onChange={(e) => setNewTPIN(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Confirm New TPIN</label>
              <input
                type="password"
                maxLength="4"
                inputMode="numeric"
                placeholder="Re-enter new TPIN"
                value={confirmTPIN}
                onChange={(e) => setConfirmTPIN(e.target.value.replace(/\D/g, ''))}
                style={inputStyle}
              />
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <button
              style={loading ? buttonDisabledStyle : buttonStyle}
              onClick={handleChangeTPIN}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Change TPIN'}
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#95a5a6', marginTop: '10px' }} onClick={handleBack}>
              Back
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#27ae60', fontSize: '16px', fontWeight: '500' }}>
              ✅ Your TPIN has been updated successfully.
            </p>
            <button style={buttonStyle} onClick={handleBack}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TPINManager;