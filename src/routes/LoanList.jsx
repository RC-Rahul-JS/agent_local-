import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import personalLoanAnim from '../Components/personalLoanAnim.json'
import { useNavigate } from 'react-router-dom';

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
  const navigate=useNavigate()

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
      const res = await axios.get(`https://api.duniyamart.duniyape.in/agent-banking-loan-list/${uid}`);
      setAccounts(res.data.accounts);
      console.log(res.data.accounts)
    } catch (err) {
      console.error(err);
    }
    setShimmer(false);
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
          onClick={() => window.history.back()} // Or use your custom navigate(-1) if using React Router
        ></i>
            Loan List
     </h2>

      <img
        src="https://www.bankofbaroda.in/-/media/project/bob/countrywebsites/india/personal-banking/loans/other-loans/commission-agents-loan-arthias/spotlight/commission-agents-loan-spotlightbanner.jpg"
        alt="Banner"
        style={{ width: '100%', height: 200, objectFit: 'cover' }}
      />

      {/* <div style={{ padding: 20 }}>
        <DatePicker
          selected={myDate}
          onChange={(date) => setMyDate(date)}
          inline
        />
      </div> */}

      <div style={{ padding: 20 }}>
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
                  backgroundColor: '#1474E1',
                  color: 'white',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/loandetails', { state: { Data: item, Mydate: myDate } })}
              >
                View Details
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
