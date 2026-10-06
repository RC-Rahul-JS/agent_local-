/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         CENTRAL API CONFIGURATION                        ║
 * ╚══════════════════════════════════════════════════════════╝
 */

// DOMAIN ko change karke aap local ya live pe test kar sakte hain.
// Abhi ye aapke Local server (ya IP address) par set hai:
export const DOMAIN = 'https://api.care2connect.in'; // Ya aap 'http://192.168.29.39:5001' likh sakte hain ya 'https://api.care2connect.in'

// --------------------------------------------------------------------------
// AUTOMATICALLY GENERATED ROUTES — DO NOT MODIFY BELOW
// --------------------------------------------------------------------------

export const API_BASE_URL = DOMAIN;
export const API_URL = `${DOMAIN}/badri_enterprises`;
export const BASE_URL = `${API_URL}/localprime`;
export const TRADE_URL = `${API_URL}`;

// Aadhar OTP endpoint
export const AADHAR_OTP_URL = 'https://apipoultry.duniyape.in/api/aadhar';
