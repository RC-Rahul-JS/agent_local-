import React, { useState, useEffect } from 'react';
import UploadFile from '../Components/UploadFile';
import moment from 'moment';
import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';
import { database } from '../DB/Firebase';
import { equalTo, get, orderByChild, query, ref } from 'firebase/database';
import { toast } from 'react-toastify';

const ApplyLoan = () => {
  const { showLoader, hideLoader } = useLoader();
    const initialFormData = {
      branch:'',
      memberId: '',
      memberName: '',
      gId: '',
      gName: '',
      loanAmount: '',
      memberAge: '',
      memberType: '',
      loantype: 'Reducing',
      interest: '',
      tenure: '',
      loanName: 'A5',
      orderid:'',
      Doctype:'Aadhar',
      orderValue:''
    };
    
      const [formdata, setformdata] = useState(initialFormData);
      const [loan, setloan] = useState([])

      const [documents, setDocuments] = useState([]); // Manage documents as an array

      const handleAddDocument = async(image) => {
        showLoader()
        let url=await UploadFile(image)
        console.log(url)
        setDocuments((prevDocuments) => [
          ...prevDocuments,
          { id: Date.now(), image:url ,name:formdata.Doctype}, // Unique ID for each document
        ]);
        hideLoader()
        console.log(documents)
      };

  const GetLoan=async()=>{
    showLoader()
    try {
      const res=await axios.get('https://api.duniyamart.duniyape.in/view-loan-product/'+"I89nD59Ra69j0ee512TsW143eEt03u")
      console.log((Object.values(res.data)))
      setloan(Object.values(res.data))
    } catch (error) {
      console.log(error)
    } finally {
      hideLoader()
    }
  }
  const getmemberdata=async()=>{
    showLoader()
    console.log("Getmember data")
  const api = 'https://api.duniyamart.duniyape.in/fatch-member-id-name/'+formdata.memberId+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
    try{
      const res = await axios.get(api);
      if(res.data){
        if(res.data.share){

          setformdata({...formdata,memberName:res.data.FirstName+' '+res.data.LastName, memberAge:res.data.Age, memberType:res.data.MemberCategory,branch:res.data.BranchCode});
        }else{
          toast.warning("Membership Fee Pending")
        }
 
    }else{
        setformdata({...formdata,memberName:'',memberAge:'',memberType:''});
        // setValidationErrors({...validationErrors,'memberId':true}) 
    }
    }catch(error){
      console.error('Error',error);
    }finally{
      hideLoader()
    }
}

const getguarantordata=async()=>{
  showLoader()
  const api = 'https://api.duniyamart.duniyape.in/fatch-member-id-name/'+formdata.gId+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
    try{
      const res = await axios.get(api);
      console.log(res)
      if(res.data){
        setformdata({...formdata,gName:res.data.FirstName+' '+res.data.LastName, gAge:res.data.gAge, gType:res.data.gCategory});
      }else{
        setformdata({...formdata,gName:'', gAge:'', gType:''});
        // setValidationErrors({...validationErrors,"gId":true})    
    }
    }catch(error){
      console.log(error);
    }finally{
      hideLoader()
    }
}

useEffect(() => {
  GetLoan()
}, [])


const state = {
  tableHead: ['Sno.','EMI', 'Principal', 'Interest', 'Amount']
}

const [table, settable] = useState('')

const sadule = () => {
    if(formdata.loanAmount===''||formdata.interest===''||formdata.tenure===""){
        console.log("Not present")
    }

  let P = parseFloat(formdata.loanAmount);
  const R = parseFloat(formdata.interest) / 100 / 12;
  let N = parseFloat(formdata.tenure);
  const T= parseFloat(formdata.tenure);

  let xtable = []
  let array=[]
  let sumInt=0;
  let sumEMI=0;
  let sumAmt=0;
  let B=P;

  let sno = 1

  for(let i=1;i<=T;i++){
    let emi,I,A;
    if(formdata.loantype==="Flat"){
      emi=(P*R*T+P*1)/T
      I=(P*R*T)/T
      A=emi-I
      B=B-A
      sumEMI+=emi
      sumInt+=I
      sumAmt+=A
    array=[...array,{EMI:parseFloat(emi).toFixed(2),Int:parseFloat(I).toFixed(2),Amt:parseFloat(A).toFixed(2),Bal:parseFloat(B).toFixed(0)}];

    xtable = [...xtable,[sno,parseFloat(emi).toFixed(0),parseFloat(I).toFixed(0),parseFloat(A).toFixed(0),parseFloat(P).toFixed(0)]]
    sno++

    }else{
      emi = (P * R * (1 + R) ** N) / (((1 + R) ** N) - 1);
      sumEMI+=emi
      I=P*R
      sumInt+=I
      A=emi-I;  
      P=P-A
      N=N-1;
      sumAmt+=A

    array=[...array,{EMI:parseFloat(emi).toFixed(0),Int:parseFloat(I).toFixed(0),Amt:parseFloat(A).toFixed(0),Bal:parseFloat(P).toFixed(0)}];

    xtable = [...xtable,[sno,parseFloat(emi).toFixed(0),parseFloat(I).toFixed(0),parseFloat(A).toFixed(0),parseFloat(P).toFixed(0)]]
    sno++
    }
  }
  console.log({array,TotalAmt:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0)})
  // console.log([...xtable,['Total -',parseFloat(sumEMI).toFixed(0),parseFloat(sumInt).toFixed(0),parseFloat(sumAmt).toFixed(0),'']])
  settable({array,TotalAmt:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0)})
  // setsanction({Details:array,TotalEMI:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0),TotalAmt:parseFloat(sumAmt).toFixed(0)})
};

