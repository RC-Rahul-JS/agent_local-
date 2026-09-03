import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Repayment from '../Components/MRepayment';
import { useLocation } from 'react-router-dom';
import Payment from '../Components/Payment';
import { toast } from 'react-toastify';

const getRandomLightColor = () => {
  const letters = '89ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

const LoanDetails = () => {
  const navigate = useNavigate();

  const [emiData, setEmiData] = useState({});
  const [showpayment, setshowpayment] = useState(false);
  const location = useLocation();
  const { Data, Mydate } = location.state;

  const handleData = (e) => {
    setEmiData(e);
  };

  if (emiData?.Details && !isNaN(parseFloat(emiData.Total))) {
    return (
      <div style={{ width: '100%', backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
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
    onClick={() => navigate(-1)} // Or use your custom navigate(-1) if using React Router
  ></i> Loan Details
      </h2>
        <div style={{ marginBottom: '20px', border: '1px solid #E3E3E3', borderRadius: '15px', padding: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '50px', height: '50px', backgroundColor: getRandomLightColor(), borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                {/* <Lottie animationData={personalLoanAnim} loop autoplay style={{ width: '55px', height: '55px' }} /> */}
                <i className='fa-solid fa-user' style={{fontSize:22}}/>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{emiData.Details.MemberName}</div>
                <div style={{ fontSize: '12px', fontWeight: '400' }}>{Data.account_id}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{emiData.Details.ROI}%</div>
              <div style={{ fontSize: '12px', fontWeight: '400' }}>Interest</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{emiData.Details.Tenure} Months</div>
              <div style={{ fontSize: '12px', fontWeight: '400' }}>Duration</div>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>₹{emiData.Details.Principal}</div>
              <div style={{ fontSize: '12px', fontWeight: '400' }}>Loan Amount</div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid #E3E3E3', borderRadius: '15px', padding: '15px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              {['EMI Date', 'Total Paid Principle', 'Balance Principal', 'Due Principal', 'Due Interest', 'Total Charges'].map((label, i) => (
                <div key={i} style={{ fontSize: '12px', padding: '5px 0' }}>{label}</div>
              ))}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>07/06/2024</div>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>₹{Data.paid_principle}</div>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>₹{Data.principle_unpaid_balance}</div>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>₹{emiData.PDue}</div>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>₹{emiData.Int}</div>
              <div style={{ fontSize: '12px', padding: '5px 0' }}>₹{emiData.penalty + emiData.other + emiData.late + emiData.gst + emiData.cheque}</div>
            </div>
          </div>
          <button
            onClick={() =>{
              emiData.Total>0?setshowpayment(true):toast.error("Zero Amount")
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              borderRadius: '8px',
              border: '1px solid #1474E1',
              color: '#1474E1',
              fontWeight: '700',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Pay ₹{emiData.Total}
          </button>
        </div>

        {Data.statement?.length > 0 ? (
          Data.statement.map((item, idx) => <TransitionView data={item} key={idx} />)
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>Empty Transition</div>
        )}
      <Payment show={showpayment} hide={()=>setshowpayment(false)} Data={emiData} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Repayment data={handleData} ac={Data.account_id} Mydate={Mydate} />
      <div className="loader" style={{ marginLeft: '15px' }}></div>
    </div>
  );
};

const TransitionView = ({ data }) => {
  return (
    <div style={{ backgroundColor: '#F5F1E7', margin: '10px   0px', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '10px', backgroundColor: 'white', borderRadius: '20px', padding: '8px' }}>
          <span style={{ color: data.dr === '0' ? 'green' : 'red' }}>{data.dr === '0' ? '↓' : '↑'}</span>
        </div>
        <div>
          <div style={{ fontSize: '14px', color: 'black' }}>{data.nareshan}</div>
          <div style={{ fontSize: '10px', color: 'black' }}>{moment(data.date).format('MMM Do YY')}</div>
        </div>
      </div>
      <div style={{ color: data.dr === '0' ? 'green' : 'red' }}>{data.dr !== '0' ? '-' + data.dr : '+' + data.cr}</div>
    </div>
  );
};

export default LoanDetails;
