    import React, { useState, useEffect, useRef } from 'react';
    import moment from 'moment';
    import axios from 'axios';
    import { useLocation } from 'react-router-dom';
    import { database } from '../DB/Firebase';
    import { child, equalTo, get, off, onValue, orderByChild, push, query, ref, update } from 'firebase/database';
    import { useLoader } from '../loader/LoaderContext';
    import { toast } from 'react-toastify';
    import TPIN from "../Components/TPIN";
    

    const FirstMembershipFee = () => {
        const location = useLocation();
        const { Data } = location.state;

        const mydata = {...Data}

        const initialFormData = {
        date:moment(new Date()).format('yyyy-MM-DD'),
        share:1,
        membershare:0,
        memberName: mydata.FirstName+' '+mydata.LastName,
        EmpID: 'admin',
        memberId:'',
        mode:''
        };
        
        const [formdata, setformdata] = useState(initialFormData);
        const [UID, setUID] = useState('');
        const [sharevalue, setsharevalue] = useState(100);
        const [sharefee, setsharefee] = useState('');
        const [verifyTPIN, setverifyTPIN] = useState(false);
        const { showLoader, hideLoader } = useLoader();
      useEffect(() => {
        setUID(localStorage.getItem("AUID"))
        }, [])
        useEffect(() => {
            const fetchFees = async () => {
              showLoader()
              try {
                const feeRef = ref(database, '/bankingMaster/FeeParameter/Ordinary/');
                const snapshot = await get(feeRef);
        
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  console.log(data);
                  console.log(data.ShareFee);
                  setsharevalue(data.ShareFee);
                  setsharefee(data.AdmissionFee);   
                } else {
                  console.log('Payment data not found.');
                }
              } catch (error) {
                console.error('Error fetching fee data:', error);
              } finally {
                hideLoader()
              }
            };
            fetchFees();
          }, []);



  const [walletAccount, setWalletAccount] = useState('');
  const [walletAmount, setWalletAmount] = useState('0.00');

  useEffect(() => {
    if (!UID) return;


    const q = query(
      ref(database, '/creditlimit/accounts/'),
      orderByChild('agentid'),
      equalTo(UID)
    );

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const firstItem = Object.values(data)[0];
        setWalletAccount(firstItem.LoanCode);
        setWalletAmount(parseFloat(firstItem.Balance).toFixed(2));
        console.log(firstItem.LoanCode);
      }
    });

    return () => {
      off(q); // Detach the listener
    };
  }, [UID]);



  const [gst, setgst] = useState(0.18);
 
  const [totalprice, settotalprice] = useState(0)

  useEffect(() => {
      let val=formdata.share*sharevalue
      // setvalue(val)
    // let cal=parseFloat(sharefee*0.18).toFixed(0)
    let cal=0

      if (sharefee>=1) {
          setgst(cal)
          settotalprice(val*1+sharefee*1+cal*1)
          
      }else{
        settotalprice(val)
      }

  }, [formdata.share,sharefee])


    const [mkey, setmkey] = useState(null)
    const [count, setCount] = useState(0);
    const [paymentstatus, setpaymentstatus] = useState(false)
    const [link, setlink] = useState('')
    const [openlink, setopenlink] = useState(false)

    const gan = async () => {
        showLoader()
        try {
          setCount(0);
      
          // Generate new key
          const newRef = push(ref(database, '/paymentslink/'));
          const mykey = newRef.key;
          setmkey(mykey);
      
          // Create the payment entry
          await update(ref(database, `/paymentslink/${mykey}`), {
            date: new Date().toISOString(),
            amount: totalprice,
            agentid: UID,
            account: mykey,
            key: mykey,
            status: 'pending',
          });
      
          // Create payment link using backend API
          const res = await axios.post(`https://api.duniyamart.duniyape.in/create_payment_link/${mykey}`, {
            name: formdata.memberName,
            email: "ajeet@gmail.com", // Replace with dynamic email if needed
            mobile: mydata.MobileNo,     // Replace with dynamic mobile if needed
            amount: totalprice * 100  // Converting to paisa/cents if needed by backend
          });
      
          console.log(res.data.short_url);
          setlink(res.data.short_url);
          setopenlink(true);
          startTimer()
        } catch (error) {
          console.error('Error generating payment link:', error);
        } finally {
            hideLoader()
        }
      };

      useEffect(() => {
        let timer;
        if (!paymentstatus && count < 20 && link !== '') {
          timer = setTimeout(async () => {
            setCount((prevCount) => prevCount + 1);
      
            try {
              const snapshot = await get(ref(database, `/paymentslink/${mkey}`));
              const data = snapshot.val();
      
              if (data && data.status === 'success') {
                console.log('Payment done.');
                setpaymentstatus(true);
                setCount(60);
                handlesubmit(); // Call your function to proceed after payment
              } else {
                console.log('Payment pending...');
              }
            } catch (error) {
              console.error('Error checking payment status:', error);
            }
          }, 5000); // Poll every 5 seconds
        }
      
        return () => clearTimeout(timer); // Cleanup on unmount or dependency change
      }, [count, link]);

      const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
      const [fill, setFill] = useState(100); // Start with 100% fill
    
    const handlecopy = () => {
        navigator.clipboard.writeText(link).then(() => {
            toast.success('Link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy!');
        });
        };
    

  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeLeft(180);
    setFill(100);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setFill(0);
          setIsRunning(false);
          return 0;
        }
        const newTime = prevTime - 1;
        setFill((newTime / 180) * 100);
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);
    
      // Format time as mm:ss
      const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
      };
      
      const Create=async(memberid)=>{
        showLoader()
          const data={
            BranchCode:'001',
            membercode: memberid,
            date: moment(new Date()).format('yyyy-MM-DD'),
            ledgerName: "A59",
            PaymentMode: formdata.mode!=='Wallet'?"Bank Transfer":"Wallet",
            DebitTo : formdata.mode!=='Wallet'?'A10':'A11',
            ChequeNo : 'xxx',
            BankName : 'xxx',
            DateOfPayment : moment(new Date()).format('yyyy-MM-DD'),
            BankRef: 'xxx',
            Remarks: "Membership fee",EmpID:'agent',
            gst,fee:sharefee,
            sharefee:formdata.share*sharevalue,
            Saccount:walletAccount
          }
  console.log(data)
              axios.post('https://api.duniyamart.duniyape.in/membership-fee/I89nD59Ra69j0ee512TsW143eEt03u',data)
              .then(function (response) {
                console.log(response.data)
                if(response.data.error){
                  setopenlink(false)
                }else{
                  try {
                    let shareno
                    if(parseInt(formdata.membershare)>0){
                     shareno=parseInt(formdata.membershare)+formdata.share
                    }else{
                      shareno=formdata.share
                    }
                    axios.post('https://api.duniyamart.duniyape.in/update-member/I89nD59Ra69j0ee512TsW143eEt03u',{CustomerCode:memberid,share:shareno})
                    .then((res)=>{
                      console.log(res.data)
                      toast.success("Successful")
                      setformdata(initialFormData)
                    })
                  } catch (error) {
                      console.log(error)
                  } finally{
                    setopenlink(false) 
                    hideLoader()
                  }
                
                }
                
              })
              .catch(function (error) {
                  console.log(error);
                  setopenlink(false)
              //     myalart('#DD4444','Internet Error',true);
              //     console.log(data)
              // setloading(false);
              });
          }
          const handlesubmit=async()=>{
          console.log('run')
            setverifyTPIN(false)
             if (parseFloat(totalprice)>parseFloat(walletAmount)&&formdata.mode==="Wallet") {
                            toast.error('Insufficient Balance');
                          }else{
            showLoader()


      

                    // formdata.mode==="Wallet"?Create(res.data.CustomerCode):gan(res.data.CustomerCode)
                    // console.log(formdata.mode)

            const API="https://api.duniyamart.duniyape.in/create-customer/I89nD59Ra69j0ee512TsW143eEt03u";
            try {
              const res=await axios.post(API,mydata);
              
                if (res.data.error) {
 
                } else {
                    console.log(res.data)
     
            
                    setformdata({ ...formdata, memberId:res.data.CustomerCode })

                    Create(res.data.CustomerCode)
                    console.log(formdata.mode)

                    try {
                      const ressendmsg = await axios.get(`https://www.fast2sms.com/dev/bulkV2?authorization=ngqdw3X9hrZx5WHaVPs2CKDUucGzAElSyMvNjFRb6ko8QtJ7p0YQiGgqLolhC8KPWuUbxnmsrVwZc5HS&route=dlt&sender_id=LCLPRI&message=194749&variables_values=${res.data.FirstName}%7C${res.data.CustomerCode}%7C&flash=0&numbers=${res.data.MobileNo}&schedule_time=`);
                      console.log(ressendmsg)
                    } catch (error) {
                      console.log(error)
                    }
                }}
              
             catch (error) {
              console.log(error)

            }
       }
          }

            const handleother=(e)=>{
          e.preventDefault();
              if(formdata.mode==="Wallet"){
setverifyTPIN(true)
              }else{
 gan()
              }
          
          }

        if (verifyTPIN) return <TPIN verified={()=>handlesubmit()} close={()=>setverifyTPIN(false)} />

        return (
            <div style={container}>
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
              onClick={() => window.history.back()} // Or use your custom navigate(-1) if using React Router
            ></i>Membership Fee
            </h2>
            <form onSubmit={handleother}>
        
            {/* <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Member ID</label>
            <input
            required
            value={formdata.memberId}
            onChange={(e) => setformdata({ ...formdata, memberId: e.target.value })}
            type="text"
            placeholder="Enter member ID"
            style={inputStyle}
            />
        </div>
        <button type='button' onClick={()=>getmemberdata()} style={buttonStyle}>Fetch Member Data</button> */}

                {/* Form Fields */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

                {[
                    { label: 'Member Name', name: 'memberName'},
                    { label: 'Shares', name: 'share'},
                    { label: 'Payment Mode', name: 'mode', type:'radio', options:['Online ( UPI or Card )','Wallet']},
                ].map((field, idx) => (
                    <div key={idx} style={formItem}>
                    <label style={labelStyle}>{field.label}</label>
                    {field.type === 'radio' ? (
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                     {field.options.map((opt, i) => (
                       <label key={i} style={{ marginBottom: '4px' }}>
                         <input
                           required
                           type="radio"
                           name={field.name}
                           value={opt}
                           checked={formdata[field.name] === opt}
                           onChange={(e) =>
                             setformdata({ ...formdata, [field.name]: e.target.value })
                           }
                           style={{ marginRight: '6px' }}
                         />
                         {opt}
                       </label>
                     ))}
                   </div>
                    ) : (
                        <input
                        required
                        value={formdata[field.name]}
                        onChange={(e) => field.name==='memberName'?console.log(e.target.value):setformdata({ ...formdata, [field.name]: e.target.value })}
                        type={field.type || 'text'}
                        style={inputStyle}
                        />
                    )}
                    </div>
                ))}
                </div>

<div style={{
  border: "1px solid #b4a383",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "20px",
  backgroundColor: "#faf9f7"
}}>
  <h4 style={{ marginBottom: "12px", color: "#514579" }}>Fee Breakdown</h4>
  
  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
    <span>Shares ({formdata.share} × ₹{sharevalue})</span>
    <span>₹{formdata.share * sharevalue}</span>
  </div>

  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
    <span>Admission Fee</span>
    <span>₹{sharefee}</span>
  </div>

  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
    <span>GST (18%)</span>
    <span>₹{gst}</span>
  </div>

  <hr style={{ margin: "10px 0" }} />

  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#385FBF" }}>
    <span>Total</span>
    <span>₹{totalprice}</span>
  </div>
</div>

          <button 
  type="submit" 
  style={{
    ...buttonStyle, 
    backgroundColor: formdata.share <= 0 ? "#ccc" : "#385FBF", 
    cursor: formdata.share <= 0 ? "not-allowed" : "pointer"
  }} 
  disabled={formdata.share <= 0}
>
  Pay ₹{totalprice}
</button>

            </form>
          
    {openlink&&<div style={{position:"absolute", top: 0, padding: 0,left:0,width:"100%",}}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        
        justifyContent: 'flex-end',
        height: '100vh',
        backgroundColor: '#bfbebe87'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          width: '100%',
          maxWidth: '500px',
          margin: 'auto',
          borderRadius: '10px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={link}
              readOnly
              style={{
                backgroundColor: '#F2F2F2',
                borderRadius: '5px',
                border: '1px solid #000',
                fontSize: '14px',
                color: 'black',
                padding: '8px 20px',
                width: '70%',
                minWidth: '200px'
              }}
            />
            <button
              onClick={handlecopy}
              style={{
                backgroundColor: '#CCC4E6',
                padding: '8px 20px',
                borderRadius: '5px',
                border: '1px solid #514579',
                color: '#514579',
                fontWeight: '700',
                cursor: 'pointer',
                width: '25%',
                minWidth: '100px'
              }}
            >
              Copy
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            {!paymentstatus && <h4 style={{ margin: '10px 0', color: '#000' }}>Waiting for Payment Confirmation</h4>}
            {paymentstatus && <h4 style={{ margin: '10px 0', color: 'green' }}>Payment Done</h4>}

            {!paymentstatus && (
              <div style={{ margin: '10px auto' }}>
                <div style={{ marginTop: '5px', fontSize: '20px',fontWeight:'bold', color: 'red' }}>{formatTime(timeLeft)}</div>
              </div>
            )}

            {!paymentstatus && (
              <button
                onClick={() => {setopenlink(false),stopTimer()}}
                style={{
                  backgroundColor: '#F2E4A8',
                  padding: '8px 20px',
                  borderRadius: '5px',
                  border: '1px solid #857326',
                  color: '#857326',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '20px'
                }}
              >
                Use Other Payment Option
              </button>
            )}

            {paymentstatus && <p style={{ fontSize: '14px', marginTop: '10px' }}>Wait a few seconds...</p>}
          </div>
        </div>
      </div>
      </div>}
    
            </div>
        )}

    export default FirstMembershipFee

    const container = {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
    }

    const labelStyle = {
      display: 'block',
      marginBottom: '6px',
      fontWeight: 'bold',
      color:'#b4a383'
    };
    
    const inputStyle = {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #b4a383',
      onfocus:"#b4a383"
    };
    
    const buttonStyle = {
      width: '100%',
      backgroundColor: '#385FBF',
      color: '#b4a383',
      padding: '10px',
      border: 'none',
      borderRadius: '6px',
      fontWeight: 'bold',
      // fontSize: '16px',
      marginBottom: '20px',
    };
    const formItem = {
      flex: '1 1 48%',
      minWidth: '250px',
      marginBottom:16
    };