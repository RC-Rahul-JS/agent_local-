  import React, { useState, useEffect, useRef } from 'react';
    import moment from 'moment';
    import axios from 'axios';
    import { database } from '../DB/Firebase';
    import { child, equalTo, get, off, onValue, orderByChild, push, query, ref, update } from 'firebase/database';
    import { useLoader } from '../loader/LoaderContext';
    import { toast } from 'react-toastify';
    import TPIN from "./TPIN";

const Payment = ({show,hide,Data}) => {
    const { showLoader, hideLoader } = useLoader();
    const [formdata, setformdata] = useState({});
    const [selectedId, setSelectedId] = useState('1');
    const [savingAc, setsavingAc] = useState('')
    const [SAmount, setSAmount] = useState('')
    const [verifyTPIN, setverifyTPIN] = useState(false);

    const [waiting, setwaiting] = useState(false)
    const [debitto, setdebitto] = useState("");
    const [Mode, setMode] = useState("");
    const [payment, setpayment] = useState(false);

    useEffect(() => {
        if(show){
            setpayment(true)
        }
    }, [show])
    useEffect(() => {
        if(!payment){
            hide()
        }
    }, [show])

    
    

    const radioButtons=[
        {
            id: '1', // acts as primary key, should be unique and non-empty string
            label: 'Online ( UPI Or Card )',
            value: 'online'
        },
        {
            id: '2',
            label: 'Wallet',
            value: 'wallet'
        },
        {
            id: '4',
            label: 'Saving Account',
            value: 'Saving'
        }
    ]

    useEffect(() => {
        console.log(selectedId)
      }, [selectedId])

      useEffect(() => {
        if(selectedId==="4"){
          // setDebitAssetstype("Fixed Liabilities");
          setdebitto("A1");
          setMode("Saving")
        } else if(selectedId==="1"){
          setdebitto("A10");
          setMode("Bank Transfer")
        } else if(selectedId==="2"){
          setdebitto("A11");
          setMode("Wallet")
        } else{
          setdebitto("");
        }
      }, [selectedId])

      const [UID, setUID] = useState(null)
      const getUID = async () => {
        try {
          const value = localStorage.getItem('AUID');
          if (value !== null) {
            setUID(value)
            console.log(value)
          }else{
          }
        } catch (e) {
         console.log(e)
        }
    };
      useEffect(() => {
        getUID()
      }, []); 
      
      useEffect(() => {
        if (UID) {
          const transitionRef = ref(database, `/Agent/Agents/${UID}`);
    
          const handleValue = (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const savingQuery = query(
                ref(database, '/AccountManager/SavingAccount'),
                orderByChild('MemberID'),
                equalTo(data.mdata.CustomerCode)
              );
    
              get(savingQuery).then((snapshot) => {
                if (snapshot.exists()) {
                  const values = Object.values(snapshot.val());
                  setsavingAc(values[0].Code);
                  setSAmount(values[0].Balance);
                }
              });
            }
          };
    
          onValue(transitionRef, handleValue);
    
          return () => {
            off(transitionRef, 'value', handleValue);
          };
        }
      }, [UID]);

      const [limitAc, setlimitAc] = useState('')
      const [limitbalance, setlimitbalance] = useState(0)

      useEffect(() => {
        if (UID) {
          const creditQuery = query(
            ref(database, '/creditlimit/accounts/'),
            orderByChild('agentid'),
            equalTo(UID)
          );
    
          const handleValue = (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const account = Object.values(data)[0];
              setlimitAc(account.LoanCode);
              setlimitbalance(account.Balance);
              console.log('hello', account);
            }
          };
    
          onValue(creditQuery, handleValue);
    
          return () => {
            off(creditQuery, 'value', handleValue);
          };
        }
      }, [UID]);

      const checkamount=()=>{
        if (selectedId==='2'&&parseFloat(limitbalance)>=parseFloat(Data.Total)) {
          setverifyTPIN(true)
        }else if (selectedId==='4'&&parseFloat(SAmount)>=parseFloat(Data.Total)) {
          Post2()
        }else{
          toast.error("Insufficient Balance")
        }
      }

      const Post2=async()=>{
         setverifyTPIN(false)
        // if (selectedId!=='1') {
          showLoader()
        // }
        console.log("post2")
        const Amt=Data.PDue
        const e={
          LoanAcnumber:Data.Details.LoanCode,
          AccountNumber:selectedId==='2'?limitAc:savingAc, //savingAc,
          date:moment().format('yyyy-MM-DD'),
          Loanledger:Data.Loanledger,
          // Interestledger:"A26",
          InterestLedger:Data.InterestLedger,
          Gst: Data.PenaltyPost.gst,
          GstLedger: "A15",
          Savingledger:debitto,//debitto
          Paneltyledger:"A68",
          OtherPaneltyledger:"A66",
          Chequeledger:"A67",
          Bankledger:"A10",
          Principal:Data.PDue,
          Interest:Data.PenaltyPost.Dr,
          EMI:parseFloat(Amt)+parseFloat(Data.PenaltyPost.Dr),//Amt => Realprincipal
          ChequeBounce:Data.PenaltyPost.Bounce,
          OtherPanalty:Data.PenaltyPost.Other,
          PaneltyInt:Data.PenaltyPost.panelint,
          Total:Data.PenaltyPost.total,
          LPC:Data.PenaltyPost.Late,
          LPCledger:'A74',
          BranchCode:Data.Details.BranchCode,
          PaymentMode: Mode,
          DebitTo : debitto,//debitto
          ChequeNo : '',
          BankName : 'xxx',
          DateOfPayment : moment().format('yyyy-MM-DD'),
          BankRef: 'xxx',EmpID:'',
          StatusType: "Request",
          From:"LOAN"
        }
        // console.log(e)
        try {
          const api="https://api.duniyamart.duniyape.in/loan-panelty-posting/"+"I89nD59Ra69j0ee512TsW143eEt03u"
        const res=await axios.post(api,e)
        console.log(res.data)
        console.log(e)
        // myalart('green',`Posted Successfully ${res.data.VsKey?'Txn -'+res.data.VsKey:" "}`,true);
        // setloading(false)
        Post()
        } catch (error) {
          console.log(error)
        //   setloading(false)
        } finally {
          // hideLoader()
        }
      }
      
      const Post=async()=>{
        // showLoader()
        const p1 = Data.penalty
        const b1 = Data.cheque
        const o1 = Data.other
        const l1 = Data.late
        const IntEditable = Data.Int
        const g1 = Data.gst
        const Amt=Data.PDue
        const Total=Data.Total
        
        const e={
          PrevPrincipal:Amt-Amt, //Amt =>Realprincicpal 
          PrevInt:Data.PrevInt,
          LoanAcnumber:Data.Details.LoanCode,
          AccountNumber:selectedId==='2'?limitAc:savingAc, //savingAc,
          date:moment().format('yyyy-MM-DD'),
          Loanledger:Data.Loanledger,
          // Interestledger:"A26",
          InterestLedger:Data.InterestLedger,
          Gst:g1,
          GstLedger: "A15",
          Savingledger:debitto,//debitto
          Paneltyledger:"A68",
          OtherPaneltyledger:"A66",
          Chequeledger:"A67",
          Bankledger:"A10",
          Principal:Amt,
          Interest:IntEditable,
          EMI:parseFloat(Amt)+parseFloat(IntEditable),
          ChequeBounce:b1,
          OtherPanalty:o1,
          PaneltyInt:p1,
          Total,
          LPC:l1,
          LPCledger:'A74',
          BranchCode:Data.Details.BranchCode,
          PaymentMode: Mode,
          DebitTo :debitto,//debitto
          ChequeNo : '',
          BankName : 'xxx',
          DateOfPayment : moment().format('yyyy-MM-DD'),
          BankRef: 'xxx',EmpID:'',
          StatusType: "Request",
          From:"LOAN"
        }
        // console.log(e)
        try {
          const api="https://api.duniyamart.duniyape.in/loan-account-deposit/"+"I89nD59Ra69j0ee512TsW143eEt03u"
        const res=await axios.post(api,e)
        console.log(res.data)
        console.log(e)
        GstReport(res.data.VsKey)
        // myalart('green',`Deposit Successfully ${res.data.VsKey?'Txn -'+res.data.VsKey:" "}`,true);
        // setloading(false)
        } catch (error) {
          console.log(error)
        } finally {
          // hideLoader()
        }
      
      }

      const GstReport=async(k)=>{
        // showLoader()
        try{
          const response = await axios.get('https://api.duniyamart.duniyape.in/fatch-admin-data/'+"I89nD59Ra69j0ee512TsW143eEt03u");
          console.log(response.data.State)
          const State = response.data.State;
          const Data2 = {
            Name:Data.Details.MemberName,
            Code:Data.Details.MID,
            AcNumber:Data.Details.LoanCode,
            VsKey:k,
            Gst:Data.gst,    
            Date:moment().format('yyyy-MM-DD'),
            Voucher:"Repayment",
            Taxable:Data.Taxable,
            Type:'Service',
            Branch:Data.Details.BranchCode,
            Action:'Gst',// Action:state===State?'Gst':'IGst',
          }
      
          try{
            const response = await axios.post('https://api.duniyamart.duniyape.in/gstreport-service/'+"I89nD59Ra69j0ee512TsW143eEt03u",Data2);
            console.log(response.data,Data2)
            toast.success("Payment Successful")
            setpayment(false)
          // hideLoader()
  
          }catch(error){
            console.log(error);
          }
      
        }catch(error){
          console.log(error);
        }finally{
          hideLoader()
        }
      }
        const [mkey, setmkey] = useState(null)
        const [count, setCount] = useState(0);
        const [paymentstatus, setpaymentstatus] = useState(false)
        const [link, setlink] = useState('')
        const [openlink, setopenlink] = useState(false)

    
        const gan = async () => {
            showLoader()
            try {
              setCount(0);
              console.log(Data,Data.Total)
              // Generate new key
              const newRef = push(ref(database, '/paymentslink/'));
              const mykey = newRef.key;
              setmkey(mykey);
              const share={
                date: new Date().toISOString(),
                amount: Data.Total,
                agentid: UID,
                account: Data.Details.LoanCode,
                key: mykey,
                status: 'pending',
              }
              // Create the payment entry
              await update(ref(database, `/paymentslink/${mykey}`), share);
            
          // Create payment link using backend API
          const res = await axios.post(`https://api.duniyamart.duniyape.in/create_payment_link/${mykey}`, {
            name: Data.Details.MemberName,
            email: "ajeet@gmail.com", // Replace with dynamic email if needed
            mobile: '9131037870',     // Replace with dynamic mobile if needed
            amount: Data.Total*100  // Converting to paisa/cents if needed by backend
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
                    Post2()
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


if (verifyTPIN) return <TPIN verified={()=>Post2()} close={()=>setverifyTPIN(false)} />

else  return (<>
   {/* payment Link */}
{payment&&<div style={{position:"fixed", top: 0, padding: 0,left:0,width:"100%",}}>
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

        {[
            { label: 'Payment Mode', name: 'mode', type:'radio', options:radioButtons},
        ].map((field, idx) => (
            <div key={idx} style={formItem}>
            <label style={labelStyle}>{field.label}</label>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            {field.options.map((opt, i) => (
            <label key={i} style={{ marginBottom: '4px' }}>
                <input
                required
                type="radio"
                name={field.name}
                value={opt.id}
                checked={selectedId === opt.id}
                onChange={(e) =>
                    setSelectedId(e.target.value)
                }
                style={{ marginRight: '6px' }}
                />
                {opt.label}
            </label>
            ))}
        </div>
           
            </div>
        ))}
        
        </div>

        {  selectedId!=='1'?<button type='button' onClick={checkamount} style={buttonStyle}>Pay ₹{Data.Total}/-</button>
        :<button type='button' onClick={()=>gan()} style={buttonStyle}>Generate Link</button>
        }
        <button type='button' onClick={()=>setpayment(false)} style={buttonStyle}>Back</button>
  </div>
</div>
</div>}
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
            {paymentstatus &&  <button
                onClick={() => setopenlink(false)}
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
                Back
              </button>}

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

            {/* {paymentstatus && <p style={{ fontSize: '14px', marginTop: '10px' }}>Wait a few seconds...</p>} */}
          </div>
        </div>
      </div>
      </div>}
</>
  )
}

export default Payment

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
    };

    const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    };

    const buttonStyle = {
    width: '100%',
    backgroundColor: '#2e6de1',
    color: '#fff',
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '16px',
    marginBottom: '20px',
    };


    const formItem = {
    flex: '1 1 48%',
    minWidth: '250px',
    marginBottom:16
    };