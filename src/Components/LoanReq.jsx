import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { database } from '../DB/Firebase';
import { useLoader } from '../loader/LoaderContext';

const LoanReq = ({ uid }) => {
  const [filter, setFilter] = useState('Pending');
  const [data, setData] = useState([]);
  const [list, setList] = useState([]);
  const { showLoader, hideLoader } = useLoader();
  

  const getApiData = async () => {
    showLoader()
    try {
      const dataRef = ref(database, '/loan/application/');
      const snapshot = await get(dataRef);
  
      if (snapshot.exists()) {
        const allData = Object.values(snapshot.val() || {});
        const filteredData = allData.filter(item => item.IntroCode === uid);
        setData(filteredData);
      } else {
        console.log('No data available');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally{
        hideLoader()
    }
  };

  useEffect(() => {
    getApiData();
  }, [uid]);

  useEffect(() => {
    const filteredData = data
      .filter(item => item.Status === filter)
      .sort((a, b) => new Date(b.ReceiptDate) - new Date(a.ReceiptDate));
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
        <option value="Reject">Rejected</option>
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
            <th style={styles.headcell}>Application No</th>
            <th style={styles.headcell}>Member ID</th>
            <th style={styles.headcell}>Name</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item, index) => (
            <tr key={index} style={styles.row}>
              <td style={styles.cell}>{item.Date}</td>
              <td style={styles.cell}>{item.Code}</td>
              <td style={styles.cell}>{item.MID}</td>
              <td style={styles.cell}>{item.MemberName}</td>
            </tr>
          ))}
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