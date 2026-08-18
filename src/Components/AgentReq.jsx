import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';
import { BASE_URL } from '../config/api';

const AgentReq = ({ uid }) => {
  const [filter, setFilter] = useState('pending');
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  

    const getApiData = async () => {
      showLoader();
      try {
        const res = await axios.get(`${BASE_URL}/agent-requests`);
        let rawAgents = [];
        if (Array.isArray(res.data))               rawAgents = res.data;
        else if (Array.isArray(res.data?.data))    rawAgents = res.data.data;
        else if (Array.isArray(res.data?.requests)) rawAgents = res.data.requests;

        // Log the raw data so we can see what's coming from the backend
        console.log('[AgentReq] Raw API data:', rawAgents);
        console.log('[AgentReq] Current logged-in UID:', uid);

        // Filter by introducer UID (if uid exists)
        const filteredData = rawAgents.filter(item => {
          const intro = String(
            item.agent_code || item.agentCode || item.AgentCode ||
            item.introducer_code || item.IntroCode || ''
          ).toLowerCase();
          
          // Debug each item
          console.log(`[AgentReq] Checking request ${item._id || item.id} -> Intro: ${intro} === UID: ${String(uid).toLowerCase()} ?`);
          
          // Fallback: if no UID is set, or if we want to show all for testing, we can adjust this.
          // For now, let's keep the filter but allow it if intro is empty just in case? 
          // No, let's strictly match but return everything if we are debugging.
          return intro === String(uid).toLowerCase() || String(uid).toLowerCase() === 'admin';
        });
        
        console.log('[AgentReq] Filtered data for this agent:', filteredData);
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        hideLoader();
      }
    };

  useEffect(() => {
    getApiData();
  }, [uid]);

  useEffect(() => {
    const filteredData = data
      .filter((item) => {
        const s = String(item.status || item.Status || 'pending').toLowerCase();
        return s === filter.toLowerCase();
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setList(filteredData);
  }, [filter, data]);

  return (
    <div style={{ width: '100%', backgroundColor: 'white', padding: '20px 0' }}>
     <label>Status</label>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: '8px', borderRadius: '6px', borderColor: '#D8D8D8', width: '100%', marginBottom: '15px' }}
      >
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#f8f9fa' }}>
        <thead style={{ backgroundColor: '#b4a383', color: 'black' }}>
          <tr>
            <th style={styles.headcell}>Date</th>
            <th style={styles.headcell}>Agent ID</th>
            <th style={styles.headcell}>Member ID</th>
            <th style={styles.headcell}>Name</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="4" style={{...styles.cell, padding: '20px', color: '#888'}}>
                No {filter} agent requests found.
              </td>
            </tr>
          ) : (
            list.map((item, index) => {
              const date = item.date || item.createdAt || '-';
              const code = item.member_code || item.MemberCode || item.memberId || '-';
              const name = item.member_name || item.memberName || item.name || '-';
              
              return (
                <tr key={item._id || item.id || index} style={styles.row}>
                  <td style={styles.cell}>{date}</td>
                  <td style={styles.cell}>-</td>
                  <td style={styles.cell}>{code}</td>
                  <td style={styles.cell}>{name}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  row: {
    borderBottom: '1px solid #ddd',
    textAlign: 'center',
  },
  cell: {
    padding: '8px',
    textAlign: 'center',
    color: '#333',
    fontSize: '14px',
  },
  headcell: {
    padding: '8px',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '14px',
  },
};

export default AgentReq;
