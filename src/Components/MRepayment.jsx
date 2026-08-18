import React,{useEffect, useState} from 'react'
import axios from 'axios';
import moment from 'moment';

function Repayment(props) {
  const date = new Date();
  const formattedDate = moment(props.Mydate).format('yyyy-MM-DD');
  // const formattedDate = '2024-10-11';
  const [Ddate, setDdate] = useState(formattedDate);

  const [Amt, setAmt] = useState(0);
  const [Int, setInt] = useState(0);

  const [Late, setLate] = useState(0);
  const [Application, setApplication] = useState(props.ac);
  const [Data, setData] = useState("");
const [Account, setAccount] = useState("");

const [sanction, setsanction] = useState([])
const [LoanP, setLoanP] = useState([]);
const [loan, setloan] = useState([]);
const [array, setarray] = useState([]);
const [Dr, setDr] = useState("")

const [BounceReceive, setBounceReceive] = useState("");
const [OtherReceive, setOtherReceive] = useState("");
const [GSTReceive, setGSTReceive] = useState("");
const [LPCReceive, setLPCReceive] = useState("");
const [IntReceive, setIntReceive] = useState("");
const [PenaltyReceive, setPenaltyReceive] = useState("")
const [ChequeBounceCheck, setChequeBounceCheck] = useState(0)

const [ldata, setlData] = useState([]);

const getData = async()=>{

const api = 'https://api.duniyamart.duniyape.in/get-ledger/'+"I89nD59Ra69j0ee512TsW143eEt03u"
try{
  const res = await axios.get(api);
  if(res){
    setlData(Object.values(res.data));
  }
  
}catch(error){
  console.log(error);
}
}

useEffect(() => {
  getData();
}, [])

  const [OldPrincipal, setOldPrincipal] = useState(0)

  const loanstatmentledger = async()=>{
      const api = 'https://api.duniyamart.duniyape.in/get-loan-statement/'+Application+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
    try{
      const res = await axios.get(api);
      if(res){
        const data=Object.values(res.data)

        let a = 0;
        let b = 0;
        let c = 0;
        for (let i = 0; i < data.length; i++) {
          
          const e = data[i].PaymentMode;
          const first10 = e.slice(0, 13)
          if (first10==="Cheque bounce"||first10==="Cheque Bounce"){

            const e = data[i].PaymentMode;
            const first = e.slice(0, 21)

            if (first==="Cheque Bounce Charges"&&data[i].Cr==="0") {

              b = b +1
            }else if (first==="Cheque Bounce Charges"&&data[i].Dr==="0") {
              b = b -1
            }else{
              a = a+1

            }
          }
        }
        c = a-b
        if (c>0) {
          setChequeBounceCheck(c)
          
        } else {
          setChequeBounceCheck(0)

        }
      }
      
    }catch(error){
      console.log(error);
    }
    
  }


  const gData = async()=>{

    loanstatmentledger();
    const api = 'https://api.duniyamart.duniyape.in/get-loan-account/'+ Application+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
    try{
      const res = await axios.get(api);
      if(res){
          // console.log(res.data)
          setData(res.data)
          setOldPrincipal(res.data.PrevPrincipal?res.data.PrevPrincipal:0)
      }
       if(!res.data){
       setData("")
      }
      
    }catch(error){
      console.log(error);
  
      setData("")
    }
  }


  const GetLoan=async()=>{
    try {
      const res=await axios.get('https://api.duniyamart.duniyape.in/view-loan-product/'+"I89nD59Ra69j0ee512TsW143eEt03u")
      // console.log((Object.values(res.data)))
      setloan(Object.values(res.data))
    } catch (error) {
      console.log(error)
    }
   
  }
  useEffect(()=>{
    GetLoan()
    gData()
  },[])


    const EMI = () => {
      let P = Data.Principal;
      const R = Data.ROI / 100 / Data.Frequency;
      let N = Data.Tenure;
      const T=Data.Tenure;

      let array=[]
      let sumInt=0;
      let sumEMI=0;
      let sumAmt=0;
      let B=P;
      for(let i=1;i<=T;i++){
        let emi,I,A;
        if(Data.InterestType==="Flat"){
          emi=(P*R*T+P*1)/T
          I=(P*R*T)/T
          A=emi-I
          B=B-A
          sumEMI+=emi
          sumInt+=I
          sumAmt+=A
        array=[...array,{EMI:parseFloat(emi).toFixed(0),Int:parseFloat(I).toFixed(0),Amt:parseFloat(A).toFixed(0),Bal:parseFloat(B).toFixed(0)}];

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

        }
      }
      // console.log({array,TotalAmt:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0)})
      setsanction({Details:array,TotalEMI:parseFloat(sumEMI).toFixed(0),TotalInt:parseFloat(sumInt).toFixed(0),TotalAmt:parseFloat(sumAmt).toFixed(0)})
    };

const getTData = async()=>{
const api = 'https://api.duniyamart.duniyape.in'+'/get-loan-parameter/'+Data.ProductType+'/'+Data.LoanName+'/'+Data.PlanDuration+'/'+Data.InterestType+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
try{
const res = await axios.get(api);
if(res){
  const data=Object.values(res.data)
  const filter=data.filter(item=>item.RateofInterest===Data.ROI)
  setLoanP(filter)
}

}catch(error){
console.log(error);
}
}
const getACData = async(id)=>{
const api = 'https://api.duniyamart.duniyape.in'+'/get-all-accouts-system/'+id+'/'+"I89nD59Ra69j0ee512TsW143eEt03u"
try{
  const res = await axios.get(api);
  if (res) {
    const data = Object.values(res.data);
    const savingAccount = data.find(item => item.AccountName === "Saving Account");
    if (savingAccount) {
      setAccount(savingAccount.Code);
    } else {
      console.log("Saving Account Not Found");
      setAccount(1000000000);

    }
  }
}catch(error){
    console.log(error);
}
}

useEffect(() => {
if (Data) {
EMI()
getTData()
getACData(Data.MID)
}
}, [Data])


const Due=(e)=>{
  let iduration=0
if(!Data.Amount){
iduration=  parseFloat(Data.EMI)/parseFloat(Data.EMI)

}else{
iduration =  (parseFloat(Data.Amount)+parseFloat(Data.EMI))/parseFloat(Data.EMI)
}

          iduration = parseFloat(iduration).toFixed(0)*1
          const today = new Date(Data.Date);
          const newMonth = today.getMonth() + iduration;
          const nextdate = new Date(today.getFullYear(), newMonth, today.getDate());

          const newArray = [];
          let aduration,ndeo;

          for (let i = 0; i < parseInt(Data.Tenure)+1; i++) {
            const today = new Date(nextdate);
            const newMonth = today.getMonth() + i;
            const newDate = new Date(today.getFullYear(), newMonth, today.getDate());
            newArray.push(moment(newDate).format('yyyy-MM-DD'));
          }

          // console.log(newArray);
          const value = new Date(Ddate);
          // console.log(newArray)
          for (let i = 0; i < (newArray.length); i++) {
            const date1 = new Date(newArray[i]);
            const date2 = new Date(newArray[i+1]);
    
            if (date1 <= value && date2>= value) {

              let amount = 0;
              let interest = 0;
              try {
                for (let s = iduration; s < (i+1+iduration); s++) {
                  amount = amount+parseFloat(e[s-1].Amt)
              }
              } catch (error) {
                console.log("kaise")
                
              }
              setAmt(parseFloat(amount)+parseFloat(OldPrincipal))
              setInt(parseFloat(interest))
              aduration = Data.EMI*(i+1)
              ndeo = i+1
            } else {
    
            }
          }
          penalty(newArray)
          setarray(newArray)

}

useEffect(() => {
  if (LoanP.length>0) {
    Due(sanction.Details);
  }
  }, [LoanP,Int,Late,Dr])
  


// dyss code

const [panelint, setpanelint] = useState(0);
const [Bounce, setBounce] = useState(0);
const [Other, setOther] = useState(0);

const penalty = (newArray)=>{

const principal = parseFloat(Dr)+parseFloat(Amt) +parseFloat(Bounce)+parseFloat(Other)+parseFloat(Late)
//   console.log(principal)

const ROI = Data.ROI

//   console.log(ROI)

let dyss,total;
dyss = 0;
total = 0;


const dates = [];
let currentDate = moment(newArray[0]);
while (currentDate.isBefore(Ddate)) {
  dates.push(currentDate.format('YYYY-MM-DD'));
  currentDate = currentDate.add(1, 'day');
}
for (let i = 0; i < dates.length; i++) {

  const filteredItems = newArray.filter((item) => {
    return item.includes(dates[i]);
  });


  if (filteredItems.length===0){

  }else{
    dyss = dyss+1
    
  }
  const ok = (((principal*dyss)*ROI)/100)/365
  total = total+ok
  // console.log(total)
}
//   console.log(LoanP[0])
console.log(parseFloat(total).toFixed(0),'first')
setpanelint(parseFloat(total).toFixed(0))
setOther(dyss*LoanP[0].OtherPenalty)
setBounce(LoanP[0].BounceCharge*ChequeBounceCheck)
setLate(dyss*LoanP[0].LPC)
}


const Getinterest=async()=>{
  try {
    const res= await axios.get("https://api.duniyamart.duniyape.in/get-posting-loan-account/"+"I89nD59Ra69j0ee512TsW143eEt03u")
    const data=Object.values(res.data)
  //   console.log(data.filter(item=>item.AccountNumber===Application&&moment(item.date).format('yyyyMMDD')<=moment(Ddate).format('yyyyMMDD')))
    const f=data.filter(item=>item.AccountNumber===Application&&moment(item.date).format('yyyyMMDD')<=moment(Ddate).format('yyyyMMDD'))
    let sumDr=0;
    let sumCr=0;
    for(let i=0;i<f.length;i++){
      sumDr+=f[i].Dr*1
      sumCr+=f[i].Cr*1
    }
    setDr(sumDr-sumCr)

    let last=f.filter(item=>item.Dr!=="0")
    // let lastdate=last[last.length-1].date
  } catch (error) {
    console.log(error)
  }
}
useEffect(()=>{
if (Application.length>=11) {
  Getinterest()
}

},[Application,Ddate])

// dont delete becouse i am not sure

// useEffect(() => {
//   const principal = parseFloat(Dr)+parseFloat(Bounce)+parseFloat(Other)+Late*1
//   const ROI = Data.ROI
//   let dyss,total;
//   dyss = 0;
//   total = 0;
//   const dates = [];
//   let currentDate = moment(array[0]);
//   while (currentDate.isBefore(Ddate)) {
//     dates.push(currentDate.format('YYYY-MM-DD'));
//     currentDate = currentDate.add(1, 'day');
//   }
//   for (let i = 0; i < dates.length; i++) {

//     const filteredItems = array.filter((item) => {
//       return item.includes(dates[i]);
//     });
//     if (filteredItems.length===0){
//     }else{
//       dyss = dyss+1
    
//     }
//     const ok = (((principal*dyss)*ROI)/100)/365
//     total = total+ok
//     console.log(total)
//   }
//   console.log("day",dyss)
//   setpanelint(parseFloat(total).toFixed(0))
//   console.log(parseFloat(total).toFixed(0),'secend')
// }, [Other,Bounce,Late,Ddate])

const getApiData = async(Ledger)=>{

const api = 'https://api.duniyamart.duniyape.in/get-ledgerbooks-by-name/'+Ledger+"/"+"I89nD59Ra69j0ee512TsW143eEt03u"
try{
  const res = await axios.get(api);
  if(res){
   let data=Object.values(res.data);
   const sortedItems = data.sort((a, b) => new Date(a.date) - new Date(b.date));
   let f=sortedItems.filter(item=>item.AccountNumber===Application&&moment(item.date).format('yyyyMMDD')<=moment(Ddate).format('yyyyMMDD'))

   let sumDr=0;
  let sumCr=0;
    for(let i=0;i<f.length;i++){
      sumDr+=f[i].Dr*1
      sumCr+=f[i].Cr*1
    }

return sumDr-sumCr
  }
  
}catch(error){
  console.log(error);

}
}
useEffect(() => {
if(ldata.length>0&&loan.length>0&&Data){ const xcode=ldata.filter(item=>item.GroupName==="Asset-Current Asset");
const l=loan.filter(item=>item.Code===Data.LoanName)[0].Product
const x=xcode.filter(item=>item.LedgerName===`Interest Receivable on ${l}`)[0].Pushkey
const get=async()=>{

  let a=await getApiData('A67')
  let b=await getApiData('A66')
  let c=await getApiData('A73')
  let d=await getApiData('A75')
  let e=await getApiData(x)
  let f=await getApiData('A68')
  setBounceReceive(a)
  setOtherReceive(b)
  setGSTReceive(c)
  setLPCReceive(d)
  setIntReceive(e)
  setPenaltyReceive(f)
  }
  get()
}

}, [ldata,loan,Data])

useEffect(() => {
 // Loan Interest Ledger
 const xcode = ldata.filter(item => item.GroupName === "Asset-Current Asset");
 const l = loan.find(item => item.Code === Data.LoanName)?.Product ?? "";
 const x = xcode.find(item => item.LedgerName === `Interest Receivable on ${l}`)?.Pushkey ?? "";
 // console.log(x)
 // Loan Ledger
 const loanname = loan.find(item => item.Code === Data.LoanName)?.Product ?? "";
 const code = ldata.find(item => item.LedgerName === loanname)?.Pushkey ?? "";
 
 // console.log(code)
  console.log(panelint)
const p1 = parseFloat(PenaltyReceive)+parseFloat(panelint)
const b1 = parseFloat(BounceReceive)+parseFloat(Bounce)
const o1 = parseFloat(OtherReceive)+parseFloat(Other)
const l1 = parseFloat(LPCReceive)+parseFloat(Late)
const IntEditable = parseFloat(Dr)
const t1=parseFloat(Late)+parseFloat(Other)+parseFloat(Bounce)+parseFloat(panelint)
const gst=(((Late*1+parseFloat(Bounce)+parseFloat(Other)+parseFloat(panelint))*18)/100).toFixed(0)*1
const g1 = (((Late*1+parseFloat(Bounce)+parseFloat(Other)+parseFloat(panelint))*18)/100).toFixed(0)*1+parseFloat(GSTReceive)
  props.data({Details:Data,
    PenaltyPost:{
      Dr,Late,panelint,Bounce,Other,gst,
      total:Late*1+parseFloat(panelint)+parseFloat(Amt)+parseFloat(Dr)+parseFloat(Bounce)+parseFloat(Other)+gst*1,
    },
    SAccount:Account,
    PBal:sanction.TotalAmt-Data.PaidPrincipal,
    PDue:Amt,
    Int:IntEditable,
    cheque:b1,
    other:o1,
    late:l1,
    penalty:p1,
    gst:g1,
    Taxable:t1,
    Loanledger:code,
    InterestLedger:x,
    PrevInt:IntReceive-IntEditable,
    Total:g1*1+(l1*1+parseFloat(b1)+parseFloat(o1)+parseFloat(p1))+parseFloat(IntEditable)+parseFloat(Amt)
})
console.log({Details:Data,
    PenaltyPost:{
      Dr,Late,panelint,Bounce,Other,gst,
      total:Late*1+parseFloat(panelint)+parseFloat(Amt)+parseFloat(Dr)+parseFloat(Bounce)+parseFloat(Other)+gst*1,
    },
    SAccount:Account,
    PBal:sanction.TotalAmt-Data.PaidPrincipal,
    PDue:Amt,
    Int:IntEditable,
    cheque:b1,
    other:o1,
    late:l1,
    penalty:p1,
    gst:g1,
    Taxable:t1,
    Loanledger:code,
    InterestLedger:x,
    PrevInt:IntReceive-IntEditable,
    Total:g1*1+(l1*1+parseFloat(b1)+parseFloat(o1)+parseFloat(p1))+parseFloat(IntEditable)+parseFloat(Amt)
})
}, [PenaltyReceive])

return (
    <></>
)
 
}

export default Repayment