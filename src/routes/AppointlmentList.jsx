import React, { useState,useEffect } from "react";
import { useLoader } from '../loader/LoaderContext';
import axios from 'axios';
const URL='https://b4658ed9d38b.ngrok-free.app'
const header= {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    }
const AppointmentCards = () => {

  const appointments =[
  {
    _id: '68a86cee3d850b284daa8db3',
    patient_name: 'Amber Kaur ',
    guardian_name: 'Talwinder Singh ',
    date_of_appointment: '2025-08-23',
    time_slot: '09:00 AM - 10:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755868397',
    whatsapp_number: '918360850016',
    date_of_birth: '2024-08-18',
    city: 'Mansa',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'Yes',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/aRWP39X',
    amount: 220,
    appoint_number: '20250823-1',
    appointment_index: 1,
    pay_id: 'pay_R8OcB1KBcazmqk'
  },
  {
    _id: '68a885fc3d850b284daa8db4',
    patient_name: 'Hargun kaur sidhu ',
    guardian_name: 'Navdeep singh ',
    date_of_appointment: '2025-08-23',
    time_slot: '09:00 AM - 10:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755874809',
    whatsapp_number: '919815964071',
    date_of_birth: '2017-04-13',
    city: 'Maur mandi ',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/X1iXlzcr',
    amount: 220,
    appoint_number: '20250823-2',
    appointment_index: 2,
    pay_id: 'pay_R8QFfsoxRn4sIc'
  },
  {
    _id: '68a921023d850b284daa8db5',
    patient_name: 'Alina',
    guardian_name: 'Jatinder kumar',
    date_of_appointment: '2025-08-23',
    time_slot: '09:00 AM - 10:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755914496',
    whatsapp_number: '917973795479',
    date_of_birth: '2021-08-01',
    city: 'Bathinda ',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/ASyaf5eJ',
    amount: 220,
    appoint_number: '20250823-3',
    appointment_index: 3,
    pay_id: 'pay_R8bWZeh3pfyuXR'
  },
  {
    _id: '68a926b63d850b284daa8db6',
    patient_name: 'Kiyansh singla',
    guardian_name: 'Sahil singla',
    date_of_appointment: '2025-08-23',
    time_slot: '11:00 AM - 12:00 PM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755915956',
    whatsapp_number: '918699267255',
    date_of_birth: '2024-08-01',
    city: 'Raman mandi',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'Yes',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/PtYS2P6',
    amount: 220,
    appoint_number: '20250823-4',
    appointment_index: 26,
    pay_id: 'pay_R8bunWVuttK9Pv'
  },
  {
    _id: '68a9e3b73d850b284daa8db7',
    patient_name: 'Chirag bansal',
    guardian_name: 'Bhinder bansal',
    date_of_appointment: '2025-08-24',
    time_slot: '10:00 AM - 11:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755964341',
    whatsapp_number: '917307342948',
    date_of_birth: '2025-06-04',
    city: 'Ghudda',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/NgKD3jm',
    amount: 220,
    appoint_number: '20250824-1',
    appointment_index: 11,
    pay_id: 'pay_R8pfPmCnd04UXX'
  },
  {
    _id: '68a9fcb93d850b284daa8db8',
    patient_name: 'Prishita ',
    guardian_name: 'Bhushan ',
    date_of_appointment: '2025-08-24',
    time_slot: '09:00 AM - 10:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1755970743',
    whatsapp_number: '919589551471',
    date_of_birth: 'none',
    city: 'none',
    address: 'none',
    role: 'appointment',
    status: 'created',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'link generated',
    razorpay_url: 'https://rzp.io/rzp/OpOVIED'
  },
  {
    _id: '68abc1053d850b284daa8db9',
    patient_name: 'Japrozz',
    guardian_name: 'Ravinder',
    date_of_appointment: '2025-08-25',
    time_slot: '10:00 AM - 11:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1756086530',
    whatsapp_number: '918699735045',
    date_of_birth: '2017-01-27',
    city: 'Bathinda',
    address: 'none',
    role: 'appointment',
    status: 'created',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'link generated',
    razorpay_url: 'https://rzp.io/rzp/zKSEuh3'
  },
  {
    _id: '68abc17d3d850b284daa8dba',
    patient_name: 'Rabaab Vir',
    guardian_name: 'Ravinder',
    date_of_appointment: '2025-08-25',
    time_slot: '10:00 AM - 11:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1756086651',
    whatsapp_number: '918699735045',
    date_of_birth: '2021-03-31',
    city: 'Bathinda',
    address: 'none',
    role: 'appointment',
    status: 'created',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'link generated',
    razorpay_url: 'https://rzp.io/rzp/uxqSU3X'
  },
  {
    _id: '68abcba83d850b284daa8dcb',
    patient_name: 'Guggu',
    guardian_name: 'Mayank garg',
    date_of_appointment: '2025-08-25',
    time_slot: '10:00 AM - 11:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1756089254',
    whatsapp_number: '917888898914',
    date_of_birth: 'none',
    city: 'none',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/eVfLjpGk',
    amount: 220,
    appoint_number: '20250825-1',
    appointment_index: 11,
    pay_id: 'pay_R9P80vF63PVmch'
  },  {
    _id: '68abcba83d850b284daa8dbb',
    patient_name: 'Rahul',
    guardian_name: 'Mayank garg',
    date_of_appointment: '2025-08-30',
    time_slot: '10:00 AM - 11:00 AM',
    doctor_phone_id: '67ee5e1bde4cb48c515073ee',
    email: 'none',
    symptoms: 'none',
    age: 'none',
    timestamp: '1756089254',
    whatsapp_number: '917888898914',
    date_of_birth: 'none',
    city: 'none',
    address: 'none',
    role: 'appointment',
    status: 'success',
    createdAt: 'x',
    vaccine: 'No',
    payment_status: 'paid',
    razorpay_url: 'https://rzp.io/rzp/eVfLjpGk',
    amount: 220,
    appoint_number: '20250825-1',
    appointment_index: 11,
    pay_id: 'pay_R9P80vF63PVmch'
  }
];

//   // Removed "Dr." from the doctor's name
//   const doctorName = "Amit Sharma";

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
   const { showLoader, hideLoader } = useLoader();
   const [appointmentlist, setappointmentlist] = useState([])


 const fetchappoints = async () => {
    showLoader()
    try {
      const res = await axios.get(URL+'/appointments/get_agent_appoint/H0001',header);
      console.log(res.data)
      setappointmentlist(res.data)
    } catch (err) {
      console.error(err);
    }finally{
      hideLoader()
    }
  };
    useEffect(() => {
   fetchappoints()
  }, [])

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth || dateOfBirth === 'none') {
    return 'N/A';
  }
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr); 
};

const formatAppointmentDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const getAppointmentStatus = (appointmentDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const apptDate = new Date(appointmentDate);
  apptDate.setHours(0, 0, 0, 0);screen

  if (apptDate < today) {
    return { text: "Completed", color: "#065f46", background: "#d1fae5" }; // green
  } else if (apptDate.getTime() === today.getTime()) {
    return { text: "Ongoing", color: "#4f4e8eff", background: "#ecd888ff" }; // yellow
  } else {
    return { text: "Upcoming", color: "#991b1b", background: "#dfb0b0ff" }; // red
  }
};
  const filteredAppointments = appointmentlist.filter((appt) => {
    const apptDateForFilter = parseDate(appt.date_of_appointment);
    const fromDateForFilter = parseDate(fromDate);
    const toDateForFilter = parseDate(toDate);

    if (fromDateForFilter && apptDateForFilter < fromDateForFilter) return false;
    if (toDateForFilter && apptDateForFilter > toDateForFilter) return false;
    return true;
  });

  const mainContainerStyle = {
    padding: "24px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  };

  const innerContainerStyle = {
    maxWidth: "1280px",
    margin: "0 auto",
  };

  const headerStyle = {
    fontSize: "3.5rem",
    fontWeight: "800",
    marginBottom: "32px",
    textAlign: "center",
    color: "#1f2937",
  };

  const filterContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "32px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
  };

  const cardGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const cardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
    marginBottom: "12px",
  };

  const cardTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  };

  const cardBadgeStyle = {
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "0.9rem",
    fontWeight: "600",
  };

  const cardInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#4b5563",
    fontSize: "1rem",
    fontWeight: "500",
  };

  const iconStyle = {
    width: "20px",
    height: "20px",
    color: "#2563eb",
  };

  const noAppointmentsStyle = {
    textAlign: "center",
    padding: "16px",
    color: "#6b7280",
    fontSize: "1.2rem",
    fontWeight: "500",
  };

  return (
    <div style={mainContainerStyle}>
      <div style={innerContainerStyle}>
  <h1 style={headerStyle}>
   <i 
            className="fa-solid fa-arrow-left"
            style={{
              position: 'absolute',
              left: '12%',
              top: '21%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '22px',
              color: '#b4a383',
              marginLeft: '10px'
            }}
            onClick={() => window.history.back()} // Or use your custom navigate(-1) if using React Router
          ></i>Appointment List
        </h1>


{/*         <h1 style={headerStyle}>
          Appointment List
        </h1> */}

        <div style={filterContainerStyle}>
          <div>
            <label htmlFor="fromDate" style={{ display: "block", marginBottom: "4px", fontSize: "1.1rem", fontWeight: "500", color: "#374151" }}>From Date</label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ width: "100%", padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", transition: "border-color 0.2s, box-shadow 0.2s" }}
            />
          </div>
          <div>
            <label htmlFor="toDate" style={{ display: "block", marginBottom: "4px", fontSize: "1.1rem", fontWeight: "500", color: "#374151" }}>To Date</label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ width: "100%", padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)", transition: "border-color 0.2s, box-shadow 0.2s" }}
            />
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <div style={cardGridStyle}>
            {filteredAppointments.map((appt) => {
              const status = getAppointmentStatus(appt.date_of_appointment);
              return (
                <div
                  key={appt._id}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div style={cardHeaderStyle}>
                    <h3 style={cardTitleStyle}>{appt.patient_name}</h3>
                    <span style={{ ...cardBadgeStyle, backgroundColor: status.background, color: status.color }}>
                      {status.text}
                    </span>
                </div>

                  <div style={cardInfoStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                    </svg>
                    <span>{formatAppointmentDate(appt.date_of_appointment)} - {appt.time_slot}</span>
                  </div>
                  
                  <div style={cardInfoStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                      <path fillRule="evenodd" d="M1.5 8.25a.75.75 0 01.75-.75h18a.75.75 0 010 1.5h-18a.75.75 0 01-.75-.75zM1.5 15.75a.75.75 0 01.75-.75h18a.75.75 0 010 1.5h-18a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                    <span>{appt.doctor_name}</span>
                  </div>
                  
                  <div style={cardInfoStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                      <path d="M11.75 1.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V2.25a.75.75 0 00-.75-.75z" />
                      <path fillRule="evenodd" d="M12 21a9 9 0 100-18 9 9 0 000 18zm.75-10.5a.75.75 0 00-1.5 0V18a.75.75 0 001.5 0v-7.5z" clipRule="evenodd" />
                    </svg>
                    <span>Age: {calculateAge(appt.date_of_birth)}</span>
                  </div>
                  
                  <div style={cardInfoStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={iconStyle}>
                      <path fillRule="evenodd" d="M1.5 8.25a.75.75 0 01.75-.75h18a.75.75 0 010 1.5h-18a.75.75 0 01-.75-.75zM1.5 15.75a.75.75 0 01.75-.75h18a.75.75 0 010 1.5h-18a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                    <span>Mobile: +{appt.whatsapp_number}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={noAppointmentsStyle}>
            No appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCards;
