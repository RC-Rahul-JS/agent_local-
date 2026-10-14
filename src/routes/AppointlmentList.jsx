import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import { DOMAIN, API_BASE_URL } from '../config/api';

const BASE_URL = DOMAIN || API_BASE_URL;

const AppointlmentList = () => {
  const navigate = useNavigate();

  // Agent State
  const initialAgentId = localStorage.getItem('AUID') || 'AG001';
  const [agentId, setAgentId] = useState(initialAgentId);

  // Date Filters (default: current month start to tomorrow to include all today's appointments)
  const [fromDate, setFromDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));

  // Data State
  const [appointments, setAppointments] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Details
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch doctors list for doctor name lookup (cached in sessionStorage to avoid 1MB re-downloads)
  const fetchDoctors = async () => {
    try {
      const cached = sessionStorage.getItem('c2c_cached_doctors');
      if (cached) {
        try {
          const map = JSON.parse(cached);
          if (Object.keys(map).length > 0) setDoctorsMap(map);
        } catch (_) {}
      }

      const res = await axios.get(`${BASE_URL}/c2c_app/doctors`, {
        timeout: 45000,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (res.data && Array.isArray(res.data.data)) {
        const map = {};
        res.data.data.forEach((doc) => {
          if (doc._id) map[doc._id] = doc;
          if (doc.phonenumberID) map[doc.phonenumberID] = doc;
          if (doc.doctorId) map[doc.doctorId] = doc;
        });
        setDoctorsMap(map);
        try {
          sessionStorage.setItem('c2c_cached_doctors', JSON.stringify(map));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Could not fetch doctors list for mapping:', err.message);
    }
  };

  // Fetch appointments from API: GET /c2c_app/appointments/agent/{agent_id}?created_from=...&created_to=...
  const fetchAppointments = async (overrideFrom = fromDate, overrideTo = toDate, isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = {};
      if (overrideFrom) params.created_from = overrideFrom;
      if (overrideTo) params.created_to = overrideTo;

      const targetAgent = agentId || 'AG001';
      const res = await axios.get(`${BASE_URL}/c2c_app/appointments/agent/${targetAgent}`, {
        params,
        timeout: 45000,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });

      if (res.data && res.data.success) {
        setAppointments(res.data.data || []);
      } else if (res.data && Array.isArray(res.data.data)) {
        setAppointments(res.data.data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDoctors();
    fetchAppointments(fromDate, toDate);
  }, []);

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    fetchAppointments(fromDate, toDate);
  };

  // Filtered appointments based on search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const nameMatch = (appt.patient_name || '').toLowerCase().includes(q);
      const apptNumMatch = (appt.appoint_number || '').toLowerCase().includes(q);
      const tokenMatch = String(appt.appointment_index || '').includes(q);
      const phoneMatch = (appt.whatsapp_number || '').includes(q);
      const cityMatch = (appt.city || '').toLowerCase().includes(q);
      const doctorName = appt.doctor_name || doctorsMap[appt.doctor_phone_id]?.name || '';
      const doctorNameMatch = doctorName.toLowerCase().includes(q);

      return nameMatch || apptNumMatch || tokenMatch || phoneMatch || cityMatch || doctorNameMatch;
    });
  }, [appointments, searchQuery, doctorsMap]);

  // Helper to format date display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === 'none') return 'N/A';
    const m = moment(dateStr);
    return m.isValid() ? m.format('DD MMM YYYY') : dateStr;
  };

  // Helper to resolve doctor name
  const getDoctorName = (docId, directDocName = '') => {
    if (directDocName && directDocName.trim()) {
      return directDocName;
    }
    if (!docId) return 'Specialist Doctor';
    const doc = doctorsMap[docId];
    if (doc && doc.name) {
      return `${doc.name} ${doc.speciality ? `(${doc.speciality})` : ''}`;
    }
    return `Doctor ID: ${docId.substring(0, 8)}...`;
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: '#1e293b',
      boxSizing: 'border-box',
      paddingBottom: '40px'
    }}>
      {/* =========================================================================
          TOP NAVBAR / HEADER
          ========================================================================= */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Back Button & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#385FBF',
                fontSize: '18px',
                transition: 'all 0.2s ease'
              }}
              title="Back to Dashboard"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-solid fa-clipboard-list" style={{ color: '#385FBF' }}></i>
                  Doctor Appointments
                </h1>
                <span style={{
                  backgroundColor: '#e0e7ff',
                  color: '#385FBF',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {filteredAppointments.length}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Agent: <span style={{ fontWeight: '600', color: '#b4a383' }}>{agentId}</span>
              </p>
            </div>
          </div>

          {/* Right Action: Refresh button & Book New */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => fetchAppointments(fromDate, toDate, true)}
              disabled={refreshing || loading}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: (refreshing || loading) ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155'
              }}
            >
              <i className={`fa-solid fa-rotate-right ${refreshing ? 'fa-spin' : ''}`} style={{ color: '#385FBF' }}></i>
              <span style={{ display: 'inline' }}>Refresh</span>
            </button>

            <button
              onClick={() => navigate('/dr_appointment')}
              style={{
                backgroundColor: '#385FBF',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(56, 95, 191, 0.25)'
              }}
            >
              <i className="fa-solid fa-calendar-plus" style={{ color: '#b4a383' }}></i>
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
        {/* =========================================================================
            FILTERS & SEARCH BAR
            ========================================================================= */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* Date Range Inputs & Search Form */}
          <form onSubmit={handleApplyFilter} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                From Date (created_from)
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: '#1e293b'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                To Date (created_to)
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: '#1e293b'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  backgroundColor: '#385FBF',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
                Apply Filter
              </button>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                Search Patient / Token / Phone
              </label>
              <div style={{ position: 'relative' }}>
                <i
                  className="fa-solid fa-search"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    fontSize: '14px'
                  }}
                ></i>
                <input
                  type="text"
                  placeholder="Patient name, Token, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#1e293b'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* =========================================================================
            ERROR NOTIFICATION
            ========================================================================= */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '18px' }}></i>
              <span style={{ fontSize: '14px' }}>{error}</span>
            </div>
            <button
              onClick={() => fetchAppointments(fromDate, toDate)}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* =========================================================================
            LOADING SPINNER
            ========================================================================= */}
        {loading && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '32px', color: '#385FBF', marginBottom: '12px' }}></i>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155' }}>Fetching Appointments...</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Communicating with Care2Connect backend server</div>
          </div>
        )}

        {/* =========================================================================
            EMPTY STATE
            ========================================================================= */}
        {!loading && filteredAppointments.length === 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#94a3b8',
              fontSize: '28px'
            }}>
              <i className="fa-solid fa-clipboard-question"></i>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>
              No Appointments Found
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px' }}>
              {searchQuery
                ? `No matching appointments found for "${searchQuery}". Try adjusting your search keyword or clearing date filters.`
                : `No doctor appointments found for Agent ${agentId} in the selected date range (${fromDate || 'Start'} to ${toDate || 'End'}).`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  fetchAppointments('', '');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear Date Filter
              </button>
              <button
                onClick={() => navigate('/dr_appointment')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#385FBF',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fa-solid fa-plus"></i> Book First Appointment
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            APPOINTMENTS CARD GRID
            ========================================================================= */}
        {!loading && filteredAppointments.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {filteredAppointments.map((appt) => {
              const isPaid = (appt.payment_status || '').toLowerCase() === 'paid' || (appt.status || '').toLowerCase() === 'success';
              const doctorTitle = getDoctorName(appt.doctor_phone_id, appt.doctor_name);

              return (
                <div
                  key={appt._id || appt.appoint_number || Math.random()}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Card Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#385FBF',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '3px 9px',
                          borderRadius: '6px'
                        }}>
                          Token #{appt.appointment_index || '1'}
                        </span>

                        <span style={{
                          backgroundColor: isPaid ? '#ecfdf5' : '#fffbeb',
                          color: isPaid ? '#059669' : '#d97706',
                          border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-clock'}`}></i>
                          {isPaid ? 'PAID' : (appt.payment_status || 'PENDING')}
                        </span>
                      </div>

                      {/* Fee Badge */}
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#b4a383',
                        backgroundColor: '#fefce8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fef08a'
                      }}>
                        ₹{appt.amount || '0'}
                      </div>
                    </div>

                    {/* Patient Name */}
                    <div style={{ marginBottom: '6px' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '17px',
                        fontWeight: '700',
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{appt.patient_name || 'Anonymous Patient'}</span>
                        {appt.sex && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#64748b',
                            backgroundColor: '#f1f5f9',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {appt.sex} {appt.age && `(${appt.age}y)`}
                          </span>
                        )}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        ID: <strong style={{ color: '#334155' }}>{appt.appoint_number || 'N/A'}</strong>
                      </div>
                    </div>

                    <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '10px 0' }}></div>

                    {/* Meta Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      {/* Doctor info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-user-doctor" style={{ color: '#385FBF', width: '16px', textAlign: 'center' }}></i>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{doctorTitle}</span>
                      </div>

                      {/* Appointment Date & Slot */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-calendar-day" style={{ color: '#b4a383', width: '16px', textAlign: 'center' }}></i>
                        <span>
                          <strong>{formatDateDisplay(appt.date_of_appointment)}</strong> • {appt.time_slot || 'All Day'}
                        </span>
                      </div>

                      {/* Location / City */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', width: '16px', textAlign: 'center' }}></i>
                        <span>{appt.city ? `${appt.city}${appt.state ? `, ${appt.state}` : ''}` : 'Location N/A'}</span>
                      </div>

                      {/* Contact / Phone */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-brands fa-whatsapp" style={{ color: '#22c55e', width: '16px', textAlign: 'center' }}></i>
                        <span>+{appt.whatsapp_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedAppointment(appt)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        color: '#385FBF',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    >
                      <i className="fa-solid fa-circle-info"></i>
                      View Full Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          APPOINTMENT DETAILS MODAL
          ========================================================================= */}
      {selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#385FBF',
              color: '#ffffff',
              borderRadius: '15px 15px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b4a383',
                  fontSize: '18px'
                }}>
                  <i className="fa-solid fa-file-medical"></i>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                    Appointment Details
                  </h2>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Appt #: {selectedAppointment.appoint_number}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '20px',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Status Header Banner */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Token / Index</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#385FBF' }}>
                    Token #{selectedAppointment.appointment_index || '1'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Payment Status</div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: (selectedAppointment.payment_status === 'paid' || selectedAppointment.status === 'success') ? '#059669' : '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <i className="fa-solid fa-circle" style={{ fontSize: '8px' }}></i>
                    {(selectedAppointment.payment_status || selectedAppointment.status || 'Pending').toUpperCase()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Consultation Fee</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#b4a383' }}>
                    ₹{selectedAppointment.amount || '0'}
                  </div>
                </div>
              </div>

              {/* Grid of Sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                {/* Section 1: Patient Information */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#385FBF',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-user"></i> Patient Information
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Full Name: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.patient_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Age / DOB: </span>
                      <strong style={{ color: '#1e293b' }}>
                        {selectedAppointment.age ? `${selectedAppointment.age} years` : 'N/A'}
                        {selectedAppointment.date_of_birth && selectedAppointment.date_of_birth !== 'none' && ` (${selectedAppointment.date_of_birth})`}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Gender: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.sex || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Guardian / Father: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.guardian_name || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Symptoms: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.symptoms || 'Routine Consultation'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Vaccine Opted: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.vaccine || 'No'}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 2: Appointment & Doctor Details */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#385FBF',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-user-doctor"></i> Doctor & Schedule
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Doctor: </span>
                      <strong style={{ color: '#1e293b' }}>{getDoctorName(selectedAppointment.doctor_phone_id, selectedAppointment.doctor_name)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Appointment Date: </span>
                      <strong style={{ color: '#1e293b' }}>{formatDateDisplay(selectedAppointment.date_of_appointment)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Time Slot: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.time_slot || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Appointment Type: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.appointmenttype || 'Regular'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Booking Agent ID: </span>
                      <strong style={{ color: '#b4a383' }}>{selectedAppointment.agent_id || agentId}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Address */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#385FBF',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-address-book"></i> Contact & Address
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>WhatsApp / Mobile: </span>
                      <strong style={{ color: '#1e293b' }}>+{selectedAppointment.whatsapp_number || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Email: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.email || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Address: </span>
                      <strong style={{ color: '#1e293b' }}>{selectedAppointment.address || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>City / State / Pin: </span>
                      <strong style={{ color: '#1e293b' }}>
                        {[selectedAppointment.city, selectedAppointment.state, selectedAppointment.pincode].filter(Boolean).join(', ') || 'N/A'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 4: Payment & Transaction */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#385FBF',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa-solid fa-receipt"></i> Transaction Details
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Amount Paid: </span>
                      <strong style={{ color: '#b4a383' }}>₹{selectedAppointment.amount || '0'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Payment ID (pay_id): </span>
                      <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {selectedAppointment.pay_id || 'N/A'}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Order / Rzp Ref: </span>
                      <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                        {selectedAppointment.razorpay_url || 'N/A'}
                      </code>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Paid At: </span>
                      <span style={{ color: '#334155' }}>
                        {selectedAppointment.paid_at ? moment(selectedAppointment.paid_at).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Created At: </span>
                      <span style={{ color: '#334155' }}>
                        {selectedAppointment.createdAt ? moment(selectedAppointment.createdAt).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons inside Modal */}
              <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#385FBF',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointlmentList;
