import { useNavigate } from 'react-router-dom';
import React from 'react'
import {useLocation} from 'react-router-dom'

const MemberDetails = () => {
  const navigate = useNavigate();

      const location = useLocation();
  const { Data } = location.state;
  // let member = {
  //   Aadhar: "497461808451",
  //   Age: 40,
  //   AreaInAcre: "5",
  //   AreaInHectare: 2.02343,
  //   BranchCode: "001",
  //   BranchName: "Bathinda",
  //   Category: "OBC",
  //   City: "Seoni",
  //   CustomerCode: "001000001",
  //   DateOfBirth: "1985-06-15",
  //   District: "Seoni",
  //   Duration: "1",
  //   Email: "harish.bhardwaj2022@gmail.com",
  //   EmpID: "admin",
  //   FatherName: "Jagdish Bhardwaj",
  //   FirstName: "Harish",
  //   Gender: "Male",
  //   GurAge: "40",
  //   GurName: "Harish Kumar Bhardwaj",
  //   GurRelationship: "father",
  //   KycAddProof: "PAN",
  //   KycDocNo: "497461808451",
  //   KycIdproof: "Aadhar",
  //   KycOther: "",
  //   KycTdocNo: "BBYPB4685E",
  //   KycTother: "",
  //   LastName: "Bhardwaj",
  //   MemberCategory: "Ordinary",
  //   MemberId: "001000001",
  //   MemberName: "Neha Singh",
  //   MobileNo: "8319633066",
  //   MonthlyIncome: "50000",
  //   NomAddress: "Arera colony, Bhopal",
  //   NomAge: 3,
  //   NomDOB: "2022-11-09",
  //   NomName: "Laksh Bhardwaj",
  //   NomRelation: "son",
  //   Occupation: "Director",
  //   OfficialAdd: "Belgaon, Seoni",
  //   PermanentAdd: "153, Belgaon, Seoni",
  //   PinCode: "480661",
  //   RCity: "Seoni",
  //   RDistrict: "Seoni",
  //   RPinCode: "480661",
  //   ReceiptDate: "2025-08-15",
  //   RelationOf: "S/o",
  //   ResidenceAdd: "153, Belgaon, Seoni",
  //   Rstate: "Madhya Pradesh",
  //   SameAddress: "No",
  //   State: "Madhya Pradesh",
  //   Status: "Approved",
  //   Title: "Mr",
  //   UploadAddress: "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/customer_doc%2F2025-08-15%2Fblob2025-08-15-06-18-271301904646?alt=media",
  //   UploadAddress2: "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/customer_doc%2F2025-08-15%2Fblob2025-08-15-06-18-371995416512?alt=media",
  //   UploadId: "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/customer_doc%2F2025-08-15%2Fblob2025-08-15-06-18-248240776035?alt=media",
  //   UploadId2: "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/customer_doc%2F2025-08-15%2Fblob2025-08-15-06-18-346672103865?alt=media",
  //   UploadPhoto: "https://firebasestorage.googleapis.com/v0/b/duniyamart-e69a1.appspot.com/o/customer_doc%2F2025-08-15%2Fblob2025-08-15-06-18-301728946299?alt=media"
  // };
  let member={...Data}

  // Inline styles for mobile responsiveness
  const pageStyle = {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    padding: '16px',
    backgroundColor: '#f7f9fc',
    color: '#333',
    maxWidth: '100%',
    margin: '0 auto',
    lineHeight: '1.6',
    fontSize: '14px',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#2c3e50',
    borderBottom: '2px solid #3498db',
    paddingBottom: '8px',
    fontSize: '18px',
    fontWeight: '600',
    position: 'relative'
  };

  const sectionStyle = {
    marginBottom: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: '10px',
    borderBottom: '1px dashed #bdc3c7',
    paddingBottom: '4px',
  };

  const rowStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '8px',
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '6px',
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '13px',
  };

  const valueStyle = {
    fontSize: '13px',
    color: '#7f8c8d',
    marginTop: '2px',
    wordWrap: 'break-word',
  };

  const imageContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  };

  const imageStyle = {
    width: '100%',
    maxWidth: '140px',
    height: 'auto',
    borderRadius: '6px',
    border: '1px solid #ddd',
    objectFit: 'cover',
  };

  const statusBadge = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: member.Status === 'Approved' ? '#d4edda' : '#f8d7da',
    color: member.Status === 'Approved' ? '#155724' : '#721c24',
    marginLeft: '8px',
  };

   return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>
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
        ></i>Member Details
        <span style={statusBadge}>{member.Status}</span>
      </h2>

      {/* Personal Information */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Personal Information</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Name</span>
          <span style={valueStyle}>{member.Title} {member.FirstName} {member.LastName}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Father's Name</span>
          <span style={valueStyle}>{member.FatherName} ({member.RelationOf})</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Date of Birth</span>
          <span style={valueStyle}>{member.DateOfBirth}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Age</span>
          <span style={valueStyle}>{member.Age}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Gender</span>
          <span style={valueStyle}>{member.Gender}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Mobile</span>
          <span style={valueStyle}>{member.MobileNo}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Email</span>
          <span style={valueStyle}>{member.Email}</span>
        </div>
      </div>

      {/* Address Information */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Address Information</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Residence Address</span>
          <span style={valueStyle}>{member.ResidenceAdd}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Permanent Address</span>
          <span style={valueStyle}>{member.PermanentAdd}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>City / District / State / Pin</span>
          <span style={valueStyle}>
            {member.City}, {member.District}, {member.State} - {member.PinCode}
          </span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Same Address?</span>
          <span style={valueStyle}>{member.SameAddress}</span>
        </div>
      </div>

      {/* KYC & ID Proof */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>KYC & Identity</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Aadhar Number</span>
          <span style={valueStyle}>{member.Aadhar}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>ID Proof</span>
          <span style={valueStyle}>{member.KycIdproof}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Address Proof</span>
          <span style={valueStyle}>{member.KycAddProof}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Document Number</span>
          <span style={valueStyle}>{member.KycTdocNo}</span>
        </div>
      </div>

      {/* Financial & Membership */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Membership & Financial</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Member ID</span>
          <span style={valueStyle}>{member.MemberId}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Customer Code</span>
          <span style={valueStyle}>{member.CustomerCode}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Branch</span>
          <span style={valueStyle}>{member.BranchName} ({member.BranchCode})</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Category</span>
          <span style={valueStyle}>{member.Category}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Monthly Income</span>
          <span style={valueStyle}>₹{parseInt(member.MonthlyIncome).toLocaleString()}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Occupation</span>
          <span style={valueStyle}>{member.Occupation}</span>
        </div>
      </div>

      {/* Nominee Details */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Nominee Details</h3>
        <div style={rowStyle}>
          <span style={labelStyle}>Nominee Name</span>
          <span style={valueStyle}>{member.NomName}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Relation</span>
          <span style={valueStyle}>{member.NomRelation}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Nominee Age</span>
          <span style={valueStyle}>{member.NomAge}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Nominee DOB</span>
          <span style={valueStyle}>{member.NomDOB}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Nominee Address</span>
          <span style={valueStyle}>{member.NomAddress}</span>
        </div>
      </div>

      {/* Uploaded Documents */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Uploaded Documents</h3>

        <div style={rowStyle}>
          <span style={labelStyle}>Photo</span>
          <img src={member.UploadPhoto} alt="Member Photo" style={imageStyle} />
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>ID Proof (Aadhar)</span>
          <div style={imageContainerStyle}>
            <img src={member.UploadId} alt="ID Proof" style={imageStyle} />
            {member.UploadId2 && <img src={member.UploadId2} alt="ID Proof 2" style={imageStyle} />}
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Address Proof (PAN)</span>
          <div style={imageContainerStyle}>
            <img src={member.UploadAddress} alt="Address Proof" style={imageStyle} />
            {member.UploadAddress2 && <img src={member.UploadAddress2} alt="Address Proof 2" style={imageStyle} />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#95a5a6' }}>
        Receipt Date: {member.ReceiptDate} | Generated by: {member.EmpID}
      </div>
    </div>
  );
}

export default MemberDetails