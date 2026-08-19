import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import { useLoader } from '../loader/LoaderContext';

const LoanReq = ({ uid }) => {
  const [filter, setFilter] = useState('Pending');
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  

  const getApiData = async () => {
    if (!uid) return;
    showLoader();
    try {
      const res = await axios.get(`${BASE_URL}/loan-requests`);
      const allData = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.requests || []);
      
      // Filter for current agent
      const filteredData = allData.filter(item => {
          const intro = String(
            item.agentCode || item.agent_code || item.IntroCode || item.createdBy || item.introducer || ''
          ).toLowerCase();
          return intro === String(uid).toLowerCase();
      });
      
      setData(filteredData);
      console.log('[LoanReq] Filtered Loan Requests:', filteredData);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    } finally{
        hideLoader();
    }
  };

  useEffect(() => {
    getApiData();
  }, [uid]);

  useEffect(() => {
    const filteredData = data
      .filter(item => {
          const status = String(item.status || item.Status || 'pending').toLowerCase();
          return status === String(filter).toLowerCase();
      })
      .sort((a, b) => new Date(b.created_at || b.Date || 0) - new Date(a.created_at || a.Date || 0));
    setList(filteredData);
  }, [filter, data]);

  return (
    <div style={{ padding: '20px 0', backgroundColor: 'white' }}>
      <label>Status</label>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: '8px', borderRadius: '6px', borderColor: '#D8D8D8', width: '100%', marginBottom: '15px' }}
      >
        <option value="Pending">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Rejected">Rejected</option>
      </select>
      <TableWithFlatList list={list} />
    </div>
  );
};

const TableWithFlatList = ({ list }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#b4a383', color: 'black' }}>
          <tr>
            <th style={styles.headcell}>Date</th>
            <th style={styles.headcell}>Request ID</th>
            <th style={styles.headcell}>Member ID</th>
            <th style={styles.headcell}>Name</th>
            <th style={styles.headcell}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No requests found</td>
            </tr>
          ) : (
            list.map((item, index) => {
              const date = item.created_at || item.createdAt || item.date || item.Date || '—';
              const reqId = item.request_id || item._id?.$oid || item._id || item.Code || '—';
              const memberId = item.memberId || item.member_id || item.MID || '—';
              const name = item.memberName || item.MemberName || '—';
              const amount = item.requestedAmount || item.loanAmount || 0;
              
              return (
                <tr key={index} style={styles.row}>
                  <td style={styles.cell}>{date ? new Date(date).toLocaleDateString() : '—'}</td>
                  <td style={styles.cell}>
                    <span style={{ fontSize: '12px', background: '#f4f4f4', padding: '2px 6px', borderRadius: '4px' }}>
                      {reqId.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td style={styles.cell}>{memberId}</td>
                  <td style={styles.cell}>{name}</td>
                  <td style={styles.cell}>₹{Number(amount).toLocaleString('en-IN')}</td>
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
    fontSize: '14px',
    color: '#333',
  },
  headcell: {
    padding: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default LoanReq;