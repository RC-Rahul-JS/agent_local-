

import React, { useEffect, useState } from "react";
import { database } from "../DB/Firebase";
import { ref, query, orderByChild, equalTo, onValue, off, push, set } from 'firebase/database';
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from "moment";
import UploadFile from "./UploadFile";
import { useLoader } from "../loader/LoaderContext";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../config/api";

const WalletScreen = () => {
  const transactions = [
    { type: "pending", label: "Cash Deposit", date: "Jan 13th 25", amount: -20 },
    { type: "pending", label: "Cash Deposit", date: "Jan 11th 25", amount: -2520 },
    { type: "pending", label: "Cash Deposit", date: "Jan 11th 25", amount: -2520 },
    { type: "receipt", label: "EMI-Receipt 00120500001", date: "Oct 23rd 25", amount: 381 },
    { type: "receipt", label: "EMI-Receipt 00120500001", date: "Oct 23rd 25", amount: 381 },
    { type: "receipt", label: "EMI-Receipt 00120300001", date: "Aug 30th 25", amount: 120 },
    { type: "receipt", label: "EMI-Receipt 00120500001", date: "Aug 20th 25", amount: 120 },
  ];
  const { showLoader, hideLoader } = useLoader();
  
  const [TransitionData, setTransitionData] = useState([])

  const [userdata, setuserdata] = useState({})

  const [showdeposit, setshowdeposit] = useState(false)
  
  // API Pagination States
  const [apiTransactions, setApiTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [walletId, setWalletId] = useState(null);
  
 const [UID, setUID] = useState('')
useEffect(() => {
 setUID(localStorage.getItem("AUID"))
 console.log(localStorage.getItem("AUID"))
}, [])

        const [openlink, setopenlink] = useState(false)

  const generatePDF = async () => {
    // Example HTML content
    const htmlContent = `
      <h1 style="text-align: center;">My PDF Page</h1>
      <p>This is a sample PDF generated from a React Native page.</p>
    `;

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission denied');
          return;
        }
      }

      const options = {
        html: htmlContent,
        fileName: 'example',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated:', file.filePath);
      alert(`PDF saved at: ${file.filePath}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };


   // Simulate getting UID from localStorage (or however you're storing it)
//    useEffect(() => {
//     const value = localStorage.getItem('AUID');
//     if (value) {
//       setUID(value);
//     }
//   }, []);

  useEffect(() => {
    if (!UID) return;

    const fetchWalletDetails = async () => {
      try {
        // First, get the wallet list to find the wallet_id for the current agent
        const listRes = await axios.get(`${BASE_URL}/wallet/list`);
        const wallets = listRes.data?.data || [];
        
        // Find wallet matching the current UID (agentCode)
        const match = wallets.find(w => 
          (w.agentCode || '').toLowerCase() === UID.toLowerCase() ||
          (w.agent_id || '').toLowerCase() === UID.toLowerCase()
        );

        if (match) {
          // Now fetch the exact wallet details
          const detailsRes = await axios.get(`${BASE_URL}/wallet/details?wallet_id=${match._id}`);
          if (detailsRes.data && detailsRes.data.success && detailsRes.data.data?.wallet) {
            const w = detailsRes.data.data.wallet;
            
            // Map the API fields to the old Firebase logic expected by the UI
            const mappedData = {
              ...w,
              Amount: w.creditLimit || 0,
              Balance: w.availableCredit || 0,
              MemberName: w.agentName || w.MemberName || '',
              LoanCode: w.walletNumber || w.LoanCode || '',
              BranchCode: w.branchCode || w.BranchCode || '',
            };
            
            setuserdata(mappedData);
            
            // calculate the allowed deposit amount (Total Limit - Current Balance)
            const calculatedAmount = (mappedData.Amount - mappedData.Balance).toFixed(2);
            setamount(calculatedAmount);
            console.log("Mapped Wallet Data:", mappedData);
            
            // Set wallet ID for transactions API
            setWalletId(match._id);
          }
        } else {
          console.warn('No wallet found for agent:', UID);
        }
      } catch (error) {
        console.error('Error fetching wallet details:', error);
      }
    };

    fetchWalletDetails();
  }, [UID]);
  
  // Fetch paginated transactions from API
  useEffect(() => {
    if (!walletId) return;

    const fetchApiTransactions = async () => {
      try {
        // showLoader();
        const res = await axios.get(`${BASE_URL}/wallet/transactions?wallet_id=${walletId}&page=${currentPage}&limit=10`);
        if (res.data && res.data.success) {
           setApiTransactions(res.data.data || []);
           // If backend returns total_pages use it, otherwise use total_count if available
           const calcPages = res.data.total_pages || Math.ceil((res.data.total_count || 1) / 10) || 1;
           setTotalPages(calcPages);
        }
      } catch (err) {
        console.error('Error fetching API transactions:', err);
      } finally {
        // hideLoader();
      }
    };

    fetchApiTransactions();
  }, [walletId, currentPage]);
  
  useEffect(() => {
    if (!userdata?.LoanCode) return;

    const q = query(
      ref(database, '/loan/loanstatement/'),
      orderByChild('AccountNumber'),
      equalTo(userdata.LoanCode)
    );

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data);
        setTransitionData(list);
        console.log(list);
      }
    };

    onValue(q, handleData);

    // Cleanup listener on unmount or dependency change
    return () => off(q, 'value', handleData);
  }, [userdata, setTransitionData]);



const [Pendingreq, setPendingreq] = useState([])
useEffect(() => {
    if (!UID) return;

    const q = query(
      ref(database, '/Requests/Agentdeposit/'),
      orderByChild('agentid'),
      equalTo(UID)
    );

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const filtered = Object.values(data).filter(item => item.status === 'pending');
        setPendingreq(filtered);
        // console.log(filtered);
      }
    };

    onValue(q, handleData);

    // Cleanup listener
    return () => off(q, 'value', handleData);
  }, [UID, setPendingreq]);



const [amount, setamount] = useState('')
const [proofurl, setproofurl] = useState(null)

const [loaderreq, setloaderreq] = useState(false)
const [bankledger, setbankledger] = useState('')

// const requestpost=async()=>{

// if (proofurl&&amount>0&&amount<=(userdata.Amount-userdata.Balance)) {
// setloaderreq(true)
//   const mykey = database().ref('/Requests/Agentdeposit/').push().key
//   let img=await UploadDoc(proofurl,mykey)

//     database()
//     .ref('/Requests/Agentdeposit/'+mykey)
//     .update({
//       date : moment(new Date()).format('yyyy-MM-DD'),
//       amount : amount,
//       agentid : UID,
//       account : userdata.LoanCode,
//       agentname : userdata.MemberName,
//       key : mykey,
//       status : 'pending',
//       url : img,
//       bankledger : bankledger,
//       branchcode : userdata.BranchCode
//     })
  
//   .then(async() => {setshowdeposit(false);setproofurl(null);setloaderreq(false)});
// }}

const requestpost = async () => {
  showLoader()
    try {
      if (
        proofurl &&
        amount > 0 &&
        amount <= (userdata.Amount - userdata.Balance)
      ) {
        setloaderreq(true);
        const newRef = push(ref(database, '/Requests/Agentdeposit/'));
        const mykey = newRef.key;
        await set(newRef, {
          date: moment().format('YYYY-MM-DD'),
          amount: amount,
          agentid: UID,
          account: userdata.LoanCode,
          agentname: userdata.MemberName,
          key: mykey,
          status: 'pending',
          url: proofurl,
          bankledger: bankledger,
          branchcode: userdata.BranchCode,
        });
  
        setshowdeposit(false);
        setproofurl(null);
        setloaderreq(false);
        setopenlink(false)
        toast.success("Successful")
      }
    } catch (error) {
      console.error('Error during request post:', error);
      setloaderreq(false);
    }finally{
      hideLoader()
    }
  };

const UploadDoc = async (file, user) => {
    try {
      const storage = getStorage(); // Make sure Firebase is initialized properly
      const storageRef = sref(storage, `Agent-req-doc/${user}`);
  
      // Upload the file (file is a Blob or File object)
      await uploadBytes(storageRef, file);
  
      // Get the file's download URL
      const url = await getDownloadURL(storageRef);
  
      console.log(url);
      return url;
    } catch (error) {
      console.error('File upload failed:', error);
      return null;
    }
  };

  const [lData, setlData] = useState([])
const getData = async()=>{

        const api = 'https://api.duniyamart.duniyape.in/get-ledger/I89nD59Ra69j0ee512TsW143eEt03u'
        try{
          const res = await axios.get(api);
          if(res){
            setlData(Object.values(res.data));
            console.log(Object.values(res.data));
          }
          
        }catch(error){
          console.log(error);
        }
      }
    
      useEffect(() => {
          getData();
        }, [])

 

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.profileRow}>
          {userdata.MemberName&&<div style={styles.avatar}>{userdata.MemberName.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</div>}
          <div style={styles.userInfo}>
            <div><strong>{userdata.MemberName}</strong></div>
            <div>{userdata.LoanCode}</div>
          </div>
        </div>
        <div style={styles.balanceRow}>
          Current Balance: <span style={styles.balanceValue}>₹{userdata.Balance}</span>
        </div>
        <div style={styles.limitText}>Total Limit: ₹{userdata.Amount}</div>
        <button onClick={()=>setopenlink(true)} style={styles.depositBtn}>Bank Deposit</button>
      </div>

      {/* Title for Transactions */}
      <h3 style={{marginTop: 0, marginBottom: '15px', color: '#514579'}}>Wallet Transactions</h3>

      {/* NEW MONGODB API TRANSACTIONS WITH PAGINATION */}
      {apiTransactions.map((item, index) => (
        <div key={`api-${index}`} style={{...styles.transaction, backgroundColor:'#F5F1E7'}}>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{display:'grid',placeItems:'center',background:'white',borderRadius:"50%",width:30,height:30,marginRight:10}}>
                    <span style={{fontSize: 20,fontWeight:"bold",color:item.type==='withdraw'?'red':'green' }}>
                        {item.type==='withdraw' ? "↑" : "↓"}
                    </span>
                </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <span style={{textTransform: 'capitalize', fontWeight: 'bold'}}>{item.type} {item.status ? `( ${item.status} )` : ''}</span>
              <div style={{ fontSize: 12 }}>{item.created_at ? moment(item.created_at).format("MMM Do YY, h:mm a") : ''}</div>
            </div>
            </div>
          </div>
          <div style={{ fontWeight: "bold",color:item.type==='withdraw'?'red':'green'}}>
            {item.type==='withdraw'?'-':'+'}{item.amount ? item.amount : 0}
          </div>
        </div>
      ))}

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #ccc', marginBottom: '15px'}}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            style={{...styles.depositBtn, marginTop: 0, opacity: currentPage === 1 ? 0.5 : 1}}
          >
            Prev
          </button>
          <span style={{fontWeight: 'bold'}}>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            style={{...styles.depositBtn, marginTop: 0, opacity: currentPage === totalPages ? 0.5 : 1}}
          >
            Next
          </button>
        </div>
      )}

      {Pendingreq.sort((a, b) => moment(b.date).format('YYYYMMDDhhmm') - moment(a.date).format('YYYYMMDDhhmm')).map((item, index) => (
        <div
          key={index}
          style={{
            ...styles.transaction,
            backgroundColor:'#F5F1E7',
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{display:'grid',placeItems:'center',background:'white',borderRadius:"50%",width:30,height:30,marginRight:10}}>
                    <span style={{fontSize: 20,fontWeight:"bold",color:item.Dr==='0'?'green':'#918405' }}>
                        {item.Dr==='0' ? "↓" : "↑"}
                    </span>
                </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <span>{'Cash Deposit ( Pending )'}</span>
              <div style={{ fontSize: 12 }}>{moment(item.date).format("MMM Do YY")}</div>
            </div>
            </div>
          </div>
          <div style={{ fontWeight: "bold",color:'#918405' }}>
          {'-'}{item.amount}
          </div>
        </div>
      ))}
      {TransitionData.sort((a, b) => moment(b.date).format('YYYYMMDDhhmm') - moment(a.date).format('YYYYMMDDhhmm')).map((item, index) => (
        <div
          key={index}
          style={{
            ...styles.transaction,
            backgroundColor:'#F5F1E7',
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{display:'grid',placeItems:'center',background:'white',borderRadius:"50%",width:30,height:30,marginRight:10}}>
                    <span style={{fontSize: 20,fontWeight:"bold",color:item.Dr!=='0'?'green':'red' }}>
                        {item.Dr!=='0' ? "↓" : "↑"}
                    </span>
                </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <span>{item.Dr!=='0'?`${item.PaymentMode==='Membership fee'?"Membership Fee "+`${item.ChequeBankNo==='xxx'?"":item.ChequeBankNo}`:'EMI-Receipt ' +`${item.ChequeBankNo==='xxx'?"":item.ChequeBankNo}`}`:'Cash Deposit'}</span>
              <div style={{ fontSize: 12 }}>{moment(item.date).format("MMM Do YY")}</div>
            </div>
            </div>
          </div>
          <div style={{ fontWeight: "bold",color:item.Dr!=='0'?'green':'red'}}>
            {item.Dr!=='0'?'+':'-'}{item.Dr==='0'?item.Cr:item.Dr}
          </div>
        </div>
      ))}

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
              type="number"
              value={amount}
              onChange={(e)=>setamount(e.target.value)}
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
              onClick={requestpost}
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
              Deposit
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px',marginBottom:16 }}>
          <div style={formItem}>
            <label style={labelStyle}>Bank Name</label>
              <select
                value={bankledger}
                onChange={(e) => setbankledger(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select</option>

                {
            lData.filter((item)=> item.GroupName==='Assets-Bank').map((item , index)=>(
              <option key={item.Pushkey} value={item.Pushkey}>{item.LedgerName}</option>
            ))
          }
                {/* {[
                //   {
                //   label:"Punjab Bank of India",
                //   key:'A10'
                // }
                ,{
                  label:"IDFC First Bank",
                  key:'A10'
                },
                // {
                //   label:"State Bank of India",
                //   key:'A10'
                // }
              ].map((opt, i) => (
                  <option key={i} value={opt.key}>{opt.label}</option>
                ))} */}
              </select>
           </div>
          <div style={formItem}>
            <label style={labelStyle}>Bank Name</label>
            <input required
                    type="file"
                    accept="image/*"
                    onChange={async(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        showLoader()
                        let url= await UploadFile(file)
                        setproofurl(url)
                        hideLoader()
                      }
                    }}
                    style={inputStyle}
                  />
           </div>
          </div>

          <div style={{ textAlign: 'center' }}>
              <button
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
              </button>
          </div>
        </div>
      </div>
      </div>}
    </div>
  );
};

export default WalletScreen;

const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      padding: 10,
      maxWidth: 500,
      margin: "0 auto",
    },
    header: {
      backgroundColor: "#EAE3D3",
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
    },
    profileRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: "#746161",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "600",
      fontSize:16
    },
    userInfo: {
      fontSize: 14,
    },
    balanceRow: {
      backgroundColor: "#fff",
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      fontSize: 16,
    },
    balanceValue: {
      color: "green",
      fontWeight: "bold",
    },
    limitText: {
      fontSize: 13,
      marginTop: 10,
    },
    depositBtn: {
      backgroundColor: "#b29c78",
      padding: "8px 16px",
      border: "none",
      borderRadius: 5,
      marginTop: 10,
      cursor: "pointer",
    },
    transaction: {
      backgroundColor: "#EAE3D3",
      marginBottom: 10,
      borderRadius: 8,
      padding: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 14,
    },
  };

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
  
  const formGrid = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  };
  
  const formItem = {
    flex: '1 1 48%',
    minWidth: '250px',
  };