const getTData = async () => {
  if (!formdata.loanName || !formdata.loantype || !formdata.tenure) return;
  showLoader()

  const api = `https://api.duniyamart.duniyape.in/get-loan-parameter/Loan/${formdata.loanName}/Month/${formdata.loantype}/I89nD59Ra69j0ee512TsW143eEt03u`;

  console.log("Fetching from:", api);

  try {
    const res = await axios.get(api);

    if (res && res.data) {
      const data = Object.values(res.data);

      const matched = data.find(item =>
        parseInt(formdata.tenure) >= parseInt(item.From) &&
        parseInt(formdata.tenure) <= parseInt(item.To)
      );

      if (matched) {
        setformdata(prev => ({
          ...prev,
          interest: matched.RateofInterest,
          processingfee: matched.ProcessingFee,
          gst: matched.GST
        }));

        console.log("Interest Rate:", matched.RateofInterest);
      } else {
        console.warn("No matching tenure range found.");
      }
    }
  } catch (error) {
    console.error("Failed to fetch loan parameters:", error);
  }finally{
    hideLoader()
  }
};

useEffect(() => {
  getTData();
}, [formdata.loanName, formdata.loantype, formdata.tenure]);  
   
  const getorder = async () => {
    const orderID = parseInt(formdata.orderid);
    if (!orderID) {
      console.warn("Invalid OrderID");
      return;
    }
    const ordersRef = ref(database, "Orders");
    const q = query(ordersRef, orderByChild("OrderID"), equalTo(orderID));
   showLoader()
    try {
      const snapshot = await get(q);
      const orderData = snapshot.val();
      const orderObj = orderData ? Object.values(orderData)[0] : null;

      if (orderObj?.Total) {
        setformdata(prev => ({
          ...prev,
          loanAmount: parseFloat(orderObj.Total).toFixed(2),
          orderValue: parseFloat(orderObj.Total).toFixed(2)
        }));
        console.log("Order Total:", orderObj.Total);
      } else {
        console.warn("Order not found or missing Total");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally{
     hideLoader()
    }
  };


  const Create=async(e)=>{
    e.preventDefault();
    
     if(formdata.loanAmount===''||formdata.interest===''||formdata.tenure===""){
        console.log("Not present")
    }

  let P = parseFloat(formdata.loanAmount);
  const R = parseFloat(formdata.interest) / 100 / 12;
  let N = parseFloat(formdata.tenure);
  const T= parseFloat(formdata.tenure);

  let xtable = []
  let array=[]
  let sumInt=0;
  let sumEMI=0;
  let sumAmt=0;
  let B=P;

  let sno = 1

  for(let i=1;i<=T;i++){
    let emi,I,A;
    if(formdata.loantype==="Flat"){
      emi=(P*R*T+P*1)/T
      I=(P*R*T)/T
      A=emi-I
      B=B-A
      sumEMI+=emi
      sumInt+=I
      sumAmt+=A
    array=[...array,{EMI:parseFloat(emi).toFixed(2),Int:parseFloat(I).toFixed(2),Amt:parseFloat(A).toFixed(2),Bal:parseFloat(B).toFixed(0)}];

    xtable = [...xtable,[sno,parseFloat(emi).toFixed(0),parseFloat(I).toFixed(0),parseFloat(A).toFixed(0),parseFloat(P).toFixed(0)]]
    sno++

    }else{
      emi = (P * R * (1 + R) ** N) / (((1 + R) ** N) - 1);
      sumEMI+=emi
      I=P*R
      sumInt+=I
      A=emi-I;  
      P=P-A
      N=N-1;
      sumAmt+=A

    array=[...array,{EMI:parseFloat(emi).toFixed(0),Int:parseFloat(I).toFixed(0),Amt:parseFloat(A).toFixed(0),Bal:parseFloat(P).toFixed(0)}];

    xtable = [...xtable,[sno,parseFloat(emi).toFixed(0),parseFloat(I).toFixed(0),parseFloat(A).toFixed(0),parseFloat(P).toFixed(0)]]
    sno++
    }
  }
  console.log({array,TotalAmt:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0)})
  // console.log([...xtable,['Total -',parseFloat(sumEMI).toFixed(0),parseFloat(sumInt).toFixed(0),parseFloat(sumAmt).toFixed(0),'']])
  const tableme = {array,TotalAmt:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0)}
    
    showLoader()
    const data={
      Date:moment(new Date()).format('yyyy-MM-DD'),
      BranchCode:formdata.branch,
      ProductType:'Loan',
      PlanDuration:'Month',
      MID:formdata.memberId,
      MemberName:formdata.memberName,
      LoanName:formdata.loanName,
      Age:formdata.memberAge,
      Type:formdata.memberType,
      Purpose:formdata.orderid,
      Principal:formdata.loanAmount,
      ROI:formdata.interest,
      Tenure:formdata.tenure,
      Frequency:12,
      EMI:tableme.array[0].EMI,
      Status:"Pending",
      ProcessingFee:formdata.processingfee,
      GST:formdata.gst,
      InterestType:formdata.loantype,
      orderValue:formdata.orderValue,

      Gurantor:'Gurantor',
      GID:formdata.gId,
      Gname:formdata.gName,
      Gtype:formdata.gType,
      Gage:formdata.gAge,

      IntroCode:localStorage.getItem("AUID"),
      Introducer:localStorage.getItem("Name"),
      Documents:documents,EmpID:'xxxx'
    }
    console.log(data)
   try {
    const res= await axios.post("https://api.duniyamart.duniyape.in/create-loan-application/"+"I89nD59Ra69j0ee512TsW143eEt03u",data)
    console.log(res.data)
    toast.success("Successful")
    setformdata(initialFormData)
    settable('')
   } catch (error) {
    console.log(error)
   }finally{
    hideLoader()
   }
  }

  const [selectedOption, setSelectedOption] = useState("Online");

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

    return (
        <div style={container}>
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
            onClick={() => window.history.back()} // Or use your custom navigate(-1) if using React Router
          ></i>Loan Application
          </h2>
          <form onSubmit={Create}>
          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Member ID</label>
        <input required
          value={formdata.memberId}
          onChange={(e) => setformdata({ ...formdata, memberId: e.target.value })}
          type="text"
          placeholder="Enter member ID"
          style={inputStyle}
        />
      </div>
      <button type='button' onClick={()=>getmemberdata()} style={buttonStyle}>Fetch Member Data</button>

          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Member Name</label>
        <input required
          value={formdata.memberName}
          // onChange={(e) => setformdata({ ...formdata, memberName: e.target.value })}
          type="text"
          placeholder="Member Name"
          style={inputStyle}
        />
      </div>

          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Gurantor ID</label>
        <input required
          value={formdata.gId}
          onChange={(e) => setformdata({ ...formdata, gId: e.target.value })}
          type="text"
          placeholder="Enter gurantor ID"
          style={inputStyle}
        />
      </div>
      <button type='button' onClick={()=>getguarantordata()} style={buttonStyle}>Fetch Gurantor Data</button>
          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Gurantor Name</label>
        <input required
          value={formdata.gName}
          // onChange={(e) => setformdata({ ...formdata, gName: e.target.value })}
          type="text"
          placeholder="Gurantor Name"
          style={inputStyle}
        />
      </div>

      <div  style={formItem}>
                <label style={labelStyle}>Loan Name</label>
                  <select required
                    value={formdata.loanName}
                    // onChange={(e) => setformdata({ ...formdata, loanName: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    {loan.map((opt, i) => (
                      <option key={i} value={opt.Code}>{opt.Product}</option>
                    ))}
                  </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Order Type</label>

      <label>
        <input
          type="radio"
          value="Online"
          checked={selectedOption === "Online"}
          onChange={handleChange}
          style={{marginRight:5}}
        />
        Online
      </label>

      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          value="Offline"
          checked={selectedOption === "Offline"}
          onChange={handleChange}
          style={{marginRight:5}}
        />
        Offline
      </label>
            </div>

         { selectedOption==='Online'&&<>
          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Order ID</label>
        <input required
          value={formdata.orderid}
          onChange={(e) => setformdata({ ...formdata, orderid: e.target.value })}
          type="text"
          placeholder="Enter order ID"
          style={inputStyle}
        />
      </div>
      <button type='button' onClick={()=>getorder()} style={buttonStyle}>Fetch Amount</button>
      </>}

      

     {  selectedOption==='Online'?   <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Loan Amount</label>
        <input required
          value={formdata.loanAmount}
          // onChange={(e) => setformdata({ ...formdata, loanAmount: e.target.value })}
          type="number"
          placeholder="Amount"
          style={inputStyle}
        />
      </div>:<>

<div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Order Value</label>
        <input required
          value={formdata.orderValue}
          onChange={(e) => setformdata({ ...formdata, orderValue: e.target.value })}
          type="number"
          placeholder="Amount"
          style={inputStyle}
        />
      </div>

          <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Loan Amount</label>
        <input required
          value={formdata.loanAmount}
          onChange={(e) => setformdata({ ...formdata, loanAmount: e.target.value })}
          type="number"
          placeholder="Amount"
          style={inputStyle}
        />
      </div></>}

      <div  style={formItem}>
                <label style={labelStyle}>Interest Type</label>
                  <select required
                    value={formdata.loantype}
                    onChange={(e) => setformdata({ ...formdata, loantype: e.target.value })}
                    style={inputStyle}
                  >
                    <option >Flat</option>
                    <option >Reducing</option>
                      
                  </select>
          </div>


      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Tenure</label>
        <input required
          value={formdata.tenure}
          onChange={(e) => setformdata({ ...formdata, tenure: e.target.value })}
          type="number"
          placeholder="Tenure"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>ROI(%)</label>
        <input required
          value={formdata.interest}
          onChange={(e) => setformdata({ ...formdata, interest: e.target.value })}
          type="number"
          placeholder="ROI"
          style={inputStyle}
        />
      </div>
      {/* <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>EMI</label>
        <input required
          value={formdata.introducerid}
          onChange={(e) => setformdata({ ...formdata, introducerid: e.target.value })}
          type="text"
          placeholder="Enter member ID"
          style={inputStyle}
        />
      </div> */}
          <button type='button' onClick={sadule} style={buttonStyle}>View Schedule</button>
{table&&<table style={{width:'100%',borderCollapse:'collapse',background:"#eeeeee6b"}}>
      <thead>
        <tr style={{background:"#d4d4d4"}}>
        {state.tableHead.map(item=>(<th key={item} style={{padding:5}}>{item}</th>))}
        </tr>
      </thead>
      <tbody style={{textAlign:"center"}}>
        {table.array&&table.array.map((item,index)=>(<tr key={index}>
          <td style={{padding:5}}>{index+1}</td>
          <td style={{padding:5}}>{item.EMI}</td>
          <td style={{padding:5}}>{item.Amt}</td>
          <td style={{padding:5}}>{item.Int}</td>
          <td style={{padding:5}}>{item.Bal}</td>
        </tr>))}
        <tr style={{background:"#d4d4d4"}}>
          <td style={{padding:5}}>Total</td>
          <td style={{padding:5}}></td>
          <td style={{padding:5}}>{table.TotalAmt}</td>
          <td style={{padding:5}}>{table.TotalInt}</td>
          <td style={{padding:5}}></td>
        </tr>

      </tbody>
    </table>}


      <div  style={formItem}>
                <label style={labelStyle}>Document Type</label>
                  <select required
                    value={formdata.Doctype}
                    onChange={(e) => setformdata({ ...formdata, Doctype: e.target.value })}
                    style={inputStyle}
                  >
                    <option >Aadhar</option>
                    <option >Bank Statement</option>
                  </select>
          </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Upload Document</label>
        <input required
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleAddDocument(file)
                      }
                    }}
                    style={inputStyle}
                  />
      </div>

          <button type='submit' style={buttonStyle}>Apply</button>
          </form>
        </div>
      )}

export default ApplyLoan

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