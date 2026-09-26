import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { database } from '../DB/Firebase';
import { ref, onValue, off } from 'firebase/database';
import { useLoader } from '../loader/LoaderContext';

const ViewCommission = () => {
  const navigate = useNavigate();

  const [UID, setUID] = useState(''); // Simulated UID (replace with real auth logic)
  const [userdata, setuserdata] = useState({});
  const [list, setList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [agentCommission, setAgentCommission] = useState([]);
  const [totalC, setTotalC] = useState({ d: 0, r: 0 });
  const [viewType, setViewType] = useState(1);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
   setUID(localStorage.getItem("AUID"))
  }, [])
  
  

  useEffect(() => {
    if (UID) {
      const transitionRef = ref(database, `/Agent/Agents/${UID}`);
      const unsubscribe = onValue(transitionRef, (snapshot) => {
        const data = snapshot.val();
        console.log(data, 'hy');
        if (data) {
          setuserdata(data);
        }
      });
  
      return () => {
        off(transitionRef);
      };
    }
  }, [UID]);

  // agentcommission_latest

  useEffect(() => {
    showLoader()
    const fetchLoan = async () => {
      try {
        const res = await axios.get('https://api.duniyamart.duniyape.in/agent-banking-loan-commission');
        // const res = await axios.get('https://api.duniyamart.duniyape.in/agentcommission_latest');
        setList(res.data);
        console.log(res.data)
      } catch (error) {
        console.error(error);
      } finally{
        hideLoader()
      }
    };
    fetchLoan();
  }, []);

  useEffect(() => {
    if (list.accounts && UID) {
      let direct = [];
      let refer = [];
      let total = 0;
      let referral = 0;

      let f = list.accounts.filter((item) => item.agent_id === UID);
      f.forEach((account) => {
        const res = account.final_commission.find((item) => item.agent_id === UID)?.total_commission ?? 0;
        total += res;
        direct.push({ account_number: account.account_number, commission: res, member_name: account.member_name });
      });

      let f2 = list.accounts.filter((item) => item.agent_id !== UID);
      f2.forEach((account) => {
        const res = account.final_commission.find((item) => item.agent_id === UID)?.total_commission ?? 0;
        referral += res;
        refer.push({ agent_id: account.agent_id, commission: res, agent_name: account.agent_name });
      });

      setTotalC({ d: total, r: referral });

      const totalCommissions = refer.reduce((acc, item) => {
        if (!acc[item.agent_id]) {
          acc[item.agent_id] = { ...item };
        } else {
          acc[item.agent_id].commission += item.commission;
        }
        return acc;
      }, {});
      setAgentCommission(Object.values(totalCommissions));
      setAccounts(direct);
    }
  }, [list, UID]);

  const containerStyle = {
    padding: '1rem',
    fontFamily: 'sans-serif',
    backgroundColor: '#fff',
  };

  const boxStyle = {
    border: '1px solid #E3E3E3',
    borderRadius: '15px',
    padding: '15px',
    marginBottom: '1rem',
  };

  const flexBetween = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  };

  const card = (item,index) => (
    <div key={index} style={{ marginBottom: 15, border: '1px solid #E3E3E3', borderRadius: 15, padding: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: 8, boxShadow:'0 0 2px grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className='fa-solid fa-coins' style={{ fontSize:25,color:'gold'}} />
              </div>
              <div style={{ paddingLeft: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{viewType === 1 ? item.member_name : item.agent_name}</div>
                <div style={{ fontSize: 12 }}>{viewType === 1 ? item.account_number : item.agent_id}</div>
              </div>
            </div>
            <div style={{ fontWeight: 600, color: 'green' }}>₹ {parseFloat(item.commission).toFixed(2)}</div>
          </div>
        </div>
  );

  return (
    <div style={containerStyle}>
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
            onClick={() => navigate('/')} // Or use your custom navigate(-1) if using React Router
          ></i>Commissions
        </h2>
      <div style={boxStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: 8, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className='fa-solid fa-user' style={{fontSize:28}} />
            </div>
            <div style={{ paddingLeft: 10 }}>
              <div style={{ fontWeight: 600 }}>{userdata?.mdata?.FirstName + ' ' + userdata?.mdata?.LastName}</div>
              <div style={{ fontSize: 12 }}>{UID}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFF4A6', borderRadius: 8, padding: '5px 15px' }}>
            <div style={{ marginLeft: 8, fontWeight: 'bold', color: '#80710B' }}>{userdata.Designation}</div>
          </div>
        </div>
        <div style={{ ...flexBetween, marginTop: '1rem', gap: 5 }}>
          <button onClick={() => setViewType(1)} style={summaryBtnStyle}>
            <div>₹{totalC.d.toFixed(2)}</div>
            <small>Direct</small>
          </button>
          <button onClick={() => setViewType(2)} style={summaryBtnStyle}>
            <div>₹{totalC.r.toFixed(2)}</div>
            <small>Referral</small>
          </button>
          <button style={summaryBtnStyle}>
            <div>₹{(totalC.d + totalC.r).toFixed(2)}</div>
            <small>Total</small>
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#DFFFFC', padding: '10px 20px', fontWeight: 'bold', color: '#3B8981',margin:"10px 0" }}>
        Commission
      </div>

      {viewType === 1 &&
        accounts.map((item, idx) =>
          card(item,idx)
        )}

      {viewType === 2 &&
        agentCommission.map((item, idx) =>
          card(item,idx)
        )}
    </div>
  );
};

const summaryBtnStyle = {
  backgroundColor: '#D1FAFF',
  borderRadius: '8px',
  padding: '10px',
  width: '100px',
  textAlign: 'center',
  border: 'none',
  fontWeight: '600',
};

export default ViewCommission;
