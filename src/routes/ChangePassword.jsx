import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config/api';

const ChangePassword = () => {
    const { showLoader, hideLoader } = useLoader();
    const initialFormData = {
      old:'',
      confirmpassword: '',
      password: '',
    };
    
    const [formdata, setformdata] = useState(initialFormData);
    const [UID, setUID] = useState('');
    const [agentMongoId, setAgentMongoId] = useState('');

    useEffect(() => {
        const storedAUID = localStorage.getItem("AUID");
        setUID(storedAUID || '');

        // Fetch agent's MongoDB _id
        const fetchAgentId = async () => {
          if (!storedAUID) return;
          try {
            const res = await axios.get(`${BASE_URL}/agents`);
            const agents = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.agents || []);
            const foundAgent = agents.find(a => {
              const codes = [a.agentCode, a.AgentCode, a.agent_code, a.memberId, a.MemberNo, a.code]
                .map(v => String(v || '').toLowerCase().trim());
              return codes.includes(storedAUID.toLowerCase());
            });
            if (foundAgent) {
              setAgentMongoId(String(foundAgent._id?.$oid || foundAgent._id || foundAgent.id || ''));
            }
          } catch (err) {
            console.error('Failed to fetch agent info:', err);
          }
        };

        fetchAgentId();
    }, []);
    
    const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const Create = async (e) => {
      e.preventDefault();

      if (!formdata.old) {
          toast.error("Please enter your old password");
          return;
      } else if (formdata.password !== formdata.confirmpassword) {
          toast.error("Password Didn't Match");
          return;
      } else if (!passwordFormat.test(formdata.password)) {
          toast.error("Password must include 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special symbol");
          return;
      }

      if (!agentMongoId) {
          toast.error("Agent ID not found. Please try refreshing the page.");
          return;
      }

      showLoader();
      try {
          const res = await axios.post(`${BASE_URL}/agent/change-password`, {
              member_id: agentMongoId,
              old_password: formdata.old,
              new_password: formdata.password
          });

          if (res.data && res.data.success) {
              toast.success("Password Updated Successfully");
              setformdata(initialFormData);
          } else {
              toast.error(res.data?.message || "Failed to update password");
          }
      } catch (err) {
          console.error('Failed to update password:', err);
          const errorMsg = err.response?.data?.message || err.message || 'Failed to update password';
          toast.error(errorMsg);
      } finally {
          hideLoader();
      }
    };

    return (
        <div style={container}>
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
    onClick={() => window.history.back()} 
  ></i>  Change Password
          </h2>
          <form onSubmit={Create}>
            {/* Form Fields */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

            {[
                { label: 'Old Password', name: 'old', type: "password" },
            ].map((field, idx) => (
                <div key={idx} style={formItem}>
                <label style={labelStyle}>{field.label}</label>
                <input
                required
                value={formdata[field.name]}
                onChange={(e) => setformdata({ ...formdata, [field.name]: e.target.value })}
                type={field.type || 'text'}
                style={inputStyle}
                />
                </div>
            ))}
            </div>

            <div style={formItem}>
              <label style={labelStyle}>Create Password</label>
              <input
                required
                type="password"
                value={formdata.password}
                onChange={(e) => setformdata({ ...formdata, password: e.target.value })}
                style={inputStyle}
              />

              {/* Password Rules */}
              <div style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                <p style={{ margin: 0, color: formdata.password.length >= 8 ? "green" : "red" }}>
                  • Minimum 8 characters
                </p>

                <p style={{ margin: 0, color: /[A-Z]/.test(formdata.password) ? "green" : "red" }}>
                  • At least 1 uppercase letter (A–Z)
                </p>

                <p style={{ margin: 0, color: /[a-z]/.test(formdata.password) ? "green" : "red" }}>
                  • At least 1 lowercase letter (a–z)
                </p>

                <p style={{ margin: 0, color: /\d/.test(formdata.password) ? "green" : "red" }}>
                  • At least 1 number (0–9)
                </p>

                <p style={{ margin: 0, color: /[@$!%*?&]/.test(formdata.password) ? "green" : "red" }}>
                  • At least 1 special character (@, $, !, %, *, ?, &)
                </p>
              </div>
            </div>

            <div style={formItem}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                required
                value={formdata.confirmpassword}
                onChange={(e) => setformdata({ ...formdata, confirmpassword: e.target.value })}
                type='password'
                style={inputStyle}
                />
            </div>

          <button type='submit' style={buttonStyle}>Update</button>
          </form>
        </div>
      )}

export default ChangePassword

const container = {
  maxWidth: '800px',
  margin: 'auto',
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 'bold',
  color:'#b4a383'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #b4a383',
  onfocus:"#b4a383"
};

const buttonStyle = {
  width: '100%',
  backgroundColor: '#385FBF',
  color: '#b4a383',
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  // fontSize: '16px',
  marginBottom: '20px',
};
const formItem = {
  flex: '1 1 48%',
  minWidth: '250px',
  marginBottom:16
};