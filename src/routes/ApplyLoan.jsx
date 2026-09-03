import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import { useLoader } from '../loader/LoaderContext';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config/api';

const ApplyLoan = () => {
  const navigate = useNavigate();

  const { showLoader, hideLoader } = useLoader();

  const initialFormData = {
    branch: '',
    branchName: '',
    memberId: '',
    memberName: '',
    memberAge: '',
    memberType: '',
    gId: '',
    gName: '',
    gAge: '',
    gType: '',
    loanProductId: '',
    loanName: '',
    loanAmount: '',
    loantype: 'Flat',
    interest: '',
    tenure: '',
    frequency: 'Monthly',
    emi: '',
    loanPurpose: '',
    Doctype: 'Aadhar',
  };

  const [formdata, setformdata] = useState(initialFormData);
  const [loanProducts, setLoanProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [table, settable] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // MongoDB _id refs (required by server)
  const [memberMongoId, setMemberMongoId] = useState('');
  const [guarantorMongoId, setGuarantorMongoId] = useState('');
  const [agentMongoId, setAgentMongoId] = useState('');

  // ── 1. Fetch Branches & Loan Products on mount ────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      showLoader();
      try {
        // GET /branches
        const branchRes = await axios.get(`${BASE_URL}/branches`);
        let bList = Array.isArray(branchRes.data)
          ? branchRes.data
          : branchRes.data?.data || branchRes.data?.branches || [];
        setBranches(bList);
        console.log('[ApplyLoan] Branches:', bList);
      } catch (err) {
        console.error('[ApplyLoan] /branches error:', err);
        toast.error('Could not load branches.');
      }

      try {
        // GET /loan-products
        const prodRes = await axios.get(`${BASE_URL}/loan-products`);
        let pList = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.data || prodRes.data?.products || [];
        setLoanProducts(pList);
        console.log('[ApplyLoan] Loan Products:', pList);
      } catch (err) {
        console.error('[ApplyLoan] /loan-products error:', err);
        toast.error('Could not load loan products.');
      } finally {
        hideLoader();
      }

      // GET /agents → find logged-in agent's MongoDB _id by AUID
      try {
        const AUID = localStorage.getItem('AUID') || '';
        if (AUID) {
          const agentRes = await axios.get(`${BASE_URL}/agents`);
          let agentList = Array.isArray(agentRes.data)
            ? agentRes.data
            : agentRes.data?.data || agentRes.data?.agents || [];
          const foundAgent = agentList.find((a) => {
            const codes = [
              a.agentCode, a.AgentCode, a.agent_code,
              a.memberId, a.MemberNo, a.memberNo, a.code
            ].map((v) => String(v || '').toLowerCase().trim());
            return codes.includes(AUID.toLowerCase());
          });
          if (foundAgent) {
            const aId = String(foundAgent._id?.$oid || foundAgent._id || foundAgent.id || '');
            setAgentMongoId(aId);
            console.log('[ApplyLoan] Agent MongoDB _id:', aId);
          } else {
            console.warn('[ApplyLoan] Agent not found for AUID:', AUID);
          }
        }
      } catch (err) {
        console.warn('[ApplyLoan] /agents lookup error:', err?.message);
      }
    };

    fetchDropdowns();
  }, []);

  // ── 2. Fetch Member Data ─────────────────────────────────────────────────
  const getmemberdata = async () => {
    const mid = formdata.memberId.trim();
    if (!mid) { toast.error('Please enter a Member ID'); return; }
    showLoader();
    try {
      // GET /get-members → filter by memberId
      const res = await axios.get(`${BASE_URL}/get-members`);
      let rawList = [];
      if (Array.isArray(res.data)) rawList = res.data;
      else if (Array.isArray(res.data?.data)) rawList = res.data.data;

      const found = rawList.find((m) => {
        const ids = [
          m.memberId, m.MemberId, m.MemberNo, m.memberNo,
          m.MemberCode, m.memberCode, m._id, m.id
        ].map((v) => String(v || '').toLowerCase().trim());
        return ids.includes(mid.toLowerCase());
      });

      if (found) {
        const fn = found.FirstName || found.first_name || '';
        const ln = found.LastName || found.last_name || '';
        const fullName = `${fn} ${ln}`.trim() || found.name || '';
        // Store the real MongoDB _id
        const mongoId = String(found._id?.$oid || found._id || found.id || '');
        setMemberMongoId(mongoId);
        console.log('[ApplyLoan] Member MongoDB _id:', mongoId);
        setformdata((p) => ({
          ...p,
          memberName: fullName,
          memberAge: found.Age || found.age || '',
          memberType: found.MemberCategory || found.memberType || found.MemberType || '',
          branch: found.BranchCode || found.branch_code || '',
          branchName: found.BranchName || found.branchName || '',
        }));
        toast.success(`Member found: ${fullName}`);
        console.log('[ApplyLoan] Member found:', found);
      } else {
        setMemberMongoId('');
        setformdata((p) => ({ ...p, memberName: '', memberAge: '', memberType: '' }));
        toast.error(`Member ID "${mid}" not found.`);
      }
    } catch (error) {
      console.error('[ApplyLoan] /get-members error:', error);
      toast.error('Failed to fetch member data.');
    } finally {
      hideLoader();
    }
  };

  // ── 3. Fetch Guarantor Data ──────────────────────────────────────────────
  const getguarantordata = async () => {
    const gid = formdata.gId.trim();
    if (!gid) { toast.error('Please enter a Guarantor ID'); return; }
    showLoader();
    try {
      // GET /get-members → filter by gId
      const res = await axios.get(`${BASE_URL}/get-members`);
      let rawList = [];
      if (Array.isArray(res.data)) rawList = res.data;
      else if (Array.isArray(res.data?.data)) rawList = res.data.data;

      const found = rawList.find((m) => {
        const ids = [
          m.memberId, m.MemberId, m.MemberNo, m.memberNo,
          m.MemberCode, m.memberCode, m._id, m.id
        ].map((v) => String(v || '').toLowerCase().trim());
        return ids.includes(gid.toLowerCase());
      });

      if (found) {
        const fn = found.FirstName || found.first_name || '';
        const ln = found.LastName || found.last_name || '';
        const fullName = `${fn} ${ln}`.trim() || found.name || '';
        // Store the real MongoDB _id
        const gMongoId = String(found._id?.$oid || found._id || found.id || '');
        setGuarantorMongoId(gMongoId);
        console.log('[ApplyLoan] Guarantor MongoDB _id:', gMongoId);
        setformdata((p) => ({
          ...p,
          gName: fullName,
          gAge: found.Age || found.age || '',
          gType: found.MemberCategory || found.memberType || found.MemberType || '',
        }));
        toast.success(`Guarantor found: ${fullName}`);
        console.log('[ApplyLoan] Guarantor found:', found);
      } else {
        setGuarantorMongoId('');
        setformdata((p) => ({ ...p, gName: '', gAge: '', gType: '' }));
        toast.error(`Guarantor ID "${gid}" not found.`);
      }
    } catch (error) {
      console.error('[ApplyLoan] /get-members (guarantor) error:', error);
      toast.error('Failed to fetch guarantor data.');
    } finally {
      hideLoader();
    }
  };

  // ── Auto-calculate EMI ─────────────────────────────────────────────────────
  useEffect(() => {
    const P = parseFloat(formdata.loanAmount);
    const R = parseFloat(formdata.interest) / 100 / 12;
    const T = parseFloat(formdata.tenure);
    if (!P || !R || !T || P <= 0 || R <= 0 || T <= 0) { setformdata((p) => ({ ...p, emi: '' })); return; }

    let emi = 0;
    if (formdata.loantype === 'Flat') {
      emi = (P * R * T + P) / T;
    } else {
      const compound = Math.pow(1 + R, T);
      emi = (P * R * compound) / (compound - 1);
    }
    setformdata((p) => ({ ...p, emi: emi.toFixed(2) }));
  }, [formdata.loanAmount, formdata.interest, formdata.tenure, formdata.loantype]);

  // ── View EMI Schedule ──────────────────────────────────────────────────────
  const sadule = () => {
    const P0 = parseFloat(formdata.loanAmount);
    const R = parseFloat(formdata.interest) / 100 / 12;
    const T = parseFloat(formdata.tenure);
    if (!P0 || !R || !T) { toast.error('Please enter Loan Amount, Interest & Tenure'); return; }

    let P = P0;
    let N = T;
    let array = [];
    let sumEMI = 0, sumInt = 0;

    for (let i = 1; i <= T; i++) {
      let emi, I, A;
      if (formdata.loantype === 'Flat') {
        emi = (P0 * R * T + P0) / T;
        I = (P0 * R * T) / T;
        A = emi - I;
        P -= A;
      } else {
        emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        I = P * R;
        A = emi - I;
        P -= A;
        N -= 1;
      }
      sumEMI += emi;
      sumInt += I;
      array.push({
        EMI: emi.toFixed(2),
        Int: I.toFixed(2),
        Amt: A.toFixed(2),
        Bal: P.toFixed(0),
      });
    }
    settable({ array, TotalAmt: sumEMI.toFixed(0), TotalInt: sumInt.toFixed(0) });
  };

  // ── Document Upload ────────────────────────────────────────────────────────
  const handleAddDocument = (file) => {
    if (!file) return;
    setDocuments((prev) => [
      ...prev,
      { id: Date.now(), file, name: formdata.Doctype, fileName: file.name },
    ]);
    toast.success(`Document added: ${file.name}`);
  };

  // ── 8. Submit Loan → POST /loan-requests ──────────────────────────────────
  const Create = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    showLoader();

    // Recalculate schedule for payload
    const P0 = parseFloat(formdata.loanAmount);
    const R = parseFloat(formdata.interest) / 100 / 12;
    const T = parseFloat(formdata.tenure);
    let scheduleArray = [];
    let sumEMI = 0;

    if (P0 && R && T) {
      let P = P0, N = T;
      for (let i = 1; i <= T; i++) {
        let emi, I, A;
        if (formdata.loantype === 'Flat') {
          emi = (P0 * R * T + P0) / T;
          I = (P0 * R * T) / T;
          A = emi - I;
          P -= A;
        } else {
          emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
          I = P * R;
          A = emi - I;
          P -= A;
          N -= 1;
        }
        sumEMI += emi;
        scheduleArray.push({ EMI: emi.toFixed(2), Int: I.toFixed(2), Amt: A.toFixed(2), Bal: P.toFixed(0) });
      }
    }

    const firstEMI = scheduleArray.length > 0 ? scheduleArray[0].EMI : '';

    // Build FormData — field names match ENTERPRISES /loan-requests API
    const fd = new FormData();

    // Required IDs — use MongoDB _id (ObjectId), NOT display codes
    fd.append('member_id',        memberMongoId || formdata.memberId);
    fd.append('memberId',         formdata.memberId);       // display code for reference
    fd.append('branch_id',        formdata.branch);         // already stored as _id from branch select
    fd.append('loan_product_id',  formdata.loanProductId);  // already stored as _id from product select


    // Amounts & Loan params
    fd.append('requestedAmount',  parseFloat(formdata.loanAmount) || 0);
    fd.append('loanAmount',       parseFloat(formdata.loanAmount) || 0);
    fd.append('requestedTenure',  parseInt(formdata.tenure, 10) || 0);
    fd.append('loanTenure',       parseInt(formdata.tenure, 10) || 0);
    fd.append('roi',              formdata.interest);
    fd.append('ROI',              formdata.interest);
    fd.append('emi',              firstEMI);
    fd.append('EMI',              firstEMI);
    fd.append('frequency',        formdata.frequency || 'Monthly');
    fd.append('interestType',     formdata.loantype);
    fd.append('InterestType',     formdata.loantype);

    // Member info
    fd.append('memberName',       formdata.memberName);
    fd.append('MemberName',       formdata.memberName);
    fd.append('memberType',       formdata.memberType);
    fd.append('age',              formdata.memberAge);
    fd.append('Age',              formdata.memberAge);

    // Branch & product names
    fd.append('branchName',       formdata.branchName);
    fd.append('BranchName',       formdata.branchName);
    fd.append('selectedLoan',     formdata.loanName);
    fd.append('LoanName',         formdata.loanName);
    fd.append('productType',      'Loan');
    fd.append('durationIn',       'Months');

    // Guarantor — use MongoDB _id for guarantor_id
    fd.append('guarantorId',      guarantorMongoId || formdata.gId);
    fd.append('GID',              formdata.gId);            // display code for reference

    fd.append('guarantorName',    formdata.gName);
    fd.append('Gname',            formdata.gName);
    fd.append('guarantorType',    formdata.gType);
    fd.append('Gtype',            formdata.gType);
    fd.append('guarantorAge',     formdata.gAge);
    fd.append('Gage',             formdata.gAge);

    // Introducer / Agent — use MongoDB _id, NOT the AUID display code
    fd.append('agent_id',         agentMongoId || localStorage.getItem('AUID') || '');
    fd.append('agent_code',       localStorage.getItem('AUID') || '');  // display code
    fd.append('introducer_id',    agentMongoId || localStorage.getItem('AUID') || '');
    fd.append('introducer',       localStorage.getItem('AUID') || '');  // display code
    fd.append('IntroCode',        localStorage.getItem('AUID') || '');  // display code

    // Misc
    fd.append('date',             moment().format('YYYY-MM-DD'));
    fd.append('Date',             moment().format('YYYY-MM-DD'));
    fd.append('loanPurpose',      formdata.loanPurpose || '');
    fd.append('Purpose',          formdata.loanPurpose || '');
    fd.append('status',           'Pending');
    fd.append('Status',           'Pending');
    fd.append('EmpID',            'admin');
    fd.append('schedule',         JSON.stringify(scheduleArray));

    // Documents
    const docsMeta = [];
    documents.forEach((doc, idx) => {
      const fileKey = `document_${idx}`;
      fd.append(fileKey, doc.file);
      docsMeta.push({ name: doc.name, fileKey });
    });
    fd.append('additionalDocs', JSON.stringify(docsMeta));

    console.log('===== LOAN FORM DATA =====');
    for (let [key, val] of fd.entries()) {
      console.log(`${key}:`, val);
    }
    console.log('==========================');

    try {
      // POST /loan-requests
      const res = await axios.post(`${BASE_URL}/loan-requests`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('[ApplyLoan] POST /loan-requests response:', res.data);
      toast.success(res.data?.message || 'Loan application submitted successfully!');
      setformdata(initialFormData);
      setDocuments([]);
      settable('');
    } catch (error) {
      console.error('[ApplyLoan] POST /loan-requests error:', error);
      // Log the full error response so we can see exactly what the server says
      console.error('[ApplyLoan] Server response:', error?.response?.data);
      console.error('[ApplyLoan] Status:', error?.response?.status);
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        JSON.stringify(error?.response?.data) ||
        error?.message ||
        'Failed to submit loan application.'
      );
    } finally {
      setSubmitting(false);
      hideLoader();
    }
  };

  const tableHead = ['Sno.', 'EMI', 'Principal', 'Interest', 'Balance'];

  return (
    <div style={container}>
      <h2 style={{ textAlign: 'center', color: '#b4a383', fontSize: '18px', marginBottom: '20px', position: 'relative' }}>
        <i
          className="fa-solid fa-arrow-left"
          style={{
            position: 'absolute', left: 0, top: '50%',
            transform: 'translateY(-50%)', cursor: 'pointer',
            fontSize: '20px', color: '#b4a383', marginLeft: '10px',
          }}
          onClick={() => navigate(-1)}
        />
        Loan Application
      </h2>

      <form onSubmit={Create}>

        {/* ── Branch ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Branch <span style={{ color: 'red' }}>*</span></label>
          <select
            required
            value={formdata.branch}
            onChange={(e) => {
              const sel = branches.find((b) => String(b._id || b.BranchCode || '') === e.target.value);
              setformdata((p) => ({
                ...p,
                branch: e.target.value,
                branchName: sel ? (sel.BranchName || sel.branchName || sel.name || '') : '',
              }));
            }}
            style={inputStyle}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((b, i) => {
              const bid = String(b._id || b.BranchCode || i);
              const bname = b.BranchName || b.branchName || b.name || bid;
              return <option key={bid} value={bid}>{bname}</option>;
            })}
          </select>
        </div>

        {/* ── Loan Product ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Loan Product <span style={{ color: 'red' }}>*</span></label>
          <select
            required
            value={formdata.loanProductId}
            onChange={(e) => {
              const sel = loanProducts.find((p) => String(p._id || p.id || '') === e.target.value);
              setformdata((p) => ({
                ...p,
                loanProductId: e.target.value,
                loanName: sel ? (sel.ProductName || sel.productName || sel.name || '') : '',
                interest: sel?.roi || sel?.interestRate || sel?.rateOfInterest || p.interest,
                tenure: sel?.tenure || sel?.loanTenure || p.tenure,
              }));
            }}
            style={inputStyle}
          >
            <option value="">-- Select Loan Product --</option>
            {loanProducts.map((p, i) => {
              const pid = String(p._id || p.id || i);
              const pname = p.ProductName || p.productName || p.name || pid;
              return <option key={pid} value={pid}>{pname}</option>;
            })}
          </select>
        </div>

        {/* ── Member ID ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Member ID <span style={{ color: 'red' }}>*</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              required
              value={formdata.memberId}
              onChange={(e) => setformdata((p) => ({ ...p, memberId: e.target.value, memberName: '', memberAge: '', memberType: '' }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); getmemberdata(); } }}
              type="text"
              placeholder="Enter member ID then press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={getmemberdata} style={{ ...buttonStyle, width: 'auto', padding: '10px 16px', marginBottom: 0 }}>
              🔍
            </button>
          </div>
        </div>

        {/* ── Member Info (auto-filled) ── */}
        {formdata.memberName ? (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
            ✅ {formdata.memberName} | Type: {formdata.memberType} | Age: {formdata.memberAge}
          </div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: 'Member Name', field: 'memberName', readOnly: true },
            { label: 'Member Type', field: 'memberType', readOnly: true },
            { label: 'Age', field: 'memberAge', readOnly: true },
          ].map(({ label, field, readOnly }) => (
            <div key={field} style={formItem}>
              <label style={labelStyle}>{label}</label>
              <input readOnly={readOnly} value={formdata[field] || ''} type="text" style={{ ...inputStyle, background: readOnly ? '#f3f4f6' : undefined }} />
            </div>
          ))}
        </div>

        {/* ── Guarantor ID ── */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Guarantor ID</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={formdata.gId}
              onChange={(e) => setformdata((p) => ({ ...p, gId: e.target.value, gName: '', gAge: '', gType: '' }))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); getguarantordata(); } }}
              type="text"
              placeholder="Enter guarantor ID then press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="button" onClick={getguarantordata} style={{ ...buttonStyle, width: 'auto', padding: '10px 16px', marginBottom: 0 }}>
              🔍
            </button>
          </div>
        </div>

        {formdata.gName ? (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
            ✅ Guarantor: {formdata.gName} | Type: {formdata.gType} | Age: {formdata.gAge}
          </div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          {[
            { label: 'Guarantor Name', field: 'gName', readOnly: true },
            { label: 'Guarantor Type', field: 'gType', readOnly: true },
            { label: 'Guarantor Age', field: 'gAge', readOnly: true },
          ].map(({ label, field, readOnly }) => (
            <div key={field} style={formItem}>
              <label style={labelStyle}>{label}</label>
              <input readOnly={readOnly} value={formdata[field] || ''} type="text" style={{ ...inputStyle, background: readOnly ? '#f3f4f6' : undefined }} />
            </div>
          ))}
        </div>

        {/* ── Loan Details ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>

          <div style={formItem}>
            <label style={labelStyle}>Loan Amount <span style={{ color: 'red' }}>*</span></label>
            <input required value={formdata.loanAmount} onChange={(e) => setformdata((p) => ({ ...p, loanAmount: e.target.value }))} type="number" placeholder="Amount" style={inputStyle} />
          </div>

          <div style={formItem}>
            <label style={labelStyle}>Interest Type</label>
            <select value={formdata.loantype} onChange={(e) => setformdata((p) => ({ ...p, loantype: e.target.value }))} style={inputStyle}>
              <option value="Flat">Flat</option>
              <option value="Reducing">Reducing</option>
            </select>
          </div>

          <div style={formItem}>
            <label style={labelStyle}>Tenure (months)</label>
            <input required value={formdata.tenure} onChange={(e) => setformdata((p) => ({ ...p, tenure: e.target.value }))} type="number" placeholder="Tenure" style={inputStyle} />
          </div>

          <div style={formItem}>
            <label style={labelStyle}>ROI (%)</label>
            <input required value={formdata.interest} onChange={(e) => setformdata((p) => ({ ...p, interest: e.target.value }))} type="number" placeholder="ROI" style={inputStyle} step="0.01" />
          </div>

          <div style={formItem}>
            <label style={labelStyle}>EMI (Auto-calculated)</label>
            <input readOnly value={formdata.emi || ''} type="text" placeholder="EMI" style={{ ...inputStyle, background: '#f3f4f6', fontWeight: 700, color: '#385FBF' }} />
          </div>

          <div style={formItem}>
            <label style={labelStyle}>Loan Purpose</label>
            <input value={formdata.loanPurpose || ''} onChange={(e) => setformdata((p) => ({ ...p, loanPurpose: e.target.value }))} type="text" placeholder="Purpose" style={inputStyle} />
          </div>

        </div>

        {/* ── EMI Schedule ── */}
        <button type="button" onClick={sadule} style={buttonStyle}>View EMI Schedule</button>

        {table && (
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#eeeeee6b' }}>
              <thead>
                <tr style={{ background: '#d4d4d4' }}>
                  {tableHead.map((h) => <th key={h} style={{ padding: 5 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody style={{ textAlign: 'center' }}>
                {table.array.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: 5 }}>{idx + 1}</td>
                    <td style={{ padding: 5 }}>{item.EMI}</td>
                    <td style={{ padding: 5 }}>{item.Amt}</td>
                    <td style={{ padding: 5 }}>{item.Int}</td>
                    <td style={{ padding: 5 }}>{item.Bal}</td>
                  </tr>
                ))}
                <tr style={{ background: '#d4d4d4', fontWeight: 700 }}>
                  <td style={{ padding: 5 }}>Total</td>
                  <td style={{ padding: 5 }}>{table.TotalAmt}</td>
                  <td colSpan="3" style={{ padding: 5 }}>Interest: {table.TotalInt}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Document Upload ── */}
        <div style={formItem}>
          <label style={labelStyle}>Document Type</label>
          <select value={formdata.Doctype} onChange={(e) => setformdata((p) => ({ ...p, Doctype: e.target.value }))} style={inputStyle}>
            <option>Aadhar</option>
            <option>Bank Statement</option>
            <option>PAN Card</option>
            <option>Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Upload Document</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => { const file = e.target.files[0]; if (file) handleAddDocument(file); e.target.value = ''; }}
            style={inputStyle}
          />
        </div>

        {/* Show uploaded docs */}
        {documents.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Uploaded Documents ({documents.length})</label>
            {documents.map((doc, idx) => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                <span>📄 <strong>{doc.name}</strong> — {doc.fileName}</span>
                <button type="button" onClick={() => setDocuments((p) => p.filter((d) => d.id !== doc.id))} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ ...buttonStyle, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? 'Submitting...' : 'Apply for Loan'}
        </button>
      </form>
    </div>
  );
};

export default ApplyLoan;

const container = {
  maxWidth: '800px',
  margin: 'auto',
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: 'bold',
  color: '#b4a383',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #b4a383',
  boxSizing: 'border-box',
};

const buttonStyle = {
  width: '100%',
  backgroundColor: '#385FBF',
  color: '#b4a383',
  padding: '10px',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  marginBottom: '20px',
  cursor: 'pointer',
};

const formItem = {
  flex: '1 1 48%',
  minWidth: '250px',
  marginBottom: 16,
};