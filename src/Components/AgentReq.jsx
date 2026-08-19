import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';
import { BASE_URL } from '../config/api';

const AgentReq = ({ uid }) => {
  const [filter, setFilter] = useState('pending');
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const { showLoader, hideLoader } = useLoader();

  const [members, setMembers] = useState([]);

  const getApiData = async () => {
    showLoader();
    try {
      // 1. Fetch the members list so we can resolve names if they are null
      const memRes = await axios.get(`${BASE_URL}/get-members`).catch(() => ({ data: [] }));
      const memList = Array.isArray(memRes.data) ? memRes.data : (memRes.data?.data || []);
      setMembers(memList);

      // 2. Fetch agent requests
      const targetApiUrl = `${BASE_URL}/agent-requests`;
      console.log("Agent API URL:", targetApiUrl);
      const res = await axios.get(targetApiUrl);
      
      const rawAgents = res.data?.data || res.data?.requests || res.data || [];
      console.log('[AgentReq] Fetched all requests:', rawAgents);
      
      setData(rawAgents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    getApiData();
  }, [uid]);

  const getEffectiveStatus = (raw) => {
    const s = (
      raw?.status ||
      raw?.Status ||
      raw?.request_status ||
      raw?.approval_status ||
      raw?.agentStatus ||
      'pending'
    ).toString().toLowerCase();
    if (['approved', 'accepted', 'active', 'verified', '1', 'true'].includes(s)) return 'approved';
    if (['rejected', 'declined', 'false', '0'].includes(s)) return 'rejected';
    return 'pending';
  };

  useEffect(() => {
    const filteredData = data
      .filter((item) => {
        const s = getEffectiveStatus(item);
        return s === filter.toLowerCase();
      })
      .sort((a, b) => {
        const d1 = new Date(a.date || a.createdAt || a.created_at || 0);
        const d2 = new Date(b.date || b.createdAt || b.created_at || 0);
        return d2 - d1;
      });
    setList(filteredData);
    console.log(`[AgentReq] Tab: ${filter}, Found:`, filteredData);
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
              <td colSpan="4" style={{ ...styles.cell, padding: '20px', color: '#888' }}>
                No {filter} agent requests found.
              </td>
            </tr>
          ) : (
            list.map((item, index) => {
              let date = item.date || item.createdAt || item.created_at || '-';
              if (date !== '-') {
                try {
                  date = new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  });
                } catch (e) {
                  // ignore
                }
              }
              // Prioritize human-readable memberId first, fallback to mongo member_id
              const code = item.memberId || item.MemberId || item.member_code || item.memberCode || item.MemberCode || item.member_id || '-';
              
              // Resolve name from the item itself, or look it up in the members list we just fetched!
              let name = item.memberName || item.member_name || item.MemberName || item.name || '';
              if (!name) {
                const foundMem = members.find(m => 
                  String(m.memberId) === String(item.memberId) || 
                  String(m._id) === String(item.member_id) || 
                  String(m.id) === String(item.member_id)
                );
                if (foundMem) {
                  name = `${foundMem.FirstName || foundMem.firstname || ''} ${foundMem.LastName || foundMem.lastname || ''}`.trim() || foundMem.MemberName;
                }
              }
              name = name || 'N/A';

              // agentCode or agent_code if available, otherwise it's pending so they don't have one yet.
              const agentId = item.agentCode || item.agent_code || item.AgentCode || '-';

              return (
                <tr key={item._id || item.request_id || item.id || index} style={styles.row}>
                  <td style={styles.cell}>{date}</td>
                  <td style={styles.cell}>{agentId}</td>
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
