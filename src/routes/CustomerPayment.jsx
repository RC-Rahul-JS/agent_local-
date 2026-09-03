import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useLoader } from '../loader/LoaderContext'; 
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://192.168.29.39:5001/badri_enterprises/localprime';

const loanService = {
  receiveCustomerPayment: async (payload) => {
    const res = await axios.post(`${BASE_URL}/customer-payment`, payload, {
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
    });
    return res.data;
  }
};

const toast = {
  success: (msg) => Swal.fire({ icon: 'success', title: 'Success', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
  error: (msg) => Swal.fire({ icon: 'error', title: 'Error', text: msg, toast: true, position: 'top-end', showConfirmButton: false, timer: 4000, timerProgressBar: true }),
};

const AllocRow = ({ label, value, color = '#666' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: '1px dashed #eee' }}>
    <span style={{ color: '#777' }}>{label}</span>
    <span style={{ fontWeight: 'bold', color: color }}>₹{(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
  </div>
);

const CustomerPayment = () => {
  const loaderCtx = useLoader();
  const showLoader = loaderCtx?.showLoader || (() => {});
  const hideLoader = loaderCtx?.hideLoader || (() => {});
  const navigate = useNavigate();

  const location = useLocation();
  const passedLoanNum = location.state?.Data?.account_id || '';
  const passedLoan = location.state?.Data || null;

  const today = new Date().toISOString().split('T')[0];

  const [loanNumberInput, setLoanNumberInput] = useState(passedLoanNum);
  const [searching, setSearching]             = useState(false);
  const [summaryData, setSummaryData]   = useState(null); 
  const [loan, setLoan]                 = useState(null); 
  const [emis, setEmis]                 = useState([]);
  const [selectedEmi, setSelectedEmi]   = useState(null);
  const [nextPayment, setNextPayment]   = useState(null); 

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode]     = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate]     = useState(today);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null);
  
  const penaltyRateRef = useRef(0);

  const extractBestPenaltyRate = (data) => {
    const candidates = [
      data?.penalty_rate,
      data?.next_payment?.penalty_rate,
      ...(data?.schedule || []).map(e => e?.penalty_rate),
    ].filter(r => typeof r === 'number' && r > 0);
    const found = candidates[0] ?? 0;
    if (found > 0) penaltyRateRef.current = found;   
    return found > 0 ? found : penaltyRateRef.current;
  };

  const penaltyDue = parseFloat(
    selectedEmi?.penalty_amount > 0 ? selectedEmi.penalty_amount : (loan?.penalty_outstanding || 0)
  );

  const interestDueFull     = parseFloat(selectedEmi?.interest_due || 0);
  const alreadyInterestPaid = parseFloat(selectedEmi?.interest_paid || 0);
  let remainingInterest     = Math.max(interestDueFull - alreadyInterestPaid, 0);

  const principalDueFull     = parseFloat(selectedEmi?.principal_due || 0);
  const alreadyPrincipalPaid = parseFloat(selectedEmi?.principal_paid || 0);
  let remainingPrincipal     = Math.max(principalDueFull - alreadyPrincipalPaid, 0);

  const emiInstallment  = parseFloat(selectedEmi?.installment || 0);
  const emiPaidAmount   = parseFloat(selectedEmi?.paid_amount  || 0);
  const maxEmiRemaining = Math.max(emiInstallment - emiPaidAmount, 0);

  if (emiInstallment > 0 && (remainingInterest + remainingPrincipal) > maxEmiRemaining) {
    if (remainingInterest > maxEmiRemaining) {
      remainingInterest  = maxEmiRemaining;
      remainingPrincipal = 0;
    } else {
      remainingPrincipal = parseFloat((maxEmiRemaining - remainingInterest).toFixed(2));
    }
  }

  const totalPayable = parseFloat(
    selectedEmi?.total_payable > 0
      ? selectedEmi.total_payable
      : (penaltyDue + remainingInterest + remainingPrincipal).toFixed(2)
  );

  const amount = parseFloat(paymentAmount) || 0;
  let bal = amount;
  const penaltyPaid   = parseFloat(Math.min(bal, penaltyDue).toFixed(2));   bal = parseFloat((bal - penaltyPaid).toFixed(2));
  const interestPaid  = parseFloat(Math.min(bal, remainingInterest).toFixed(2));  bal = parseFloat((bal - interestPaid).toFixed(2));
  const principalPaid = parseFloat(Math.min(bal, remainingPrincipal).toFixed(2)); bal = parseFloat((bal - principalPaid).toFixed(2));
  const excess = parseFloat(bal.toFixed(2)); 

  const parseResponse = (data) => {
    const penaltyRate = extractBestPenaltyRate(data);
    return {
      loan_number:           data.loan_number,
      loan_status:           data.loan_status,
      penalty_rate:          penaltyRate,
      outstanding_principal: data.summary?.principal_pending ?? 0,
      interest_outstanding:  data.summary?.interest_pending  ?? 0,
      penalty_outstanding:   data.summary?.penalty_pending   ?? 0,
      total_pending:         data.summary?.total_pending     ?? 0,
      loan_amount:           data.summary?.loan_amount       ?? 0
    };
  };

  const daysDiff = (dueDate, pmtDate) => {
    if (!dueDate || !pmtDate) return 0;
    const due = new Date(dueDate);
    const pmt = new Date(pmtDate);
    return Math.max(0, Math.floor((pmt - due) / 86400000));
  };

  const computeEffectiveData = (data, pmtDate) => {
    const np = data.next_payment;
    const penaltyRate = extractBestPenaltyRate(data);

    const enrichEmi = (emi) => {
      const computed = daysDiff(emi.due_date, pmtDate);
      const effectiveDelay = (emi.delay_days ?? 0) > 0 ? emi.delay_days : computed;
      const installment    = emi.installment ?? 0;
      const emiPenaltyRate = (emi.penalty_rate > 0 ? emi.penalty_rate : null) ?? (penaltyRate > 0 ? penaltyRate : null) ?? penaltyRateRef.current ?? 0;

      const effectivePenalty = (emi.penalty_amount ?? 0) > 0 ? emi.penalty_amount : effectiveDelay > 0 && emiPenaltyRate > 0 ? parseFloat((installment * (emiPenaltyRate / 100) * effectiveDelay).toFixed(2)) : 0;
      const effectiveTotal = effectiveDelay > 0 ? parseFloat((installment + effectivePenalty).toFixed(2)) : (emi.total_payable ?? installment);

      return {
        ...emi,
        delay_days:     effectiveDelay,
        penalty_amount: effectivePenalty,
        penalty_rate:   emiPenaltyRate,
        total_payable:  effectiveTotal,
        pending_amount: effectiveTotal,
        status:         emi.status === 'PAID' ? 'PAID' : effectiveDelay > 0  ? 'OVERDUE' : emi.status,
      };
    };

    return {
      enrichNextPayment: np ? enrichEmi({
        emi_number:     np.emi_number,
        due_date:       np.due_date,
        installment:    np.installment ?? np.amount ?? 0,
        paid_amount:    np.paid_amount ?? 0,
        penalty_amount: np.penalty_amount ?? 0,
        penalty_rate:   np.penalty_rate ?? penaltyRate,
        total_payable:  np.total_payable ?? np.amount ?? 0,
        delay_days:     np.delay_days ?? 0,
        status:         'UNPAID',
      }) : null,
      enrichedSchedule: (data.schedule || []).map(enrichEmi),
    };
  };

  const buildEmiList = (data, pmtDate) => {
    const { enrichNextPayment, enrichedSchedule } = computeEffectiveData(data, pmtDate);
    if (enrichedSchedule.length > 0) return enrichedSchedule;
    
    const np = data.next_payment;
    const enp = enrichNextPayment;
    if (!np || !enp) return [];

    const summaryInterest  = data.summary?.interest_pending  ?? 0;
    const summaryPrincipal = data.summary?.principal_pending ?? 0;

    return [{
      emi_number:     enp.emi_number,
      due_date:       enp.due_date,
      installment:    enp.installment,
      interest_due:   np.interest_due !== undefined ? np.interest_due : (enp.installment ? 0 : summaryInterest),
      interest_paid:  0,
      paid_amount:    enp.paid_amount,
      penalty_amount: enp.penalty_amount,
      penalty_paid:   0,
      penalty_rate:   enp.penalty_rate,
      pending_amount: enp.total_payable,
      principal_due:  np.principal_due !== undefined ? np.principal_due : (enp.installment ? enp.installment : summaryPrincipal),
      principal_paid: 0,
      remaining_emi:  enp.installment,
      delay_days:     enp.delay_days,
      total_payable:  enp.total_payable,
      status:         enp.delay_days > 0 ? 'OVERDUE' : 'UNPAID',
    }];
  };

  const handleSearch = async (forceLoanNum = null) => {
    const searchVal = forceLoanNum || loanNumberInput;
    if (!searchVal.trim()) return toast.error('Enter a loan number');
    setSearching(true); setLoan(null); setEmis([]); setSelectedEmi(null);
    setNextPayment(null); setSummaryData(null); setResult(null); setPaymentAmount('');
    
    try {
      showLoader();
      const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };
      const res = await axios.get(`${BASE_URL}/customer-loan-summary/${searchVal.trim()}?payment_date=${paymentDate}`, { headers });
      const data = res.data;
      if (!data.success) return toast.error('Loan not found or failed to fetch summary');

      const { enrichNextPayment } = computeEffectiveData(data, paymentDate);
      setSummaryData(data);
      setLoan(parseResponse(data));
      setNextPayment(enrichNextPayment);

      const emiList = buildEmiList(data, paymentDate);
      setEmis(emiList);

      const target  = data.next_payment?.emi_number;
      const autoEmi = target ? emiList.find(e => e.emi_number === target) : emiList.find(e => e.status !== 'PAID');
      if (autoEmi) {
        setSelectedEmi(autoEmi);
        setPaymentAmount((autoEmi.total_payable || 0).toFixed(2));
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to fetch loan');
    } finally {
      setSearching(false);
      hideLoader();
    }
  };

  useEffect(() => {
    if (passedLoanNum && loanNumberInput === passedLoanNum && !loan && !searching) {
      handleSearch(passedLoanNum);
    }
  }, [passedLoanNum]);

  useEffect(() => {
    if (loan && loanNumberInput.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentDate]);

  const handleSubmit = async () => {
    if (!loan) return toast.error('Load a loan first');
    if (!selectedEmi) return toast.error('Select an EMI');
    if (amount <= 0) return toast.error('Enter a valid payment amount');
    if (excess > 0.01) return toast.error(`Payment exceeds total payable by ₹${excess.toFixed(2)}`);

    const confirm = await Swal.fire({
      title: 'Confirm Payment',
      html: `Receive <b>₹${amount.toLocaleString()}</b> for loan <b>${loan.loan_number}</b>, EMI #${selectedEmi.emi_number}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      confirmButtonColor: '#10b981',
    });
    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    showLoader();
    try {
      const payload = {
        loan_number: loan.loan_number,
        emi_number: selectedEmi.emi_number,
        payment_amount: amount,
        payment_mode: paymentMode,
        transaction_id: transactionId || undefined,
        payment_date: paymentDate,
        created_by: localStorage.getItem('AUID') || 'agent',
      };
      const data = await loanService.receiveCustomerPayment(payload);
      if (data.success === false) throw new Error(data.message);
      setResult(data);
      toast.success('Payment received successfully!');
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
      hideLoader();
    }
  };

  const handleReset = () => {
    setLoan(null); setEmis([]); setSelectedEmi(null); setLoanNumberInput('');
    setPaymentAmount(''); setPaymentMode('Cash'); setTransactionId('');
    setPaymentDate(today); setResult(null); setSummaryData(null); setNextPayment(null);
  };

  const borderBoxCls = {
    border: '1px solid #E3E3E3', borderRadius: 15, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 15, backgroundColor: 'white'
  };
  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none', fontFamily: 'Arial'
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: 'Arial' }}>
      
      <h2 style={{ textAlign: 'center', color: '#b4a383', fontSize: '18px', margin: '20px', position: 'relative' }}>
        <i 
          className="fa-solid fa-arrow-left"
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '20px', color: '#b4a383', marginLeft: '10px' }}
          onClick={() => navigate(-1)}
        ></i>
        Make Payment
      </h2>

      <div style={{ padding: 20, paddingTop: 0 }}>
        {result ? (
          <div style={{ ...borderBoxCls, borderColor: '#10b981', backgroundColor: '#e6fffa' }}>
            <h3 style={{ color: '#047857', textAlign: 'center', margin: 0 }}>Payment Recorded 🎉</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 15 }}>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Amount Paid</small><br/><b>₹{(result.payment_amount || 0).toLocaleString()}</b>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Voucher No</small><br/><b>{result.voucher_number || 'N/A'}</b>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Penalty Paid</small><br/><b>₹{(result.penalty_paid || 0).toLocaleString()}</b>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Interest Paid</small><br/><b>₹{(result.interest_paid || 0).toLocaleString()}</b>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Principal Paid</small><br/><b>₹{(result.principal_paid || 0).toLocaleString()}</b>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 10, border: '1px solid #a7f3d0' }}>
                 <small style={{ color: '#999' }}>Total Remaining</small><br/><b>₹{(result.remaining_principal + result.remaining_interest).toLocaleString()}</b>
              </div>
            </div>
            {result.loan_status === 'CLOSED' && (
              <div style={{ textAlign: 'center', backgroundColor: '#10b981', color: 'white', padding: 8, borderRadius: 8, fontWeight: 'bold' }}>LOAN CLOSED 🎉</div>
            )}
            <button
               style={{ width: '100%', marginTop: 5, padding: '12px 20px', backgroundColor: '#10b981', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
               onClick={handleReset}
             >
               Process Another Payment
            </button>
          </div>
        ) : (
          <>
            <div style={borderBoxCls}>
              {passedLoan && (
                <div style={{ fontSize: 14, fontWeight: 600, color: '#444' }}>
                  Member: {passedLoan.member_name}
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', color: '#999', fontWeight: 'bold' }}>Payment Date</label>
                  <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: '2', minWidth: '150px' }}>
                  <label style={{ fontSize: '12px', color: '#999', fontWeight: 'bold' }}>Loan Number</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input style={inputStyle} placeholder="Loan Number" value={loanNumberInput} onChange={e => setLoanNumberInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                    <button style={{ padding: '10px 15px', backgroundColor: '#2e6de1', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleSearch()}>
                      {searching ? '...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loan && (
              <>
                <div style={borderBoxCls}>
                  <h4 style={{ margin: 0, color: '#b4a383' }}>Loan Overview (Status: {loan.loan_status})</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                     <div><small style={{ color: '#999' }}>Loan Amount</small><br/><b style={{ fontSize: 14 }}>₹{loan.loan_amount}</b></div>
                     <div><small style={{ color: '#999' }}>Principal Pending</small><br/><b style={{ fontSize: 14, color:'#3498db' }}>₹{loan.outstanding_principal}</b></div>
                     <div><small style={{ color: '#999' }}>Interest Pending</small><br/><b style={{ fontSize: 14, color:'#f39c12' }}>₹{loan.interest_outstanding}</b></div>
                     <div><small style={{ color: '#999' }}>Penalty Pending</small><br/><b style={{ fontSize: 14, color: '#e74c3c' }}>₹{loan.penalty_outstanding}</b></div>
                     <div><small style={{ color: '#999' }}>Total Due Pending</small><br/><b style={{ fontSize: 14, color: '#8e44ad' }}>₹{loan.total_pending}</b></div>
                  </div>
                </div>

                <div style={borderBoxCls}>
                  <h4 style={{ margin: 0, color: '#b4a383' }}>Select EMI</h4>
                  {emis.length === 0 ? <p style={{ color: '#999' }}>No EMIs found.</p> : emis.map((emi, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (emi.status !== 'PAID') {
                          setSelectedEmi(emi);
                          const baseCap = (parseFloat(emi.installment || 0) - parseFloat(emi.paid_amount || 0)) || 0;
                          const emiCap = baseCap + parseFloat(loan.penalty_outstanding || emi.penalty_amount || 0);
                          const safeAmt = emi.total_payable > emiCap && emiCap > 0 ? emiCap : emi.total_payable;
                          setPaymentAmount(safeAmt?.toFixed(2) || '');
                        }
                      }}
                      style={{
                        border: selectedEmi?.emi_number === emi.emi_number ? '2px solid #2e6de1' : '1px solid #E3E3E3',
                        borderRadius: 10, padding: 15, cursor: emi.status === 'PAID' ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
                        backgroundColor: selectedEmi?.emi_number === emi.emi_number ? '#f0f5ff' : emi.status === 'PAID' ? '#fcfcfc' : 'white', opacity: emi.status === 'PAID' ? 0.6 : 1
                      }}>
                        <div style={{ display: 'flex', gap: '15px', flex: 1 }}>
                           <input type="radio" readOnly checked={selectedEmi?.emi_number === emi.emi_number} style={{ accentColor: '#2e6de1', width: 22, height: 22, marginTop: 4 }} />
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: 16 }}>EMI #{emi.emi_number} <span style={{fontSize: 12, fontWeight: 'normal', color: '#888'}}>({emi.due_date})</span></div>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, fontSize: 12, color: '#555' }}>
                                 <span style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: 4 }}>Inst: ₹{emi.installment}</span>
                                 <span style={{ backgroundColor: '#e8f4fd', padding: '4px 8px', borderRadius: 4, color: '#2980b9' }}>Prin: ₹{emi.principal_due}</span>
                                 <span style={{ backgroundColor: '#fff4e6', padding: '4px 8px', borderRadius: 4, color: '#d35400' }}>Int: ₹{emi.interest_due}</span>
                                 {emi.penalty_amount > 0 && <span style={{ backgroundColor: '#fdedec', padding: '4px 8px', borderRadius: 4, color: '#c0392b' }}>Pen: ₹{emi.penalty_amount} <b>({emi.delay_days}d)</b></span>}
                              </div>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 90 }}>
                          <div style={{ fontWeight: 'bold', fontSize: 18, color: '#8e44ad' }}>₹{emi.total_payable}</div>
                          <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>Paid: ₹{emi.paid_amount}</div>
                          <div style={{ fontSize: 12, fontWeight: 'bold', padding: '2px 8px', borderRadius: 12, display: 'inline-block', backgroundColor: emi.status === 'PAID' ? '#d5f5e3' : emi.status === 'OVERDUE' ? '#fadbd8' : '#fdebd0', color: emi.status === 'PAID' ? '#27ae60' : emi.status === 'OVERDUE' ? '#c0392b' : '#b9770e' }}>{emi.status}</div>
                        </div>
                    </div>
                  ))}
                </div>

                {selectedEmi && (
                  <div style={{ ...borderBoxCls, border: '2px solid #b4a383' }}>
                    <h4 style={{ margin: 0, color: '#b4a383', fontSize: 16 }}>Payment Application (EMI #{selectedEmi.emi_number})</h4>
                    
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                       <div style={{ flex: '1', minWidth: '150px' }}>
                          <label style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>Amount (₹)</label>
                          <input type="number" style={{ ...inputStyle, border: '2px solid #2e6de1', fontSize: 16, fontWeight: 'bold' }} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
                       </div>
                       <div style={{ flex: '1', minWidth: '150px' }}>
                          <label style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>Payment Mode</label>
                          <select style={inputStyle} value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                             <option>Cash</option>
                             <option>Bank</option>
                          </select>
                       </div>
                       <div style={{ flex: '1', minWidth: '150px' }}>
                          <label style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>Txn ID (Optional)</label>
                          <input type="text" style={inputStyle} value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="UTR..." />
                       </div>
                    </div>

                    {amount > 0 && (
                      <div style={{ backgroundColor: '#f9f9f9', padding: '15px 20px', borderRadius: 8, border: '1px solid #eee' }}>
                        <h4 style={{ margin: 0, marginBottom: 12, fontSize: 13, color: '#777', textTransform: 'uppercase' }}>Auto Allocation Preview</h4>
                        <AllocRow label="Total Amount to Collect" value={totalPayable} color="#333" />
                        <div style={{ margin: '10px 0', borderTop: '1px solid #ddd' }}></div>
                        <AllocRow label="→ Allocate to Penalty" value={penaltyPaid} color="#e74c3c" />
                        <AllocRow label="→ Allocate to Interest" value={interestPaid} color="#f39c12" />
                        <AllocRow label="→ Allocate to Principal" value={principalPaid} color="#3498db" />
                        <div style={{ margin: '10px 0', borderTop: '1px solid #ddd' }}></div>
                        <AllocRow label="Total Input Amount" value={amount} color="#8e44ad" />

                        {excess > 0.01 && (
                          <div style={{ marginTop: 10, color: '#c0392b', fontSize: 13, fontWeight: 'bold' }}>
                             ⚠ Excess ₹{excess.toFixed(2)} — reduce payment to exactly ₹{totalPayable.toFixed(2)} or less.
                          </div>
                        )}
                      </div>
                    )}

                    <button
                       style={{ width: '100%', padding: '14px 20px', backgroundColor: submitting ? '#ccc' : '#1474E1', color: 'white', borderRadius: 8, border: 'none', cursor: submitting ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                       disabled={submitting || amount <= 0 || excess > 0.01}
                       onClick={handleSubmit}
                     >
                       {submitting ? 'Processing...' : `Receive Payment (₹${amount})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerPayment;
