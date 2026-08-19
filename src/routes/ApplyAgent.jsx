import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { database } from '../DB/Firebase';
import { off, onValue, ref, update } from 'firebase/database';
import { useLoader } from '../loader/LoaderContext';
import { toast } from 'react-toastify';
import { BASE_URL } from '../config/api';

const ApplyAgent = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const initialFormData = {
    date: moment(new Date()).format('yyyy-MM-DD'),
    mdata: '',
    memberName: '',
    EmpID: 'admin',
    IntroCode: '',
    IntroName: '',
    confirmpassword: '',
    password: '',
    Designation: '',
    designation_id: '',
    memberId: '',
    memberAge: '',
    memberType: '',
    branch_id: '',
  };

  const [formdata, setformdata] = useState(initialFormData);
  const [UID, setUID] = useState('');
  const [fdata, setfdata] = useState([]);           // designations from API
  const [desigLoading, setDesigLoading] = useState(false);
  const [branches, setBranches] = useState([]);      // branches from API
  const [branchLoading, setBranchLoading] = useState(false);
  const [Agentname, setAgentname] = useState('');
  const [memberLookupLoading, setMemberLookupLoading] = useState(false);
  // ── Load UID from localStorage ────────────────────────────────────────────
  useEffect(() => {
    setUID(localStorage.getItem('AUID'));
  }, []);

  // ── Listen for agent name from Firebase ──────────────────────────────────
  useEffect(() => {
    if (!UID) return;
    const agentRef = ref(database, `Agent/Agents/${UID}`);
    onValue(agentRef, (snap) => {
      const Introdata = snap.val();
      if (Introdata?.mdata) {
        setAgentname(`${Introdata.mdata.FirstName} ${Introdata.mdata.LastName}`);
      }
    });
    return () => { off(agentRef); };
  }, [UID]);

  // ── Fetch Designations from REST API ──────────────────────────────────────
  useEffect(() => {
    const fetchDesignations = async () => {
      setDesigLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/designations`);
        let list = [];
        if (Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res.data?.data)) list = res.data.data;
        else if (Array.isArray(res.data?.designations)) list = res.data.designations;
        console.log('[ApplyAgent] Designations loaded:', list);
        setfdata(list);
        // Auto-select first — store both name and _id
        if (list.length > 0) {
          const first = list[0];
          const firstName = first.designation_name || first.designationName || first.name || first.Designation || '';
          const firstId   = String(first._id || first.id || '');
          setformdata((p) => ({ ...p, Designation: firstName, designation_id: firstId }));
        }
      } catch (err) {
        console.warn('[ApplyAgent] /designations error:', err?.response?.data || err.message);
        toast.error('Could not load designations.');
      } finally {
        setDesigLoading(false);
      }
    };
    fetchDesignations();
  }, []);

  // ── Fetch Branches from REST API ──────────────────────────────────────────
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/branches`);
        let list = [];
        if (Array.isArray(res.data))              list = res.data;
        else if (Array.isArray(res.data?.data))   list = res.data.data;
        else if (Array.isArray(res.data?.branches)) list = res.data.branches;
        console.log('[ApplyAgent] Branches loaded:', list);
        setBranches(list);
      } catch (err) {
        console.warn('[ApplyAgent] /branches error:', err?.response?.data || err.message);
        toast.error('Could not load branches.');
      } finally {
        setBranchLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // ── Helper: get branch display name ──────────────────────────────────────
  const getBranchName = (b) => {
    if (!b || typeof b !== 'object') return '';
    const keys = ['branchname', 'branch_name', 'name', 'title', 'BranchName', 'branchName'];
    for (const k of keys) {
      const found = Object.keys(b).find(key => key.toLowerCase().replace(/[^a-z]/g,'') === k.toLowerCase().replace(/[^a-z]/g,''));
      if (found && b[found] && String(b[found]).trim()) return String(b[found]).trim();
    }
    return String(b._id || b.id || '');
  };


  const [customAgent, setcustomAgent] = useState('');
  const [agentLookupLoading, setAgentLookupLoading] = useState(false);

  // ── Fetch Agent Name from /agent-requests and /get-members by agent code ─────
  const getAgentname = async () => {
    const code = customAgent.trim();
    if (!code) { toast.error('Please enter an Agent Code'); return; }
    setAgentLookupLoading(true);
    try {
      const [resAgents, resMem] = await Promise.all([
        axios.get(`${BASE_URL}/agent-requests`).catch(() => ({ data: [] })),
        axios.get(`${BASE_URL}/get-members`).catch(() => ({ data: [] }))
      ]);

      let rawAgents = [];
      if (Array.isArray(resAgents.data))                  rawAgents = resAgents.data;
      else if (Array.isArray(resAgents.data?.data))        rawAgents = resAgents.data.data;
      else if (Array.isArray(resAgents.data?.requests))    rawAgents = resAgents.data.requests;

      let rawMembers = [];
      if (Array.isArray(resMem.data))                  rawMembers = resMem.data;
      else if (Array.isArray(resMem.data?.data))        rawMembers = resMem.data.data;

      const search = code.toLowerCase();

      // Check agent requests first
      let found = rawAgents.find((a) => {
        const codes = [
          a.agent_code, a.agentCode, a.AgentCode,
          a.introducer_code, a.IntroCode, a.member_code,
          a.memberId, a._id, a.code,
        ].map((v) => String(v || '').toLowerCase().trim());
        const aStatus = String(a.status || a.Status || a.agentStatus || '').toLowerCase();
        // You might want to allow pending if it's the current behavior, but approved is safer for introducer
        // We'll just check if it matches first, to broadly accept
        return codes.includes(search); 
      });

      // If not in agent requests, check members
      if (!found) {
        found = rawMembers.find((m) => {
          const ids = [
            m.agentCode, m.agent_code, m.AgentCode,
            m.memberId, m.member_id, m.MemberNo, m.memberNo,
            m.MemberCode, m.memberCode, m._id
          ].map((v) => String(v || '').toLowerCase().trim());
          return ids.includes(search);
        });
      }

      console.log('[ApplyAgent] Agent lookup result:', found);

      if (!found) {
        toast.error(`Agent Code "${code}" not found.`);
        setformdata((p) => ({ ...p, IntroCode: '', IntroName: '' }));
        return;
      }

      // Resolve agent name from the found request/member
      const introName = found.member_name || found.memberName || 
        (found.FirstName ? `${found.FirstName} ${found.LastName || ''}`.trim() : null) ||
        found.name || found.IntroName || found.introducer_name || code;

      setformdata((p) => ({ ...p, IntroCode: code, IntroName: introName }));
      toast.success(`Agent found: ${introName}`);
    } catch (err) {
      console.error('[ApplyAgent] lookup error:', err);
      toast.error('Failed to fetch agent data.');
      setformdata((p) => ({ ...p, IntroCode: '', IntroName: '' }));
    } finally {
      setAgentLookupLoading(false);
    }
  };

  // ── Helper: extract member's own ID (same logic as ENTERPRISES CreateAgent) ──
  const getMemberOwnId = (m) => {
    if (!m || typeof m !== 'object') return '';
    const candidates = ['agentCode', 'agent_code', 'AgentCode', 'memberId', 'member_id',
      'MemberNo', 'memberNo', 'member_no', 'MemberCode', 'memberCode'];
    for (const key of candidates) {
      if (m[key] && String(m[key]).trim()) return String(m[key]).trim();
    }
    // zero-padded number pattern
    for (const [k, v] of Object.entries(m)) {
      if (k.toLowerCase() === 'memberid') continue;
      if (typeof v === 'string' && /^0\d{4,11}$/.test(v.trim())) return v.trim();
    }
    return String(m._id || m.id || '').trim();
  };

  const getmemberdata = async () => {
    const mid = formdata.memberId.trim();
    if (!mid) { toast.error('Please enter a Member ID'); return; }
    setMemberLookupLoading(true);
    showLoader();
    console.log('[ApplyAgent] Looking up member:', mid);
    try {
      const res = await axios.get(`${BASE_URL}/get-members`);
      let rawList = [];
      if (Array.isArray(res.data)) rawList = res.data;
      else if (Array.isArray(res.data?.data)) rawList = res.data.data;

      const search = mid.toLowerCase().trim();
      const found = rawList.find((m) => {
        const ownId  = getMemberOwnId(m).toLowerCase();
        const mongoId = String(m._id || m.id || '').toLowerCase();
        return ownId === search || mongoId === search;
      });

      if (!found) {
        toast.error(`Member ID "${mid}" not found.`);
        setformdata((p) => ({ ...p, memberName: '', memberAge: '', memberType: '', mdata: '' }));
        return;
      }

      const memberStatus = (found.status || found.Status || '').toLowerCase();
      if (['pending', 'rejected'].includes(memberStatus)) {
        toast.error(`Member "${mid}" is ${memberStatus}. Only approved members can apply.`);
        return;
      }

      const firstName  = found.FirstName  || found.firstname  || found.first_name  || '';
      const lastName   = found.LastName   || found.lastname   || found.last_name   || '';
      const memberName = `${firstName} ${lastName}`.trim() || mid;
      const memberAge  = found.Age  || found.age  || '';
      const memberType = found.MemberCategory || found.memberCategory ||
                         found.MemberType || found.member_type || found.Category || '';

      setformdata((p) => ({
        ...p,
        memberName,
        memberAge,
        memberType,
        mdata: found,
      }));
      toast.success(`Member found: ${memberName}`);
      console.log('[ApplyAgent] Member found:', found);
    } catch (error) {
      console.error('[ApplyAgent] /get-members error:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch member data.');
    } finally {
      setMemberLookupLoading(false);
      hideLoader();
    }
  };
  const [selectedOption, setSelectedOption] = useState("No");

  const Create = async (e) => {
    e.preventDefault();

    // ── Console form data ─────────────────────────────────────────────────────
    console.log('===== AGENT FORM DATA =====');
    console.log('memberId       :', formdata.memberId);
    console.log('memberName     :', formdata.memberName);
    console.log('memberType     :', formdata.memberType);
    console.log('memberAge      :', formdata.memberAge);
    console.log('Designation    :', formdata.Designation);
    console.log('designation_id :', formdata.designation_id);
    console.log('branch_id      :', formdata.branch_id);
    console.log('IntroCode      :', formdata.IntroCode);
    console.log('IntroName      :', formdata.IntroName);
    console.log('password       :', formdata.password);
    console.log('Intro Option   :', selectedOption === 'No' ? 'Self Introduction' : 'Change Introducer');
    console.log('Full formdata  :', formdata);
    console.log('===========================');

    // ── Validations ──────────────────────────────────────────────────────────
    if (!formdata.memberId.trim())   { toast.error('Member ID is required.');                          return; }
    if (!formdata.mdata)             { toast.error('Please search and select a valid Member first.'); return; }
    if (!formdata.Designation)       { toast.error('Please select a Designation.');                    return; }
    if (!formdata.branch_id)         { toast.error('Please select a Branch.');                         return; }
    if (!formdata.password.trim())   { toast.error('Password is required.');                           return; }
    if (formdata.password !== formdata.confirmpassword) {
      toast.error('Confirm password does not match.');
      return;
    }

    // ── Resolve Introducer based on selected option ───────────────────────────
    // Self Introduction → use the currently logged-in agent's UID + name
    // Change Introducer → use the custom agent code + fetched name
    const introCode = selectedOption === 'No' ? UID        : customAgent;
    const introName = selectedOption === 'No' ? Agentname  : formdata.IntroName;

    if (!introCode) {
      toast.error('Introducer agent ID not found. Please login again.');
      return;
    }

    // ── Member MongoDB _id ────────────────────────────────────────────────────
    const memberMongoId = String(
      formdata.mdata?._id?.$oid || formdata.mdata?._id || formdata.mdata?.id || ''
    ).trim();

    // ── Branch info (only filled for Self Introduction) ─────────────────────
    const selectedBranch = branches.find(b => String(b._id || b.id || '') === String(formdata.branch_id));
    const branchName = getBranchName(selectedBranch);
    const branchCode = selectedBranch?.BranchCode || selectedBranch?.branchCode || selectedBranch?.branch_code || '';

    // ── Build payload for POST /agent-requests ────────────────────────────────
    const payload = {
      // Member info
      member_id:    memberMongoId || formdata.memberId,
      member_code:  formdata.memberId,
      member_name:  formdata.memberName,
      memberName:   formdata.memberName,

      // Introducer (logged-in agent or custom)
      agent_code:      introCode,
      agentCode:       introCode,
      AgentCode:       introCode,
      introducer_code: introCode,
      IntroCode:       introCode,
      introducer_name: introName,
      IntroName:       introName,

      // Branch (from Self Introduction dropdown)
      branch_id:   formdata.branch_id,
      branch_name: branchName,
      branchName:  branchName,
      branch_code: branchCode,
      branchCode:  branchCode,

      // Designation — send both name and MongoDB _id
      designation_id:   formdata.designation_id,
      designation_name: formdata.Designation,
      designationName:  formdata.Designation,
      Designation:      formdata.Designation,

      // Credentials
      password: formdata.password,

      // Meta
      date:   moment().format('YYYY-MM-DD'),
      status: 'pending',
      EmpID:  'admin',
    };

    console.group('%c[ApplyAgent] POST /agent-requests', 'color:green;font-weight:bold');
    console.log('Introducer mode :', selectedOption === 'No' ? 'Self Introduction' : 'Custom Agent');
    console.log('introCode (UID) :', introCode);
    console.log('introName       :', introName);
    console.log('Payload         :', payload);
    console.groupEnd();

    showLoader();
    try {
      const res = await axios.post(`${BASE_URL}/agent-requests`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast.success(res.data?.message || 'Agent request submitted successfully!');
      setformdata(initialFormData);
      setcustomAgent('');
    } catch (err) {
      console.group('%c[ApplyAgent] POST /agent-requests FAILED', 'color:red;font-weight:bold');
      console.log('HTTP Status  :', err?.response?.status);
      console.log('Response data:', err?.response?.data);
      console.log('Error msg    :', err?.message);
      console.groupEnd();
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error   ||
        err?.message                 ||
        'Failed to submit agent request.'
      );
    } finally {
      hideLoader();
    }
  };




  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

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
          onClick={() => navigate('/')}
        ></i> Agent Form
      </h2>






      <form onSubmit={Create}>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>
            Do you want to change Introducer?
          </label>

          <div style={{ display: "flex", gap: "15px" }}>
            <label className="radio-btn" style={{ background: selectedOption === "No" ? '#385FBF' : 'white' }}>
              <input
                type="radio"
                value="No"
                checked={selectedOption === "No"}
                onChange={handleChange}
              />
              <span>Self Introduction</span>
            </label>

            <label className="radio-btn" style={{ background: selectedOption === "Yes" ? '#385FBF' : 'white' }}>
              <input
                type="radio"
                value="Yes"
                checked={selectedOption === "Yes"}
                onChange={handleChange}
              />
              <span>Change Introducer</span>
            </label>
          </div>

          <style>{`
        .radio-btn {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 12px;
          padding: 6px 12px;
          border: 2px solid #385FBF;
          
          border-radius: 5px;
          transition: 0.3s;
        }

        .radio-btn input {
          display: none;
        }

        .radio-btn span {
          font-weight: 500;
          // color: #333;
          color : #385FBF;
        }

        .radio-btn input:checked + span {
          color: #b4a383;
        }

        .radio-btn input:checked ~ span {
          
          border-radius: 5px;
        }

      `}</style>
        </div>

        {/* <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Do you Want to Change Indroducer ?</label>

      <label>
        <input
          type="radio"
          value="No"
          checked={selectedOption === "No"}
          onChange={handleChange}
          style={{marginRight:5}}
        />
        Self Indroduction
      </label>

      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          value="Yes"
          checked={selectedOption === "Yes"}
          onChange={handleChange}
          style={{marginRight:5}}
        />
        Change Indroducer
      </label>
            </div> */}

        {selectedOption === "Yes" && <>
          {/* Agent Code with inline fetch button */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Agent Code <span style={{ color: 'red' }}>*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                required
                value={customAgent}
                onChange={(e) => {
                  setcustomAgent(e.target.value);
                  setformdata((p) => ({ ...p, IntroCode: '', IntroName: '' }));
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); getAgentname(); } }}
                type='text'
                placeholder='Enter agent code then press Enter'
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type='button'
                onClick={getAgentname}
                disabled={agentLookupLoading}
                style={{ ...buttonStyle, width: 'auto', padding: '10px 16px', marginBottom: 0, opacity: agentLookupLoading ? 0.6 : 1 }}
              >
                {agentLookupLoading ? '...' : '🔍'}
              </button>
            </div>
          </div>

          {/* Auto-filled Agent Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Agent Name</label>
            <input
              readOnly
              value={formdata.IntroName}
              type='text'
              placeholder='Auto-filled after lookup'
              style={{ ...inputStyle, background: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>

          {/* Branch for Change Introducer */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Branch <span style={{ color: 'red' }}>*</span></label>
            <select
              required
              value={formdata.branch_id}
              onChange={(e) => setformdata((p) => ({ ...p, branch_id: e.target.value }))}
              style={inputStyle}
            >
              <option value="">{branchLoading ? 'Loading branches...' : '-- Select Branch --'}</option>
              {branches.map((b, i) => {
                const bid   = String(b._id || b.id || i);
                const bname = getBranchName(b) || bid;
                return <option key={bid} value={bid}>{bname}</option>;
              })}
            </select>
          </div>
        </>}

        {/* Branch — shown only for Self Introduction */}
        {selectedOption === 'No' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Branch <span style={{ color: 'red' }}>*</span></label>
            <select
              required
              value={formdata.branch_id}
              onChange={(e) => setformdata((p) => ({ ...p, branch_id: e.target.value }))}
              style={inputStyle}
            >
              <option value="">{branchLoading ? 'Loading branches...' : '-- Select Branch --'}</option>
              {branches.map((b, i) => {
                const bid  = String(b._id || b.id || i);
                const bname = getBranchName(b) || bid;
                return <option key={bid} value={bid}>{bname}</option>;
              })}
            </select>
          </div>
        )}




        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Member ID</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              required
              value={formdata.memberId}
              onChange={(e) => {
                setformdata((p) => ({ ...p, memberId: e.target.value, memberName: '', memberAge: '', memberType: '', mdata: '' }));
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); getmemberdata(); } }}
              type="text"
              placeholder="Enter member ID then press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={getmemberdata}
              disabled={memberLookupLoading}
              style={{ ...buttonStyle, width: 'auto', padding: '10px 16px', marginBottom: 0, opacity: memberLookupLoading ? 0.6 : 1 }}
            >
              {memberLookupLoading ? '...' : '🔍'}
            </button>
          </div>
        </div>

        {/* Auto-filled Member Info */}
        {formdata.memberName ? (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', color: '#166534', fontWeight: 600 }}>
            ✅ Member found: <strong>{formdata.memberName}</strong>
            {formdata.memberType ? ` — Type: ${formdata.memberType}` : ''}
            {formdata.memberAge ? ` — Age: ${formdata.memberAge}` : ''}
          </div>
        ) : null}

        {/* Form Fields */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

          {[
            { label: 'Member Name', name: 'memberName', readOnly: true },
            { label: 'Member Type', name: 'memberType', readOnly: true },
            { label: 'Age',         name: 'memberAge',  readOnly: true },
            {
              label: 'Designation',
              type: 'select',
              name: 'Designation',
              options: fdata,
            },
            { label: 'Create Password', name: 'password', type: 'password' },
            { label: 'Confirm Password', name: 'confirmpassword', type: 'password' },
          ].map((field, idx) => (
            <div key={idx} style={formItem}>
              <label style={labelStyle}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  required
                  value={field.name === 'Designation' ? formdata.designation_id : formdata[field.name]}
                  onChange={(e) => {
                    if (field.name === 'Designation') {
                      // Find the selected designation object to also store its _id
                      const selected = fdata.find(d => String(d._id || d.id || '') === e.target.value);
                      const dname = selected
                        ? (selected.designation_name || selected.designationName || selected.name || selected.Designation || '')
                        : '';
                      setformdata((p) => ({ ...p, Designation: dname, designation_id: e.target.value }));
                    } else {
                      setformdata({ ...formdata, [field.name]: e.target.value });
                    }
                  }}
                  style={inputStyle}
                >
                  <option value="">{desigLoading ? 'Loading...' : 'Select Designation'}</option>
                  {field.options.map((opt, i) => {
                    const name  = opt.designation_name || opt.designationName || opt.name || opt.Designation || '';
                    const optId = String(opt._id || opt.id || i);
                    return <option key={optId} value={optId}>{name}</option>;
                  })}
                </select>
              ) : (
                <input
                  required={!field.readOnly}
                  readOnly={field.readOnly || false}
                  value={formdata[field.name] || ''}
                  onChange={(e) =>
                    !field.readOnly && setformdata({ ...formdata, [field.name]: e.target.value })
                  }
                  type={field.type || 'text'}
                  style={{ ...inputStyle, background: field.readOnly ? '#f3f4f6' : undefined, cursor: field.readOnly ? 'not-allowed' : undefined }}
                />
              )}
            </div>
          ))}
        </div>



        <button type='submit' style={buttonStyle}>Apply</button>
      </form>
    </div>
  )
}

export default ApplyAgent

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
  color: '#b4a383'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #b4a383',
  onfocus: "#b4a383"
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
  marginBottom: 16
};
