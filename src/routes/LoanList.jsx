import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import personalLoanAnim from '../Components/personalLoanAnim.json'
import { useNavigate } from 'react-router-dom';

import { BASE_URL } from '../config/api';

const shimmerStyle = {
  backgroundColor: '#f6f7f8',
  backgroundImage: 'linear-gradient(to right, #eeeeee 0%, #dddddd 50%, #eeeeee 100%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
};

const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

function getRandomLightColor() {
  const letters = '89ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

const LoanList = () => {
  const [myDate, setMyDate] = useState(new Date());
  const [accounts, setAccounts] = useState([]);
  const [shimmer, setShimmer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('AUID');
    // const uid="A00011"
    if (uid) {
      fetchLoans(uid);
    }
  }, []);

  const fetchLoans = async (uid) => {
    setShimmer(true);
    try {
      const headers = { 'ngrok-skip-browser-warning': 'true' };
      const timeout = 30000;
      
      const [loansRes, membersRes, agentsRes] = await Promise.all([
        axios.get(`${BASE_URL}/loans`, { headers, timeout }).catch((err) => {
          console.error('Loans fetch error', err);
          return { data: [] };
        }),
        axios.get(`${BASE_URL}/get-members`, { headers, timeout }).catch((err) => {
          console.error('Members fetch error', err);
          return { data: [] };
        }),
        axios.get(`${BASE_URL}/agents`, { headers, timeout }).catch((err) => {
          console.error('Agents fetch error', err);
          return { data: [] };
        })
      ]);

      let loansList = Array.isArray(loansRes.data) ? loansRes.data : loansRes.data?.data || Object.values(loansRes.data || {});
      const membersList = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data?.data || [];
      const agentsData = Array.isArray(agentsRes.data) ? agentsRes.data : agentsRes.data?.data || [];
      const agentsList = Array.isArray(agentsData) ? agentsData : agentsData?.agents || [];

      // 3. Filter strictly for Approved/Active/Disbursed AND where AgentCode matches uid (ignoring case)
      const searchUid = String(uid).trim().toLowerCase();
      const currentAgent = agentsList.find(ag => String(ag.agentCode || ag.AgentCode || '').trim().toLowerCase() === searchUid);
      const currentAgentId = currentAgent ? String(currentAgent._id || currentAgent.id).toLowerCase() : null;

      // 2. Format and map logic
      const formattedLoans = loansList.map((item, idx) => {
        const id = item.loan_id || item.loanId || item._id || item.id || `LOAN-${idx}`;
        const loanNo = item.loanNumber || item.loan_number || item.loanId || item.loan_id || `LN-${idx}`;
        const rawStatus = String(item.status || item.loan_status || item.Status || '').toLowerCase();
        
        const agentCode = String(item.agentCode || item.agent_code || item.createdBy || item.introducer || '').trim();
        const agentId = String(item.agent_id || item.agentId || '').trim().toLowerCase();
        
        // Resolve Member Name
        const mId = String(item.member_id || item.memberId || '').toLowerCase();
        const foundMember = membersList.find(
          (m) => String(m._id || m.id).toLowerCase() === mId || String(m.memberId || m.member_id).toLowerCase() === mId
        );
        const name = (item.FirstName || foundMember?.FirstName) 
          ? `${item.FirstName || foundMember?.FirstName} ${item.LastName || foundMember?.LastName || ''}`.trim()
          : item.memberName || item.MemberName || 'Unknown Member';

        return {
          ...item,
          id,
          // Variables needed by original UI:
          member_name: name,
          account_id: loanNo,
          roi: item.interestRate || item.roi || item.interest_rate || 0,
          frequency: item.requestedTenure || item.loanTenure || item.frequency || item.duration || 0,
          loan_amount: item.loanAmount || item.requestedAmount || item.amount || 0,
          
          // Filtering properties
          status: rawStatus,
          agentCode: agentCode,
          agentId: agentId,
        };
      });

      const strictlyApproved = formattedLoans.filter(loan => {
        const isStatusValid = ['approved', 'active', 'disbursed'].includes(loan.status);
        const isAgentValid = loan.agentCode.toLowerCase() === searchUid || (currentAgentId && loan.agentId === currentAgentId);
        return isStatusValid && isAgentValid;
      });

      setAccounts(strictlyApproved);
      
    } catch (err) {
      console.error('Fetch loans error:', err);
    } finally {
      setShimmer(false);
    }
  };

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: personalLoanAnim,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: 'Arial' }}>
      <style>{shimmerKeyframes}</style>
      <h2 style={{ textAlign: 'center',color: '#b4a383', fontSize: '18px', margin: '20px', position: 'relative' }}>
        
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
        ></i>
            Loan List
     </h2>

      <img
        src="https://www.bankofbaroda.in/-/media/project/bob/countrywebsites/india/personal-banking/loans/other-loans/commission-agents-loan-arthias/spotlight/commission-agents-loan-spotlightbanner.jpg"
        alt="Banner"
        style={{ width: '100%', height: 200, objectFit: 'cover' }}
      />

      <div style={{ padding: 20 }}>
        {accounts.length === 0 && !shimmer ? (
           <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
               No Approved Loans found for this Agent
           </div>
        ) : null}

        {(shimmer ? [1, 2, 3] : accounts).map((item, idx) => (
          <div key={idx} style={{
            border: '1px solid #E3E3E3',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 15
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  backgroundColor: shimmer ? '#eee' : getRandomLightColor(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {shimmer ? null : <Lottie options={lottieOptions} height={50} width={50} />}
                </div>
                <div style={{ paddingLeft: 10 }}>
                  <div style={shimmer ? { ...shimmerStyle, height: 14, width: 100 } : { fontSize: 14, fontWeight: 600 }}>{item?.member_name}</div>
                  <div style={shimmer ? { ...shimmerStyle, height: 10, width: 100 } : { fontSize: 12 }}>{item?.account_id}</div>
                </div>
              </div>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => navigate('/payment', { state: { Data: item, Mydate: myDate } })}
              >
                Payment
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20
            }}>
              {['roi', 'frequency', 'loan_amount'].map((key, i) => (
                <div key={i}>
                  <div style={shimmer ? { ...shimmerStyle, height: 14, width: 80 } : { fontSize: 14, fontWeight: 600 }}>
                    {item ? (key === 'frequency' ? `${item[key]} Months` : item[key]) : ''}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 400 }}>
                    {key === 'roi' ? 'Interest' : key === 'frequency' ? 'Duration' : 'Loan Amount'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanList;
