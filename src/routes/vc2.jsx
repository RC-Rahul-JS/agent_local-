import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { database } from '../DB/Firebase';
import { ref, onValue, off } from 'firebase/database';
import { useLoader } from '../loader/LoaderContext';

const ViewCommission = () => {
  const [UID, setUID] = useState('');
  const [userdata, setUserdata] = useState({});
  const [allAgents, setAllAgents] = useState({});
  const [list, setList] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [agentCommission, setAgentCommission] = useState([]);
  const [totalC, setTotalC] = useState({ d: 0, r: 0 });
  const [date,setdate] = useState({ from: null, to: null });
  const [viewType, setViewType] = useState(1);
  const {showLoader, hideLoader } = useLoader();


const handleViewChange = (type) => {
  setViewType(type);
};





  useEffect(() => {
    setUID(localStorage.getItem('AUID'));
  }, []);

  useEffect(() => {
    if (UID) {
      const transitionRef = ref(database, `/Agent/Agents/${UID}`);
      const unsubscribe = onValue(transitionRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setUserdata(data);
      });

      return () => {
        off(transitionRef);
      };
    }
  }, [UID]);

  // Fetch ALL agents (for referral names)
  useEffect(() => {
    const agentsRef = ref(database, `/Agent/Agents`);
    const unsubscribe = onValue(agentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setAllAgents(data);
    });

    return () => {
      off(agentsRef);
    };
  }, []);

  useEffect(() => {
  showLoader();
  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://api.duniyamart.duniyape.in/agentcommission_latest"
      );
      const f = res.data.accounts || [];

      const filtered = f.filter(
        (item) => item.agent_id === localStorage.getItem("AUID")
      );

      const direct = filtered.filter((item) => item.type === "direct");
      const referr = filtered.filter((item) => item.type === "referr");

      setList(filtered);
      // setDirectList(direct);
      // setReferralList(referr);

      // if (referr.length > 0) {
      //   setViewType(2); 
      // } else if (direct.length > 0) {
      //   setViewType(1); 
      // } else {
      //   setViewType(3);
      // }

    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };
  fetchData();
}, []);



  // Process Direct & Referral Commissions
  useEffect(() => {
    console.log(list)
    const from = date.from ? new Date(date.from) : null;
    const to = date.to ? new Date(date.to) : null;
    let filteredlist=[...list]
     if(from){
        filteredlist=filteredlist.filter(item=>new Date(item.date) >= from)
     }
     if(to){
        filteredlist=filteredlist.filter(item=>new Date(item.date) <= to)
     }
    if (filteredlist.length && UID) {
      let direct = [];
      let refer = [];
      let total = 0;
      let referral = 0;
// Direct Commissions (self)
let f = filteredlist.filter((item) => item.agent_id === UID&&item.type==='Direct');
f.forEach((account) => {
  const res = Number(account.commission) || 0;
  total += res;
  direct.push({
    account_number: account.account_number,
    commission: res,
    member_name: account.member_name,
    type: account.type,
    remark: account.remark,
    date:account.date
  });
});

// Referral Commissions (others)
let f2 = filteredlist.filter((item) =>item.type==='Reffer');
f2.forEach((account) => {
  const res = Number(account.commission) || 0;
  referral += res;

  const agentName =
    allAgents?.[account.agent_id]?.mdata?.FirstName +
      ' ' +
      allAgents?.[account.agent_id]?.mdata?.LastName ||
    account.agent_name ||
    'Unknown';

  refer.push({
    agent_id: account.agent_id,
    commission: res,
    agent_name:  account.member_name,
    // member_name: account.member_name,
    type: account.type,
    remark: account.remark,
    account_number: account.account_number,
    date:account.date,
    account_agent_id:account.account_agent_id,
    account_agent_name:account.account_agent_name,

  });
});

      setTotalC({ d: total, r: referral });
      setAgentCommission(refer);
      setAccounts(direct);
    }
  }, [list, UID, allAgents,date]);

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

  const card = (item, index) => (
    <div
      key={index}
      style={{
        marginBottom: 15,
        border: '1px solid #E3E3E3',
        borderRadius: 15,
        padding: 15,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              boxShadow: '0 0 2px grey',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i
              className="fa-solid fa-coins"
              style={{ fontSize: 25, color: 'gold' }}
            />
          </div>
          <div style={{ paddingLeft: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              
  {item.account_agent_name?item.account_agent_name +' ('+item.account_agent_id+')':item.name || item.member_name || item.agent_name}
</div>

  <div style={{ fontSize: 12, color: '#000000ff', marginTop: 4 }}>
    {item.account_number}
  </div>


            {item.remark && (
  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
    {item.remark}
  </div>
)}

          </div>
        </div>
          <p style={{color:'grey',fontSize:10}}>{item.date}</p>

        <div style={{ fontWeight: 600, color: 'green' }}>
          <p>₹ {parseFloat(item.commission).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <h2
        style={{
          textAlign: 'center',
          color: '#b4a383',
          fontSize: '18px',
          marginBottom: '20px',
          position: 'relative',
        }}
      >
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
            marginLeft: '10px',
          }}
          onClick={() => window.history.back()}
        ></i>
        Commissions
      </h2>

      <div style={{display:'flex',justifyContent:'space-around',padding:5}}>
          <label>From:
           <input
                value={date.from}
                onChange={(e) => setdate({...date,from: e.target.value })}
                type='date'
                style={{padding:'2px 5px',marginLeft:5}}
              />
          </label>
          <label>To:
          <input
                value={date.from}
                onChange={(e) => setdate({...date,from: e.target.value })}
                type='date'
                style={{padding:'2px 5px',marginLeft:5}}
              />
          </label>
        
       .
      </div>

      {/* Agent Header */}
      <div style={boxStyle}>
        <div style={{ ...flexBetween }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 8,
                background: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-solid fa-user" style={{ fontSize: 28 }} />
            </div>
            <div style={{ paddingLeft: 10 }}>
              <div style={{ fontWeight: 600 }}>
                {userdata?.mdata?.FirstName +
                  ' ' +
                  userdata?.mdata?.LastName}
              </div>
              <div style={{ fontSize: 12 }}>{UID}</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFF4A6',
              borderRadius: 8,
              padding: '5px 15px',
            }}
          >
            <div
              style={{
                marginLeft: 8,
                fontWeight: 'bold',
                color: '#80710B',
              }}
            >
              {userdata.Designation}
            </div>
          </div>
        </div>

       


        {/* Commission Summary */}
      <div style={{ ...flexBetween, marginTop: '1rem', gap: 5 }}>
  <button onClick={() => handleViewChange(1)} style={summaryBtnStyle}>
    <div>₹{totalC.d.toFixed(2)}</div>
    <small>Direct</small>
  </button>
  <button onClick={() => handleViewChange(2)} style={summaryBtnStyle}>
    <div>₹{totalC.r.toFixed(2)}</div>
    <small>Referral</small>
  </button>
  <button onClick={() => handleViewChange(3)} style={summaryBtnStyle}>
    <div>₹{(totalC.d + totalC.r).toFixed(2)}</div>
    <small>Total</small>
  </button>
</div>

      </div>

      <div
        style={{
          backgroundColor: '#DFFFFC',
          padding: '10px 20px',
          fontWeight: 'bold',
          color: '#3B8981',
          margin: '10px 0',
        }}
      >
        Commission
      </div>

     {viewType === 1 && accounts.map((item, idx) => card(item, idx))}
{viewType === 2 && agentCommission.map((item, idx) => card(item, idx))}
{viewType === 3 && (
  [...accounts.map(acc => ({
    name: acc.member_name,
    id: acc.account_number,
    commission: acc.commission,
    remark: acc.remark,
    date:acc.date,
        account_number: acc.account_number,

  })),
  ...agentCommission.map(ref => ({
    name: ref.agent_name,
    id: ref.agent_id,
    commission: ref.commission,
    remark: ref.remark,
    account_number: ref.account_number,
    date:ref.date,
    account_agent_id:ref.account_agent_id,
    account_agent_name:ref.account_agent_name,

  }))].map((item, idx) => (
    <div key={idx}>
      {card(item, idx)}
    </div>
  ))
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