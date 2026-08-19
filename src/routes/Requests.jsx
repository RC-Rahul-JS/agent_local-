import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import axios from 'axios';
import { BASE_URL } from '../config/api';
import AgentReq from '../Components/AgentReq';
import LoanReq from '../Components/LoanReq';
import { useLoader } from '../loader/LoaderContext';


// Main Requests Component
const Requests = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [UID, setUID] = useState(null);

  useEffect(() => {
    const value = localStorage.getItem('AUID');
    if (value !== null) {
      setUID(value);
    }
  }, []);

  return (
    <>
      <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center', color: '#b4a383', fontSize: '18px', marginBottom: '20px', position: 'relative' }}>

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
            onClick={() => navigate('/')}
          ></i>Requests
        </h2>
        <Tabs selectedIndex={index} onSelect={setIndex}>
          <TabList style={{ display: 'flex', width: '100%', color: '#b4a383', fontSize: 14, fontWeight: 600 }}>
            <Tab style={{ flex: 1, textAlign: 'center' }}>Member Req.</Tab>
            <Tab style={{ flex: 1, textAlign: 'center' }}>Loan Req.</Tab>
            <Tab style={{ flex: 1, textAlign: 'center' }}>Agent Req.</Tab>
          </TabList>

          <TabPanel>
            <Requestsx memberId={UID} />
          </TabPanel>
          <TabPanel>
            <LoanReq uid={UID} />
          </TabPanel>
          <TabPanel>
            <AgentReq uid={UID} />
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
};

export default Requests;

// ============================
const Requestsx = ({ memberId }) => {
  const [filter, setfilter] = useState('Request');
  const [data, setdata] = useState([]);
  const [list, setlist] = useState([]);
  const { showLoader, hideLoader } = useLoader();

  const getApiData = async () => {
    if (!memberId) return;
    showLoader();
    try {
      const res = await axios.get(`${BASE_URL}/member-requests`);
      console.log('[Requestsx] Raw API Data:', res.data);


      let allData = [];
      if (Array.isArray(res.data)) allData = res.data;
      else if (Array.isArray(res.data?.data)) allData = res.data.data;
      else if (Array.isArray(res.data?.requests)) allData = res.data.requests;

      // Filter to show member requests created by THIS Agent
      const filteredData = allData.filter(item => {
        const intro = String(
          item.AgentCode || item.agentCode || item.agent_code ||
          item.IntroCode || item.introducer_code || item.member_code || ''
        ).toLowerCase();
        const myId = String(memberId).toLowerCase();
        return intro === myId;
      });

      console.log('[Requestsx] Raw API Member Requests:', allData);
      console.log('[Requestsx] Filtered for this Agent:', filteredData);
      setdata(filteredData);
    } catch (error) {
      console.error('Error fetching member requests:', error);
    } finally {
      hideLoader();
    }
  };


  useEffect(() => {
    getApiData();
  }, [memberId]);

  useEffect(() => {
    const filteredData = data.filter(item => {
      const s = String(item.Status || item.status || 'Request').toLowerCase();
      return s === filter.toLowerCase();
    })
      .sort((a, b) => new Date(b.ReceiptDate) - new Date(a.ReceiptDate));

    setlist(filteredData);
    console.log('[Requestsx] Status Filtered List:', filteredData);
  }, [filter, data]);

  return (
    <div style={{ width: '100%', backgroundColor: 'white', padding: '20px 0' }}>
      <label style={{ marginTop: '8px', display: 'block' }}>Status</label>
      <select
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid #D8D8D8',
          marginBottom: '20px',
        }}
        value={filter}
        onChange={(e) => setfilter(e.target.value)}
      >
        <option value="Request">Pending</option>
        <option value="Approved">Approved</option>
        <option value="Reject">Rejected</option>
      </select>

      <TableWithFlatList list={list} />
    </div>
  );
};

// ============================
const TableWithFlatList = ({ list }) => {
  return (
    <div style={{
      overflowX: 'auto',
      backgroundColor: '#b4a383',
      borderRadius: '2px'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'flex',
        backgroundColor: '#b4a383',
        fontWeight: 'bold',
        padding: '10px 0',
      }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '14px' }}>S.No</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '14px' }}>Date</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '14px' }}>Name</div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '14px' }}>Share</div>
      </div>

      {/* Table Rows */}
      {list.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            borderBottom: '1px solid #ddd',
            padding: '10px 0',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: 1, textAlign: 'center', fontSize: '12px' }}>{index + 1}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '12px' }}>{item.ReceiptDate}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '12px' }}>{item.FirstName} {item.LastName}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: item.share ? '' : 'red' }}>{item.share ? item.share : 'Membership Fee Pending'}</div>
        </div>
      ))}
    </div>
  );
};

// // Dummy components for LoanReq and AgentReq
// const LoanReq = ({ uid }) => {
//   return <div>Loan Request - UID: {uid}</div>;
// };

// const AgentReq = ({ uid }) => {
//   return <div>Agent Request - UID: {uid}</div>;
// };
