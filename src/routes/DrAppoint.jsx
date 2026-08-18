import React,{useState,useEffect} from 'react'
import { useLoader } from '../loader/LoaderContext';
import axios from 'axios';
import statejosn from './statedistrict.json';

const URL='https://b4658ed9d38b.ngrok-free.app'
const header= {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    }

const DrAppoint = () => {
   const { showLoader, hideLoader } = useLoader();
   const [doctors, setdoctors] = useState([])
   const [av_date, setav_date] = useState([])
   const [av_slot, setav_slot] = useState([])
    const initialFormData = {
      state:'',
      district:'',
      department:'',
      doctor:'',
      gender:'',
      patient:'',
      guardian:'',
    };
  const [formdata, setformdata] = useState(initialFormData);

  const fetchdoctors = async () => {
    showLoader()
    try {
      const res = await axios.get(URL+'/doctors',header);
      console.log(res.data)
      setdoctors(res.data)
    } catch (err) {
      console.error(err);
    }finally{
      hideLoader()
    }
  };
  const fetchdate = async (doctor_id) => {
    showLoader()
    try {
      const res = await axios.get(URL+'/get_date_schedule/'+doctor_id,header);
      console.log(res.data)
      setav_date(res?.data?.filter(item => item.enabled !== false) || []);
    } catch (err) {
      console.error(err);
    }finally{
      hideLoader()
    }
  };
  const fetchslot = async (date) => {
    showLoader()
    try {
      const res = await axios.get(URL+'/get_time_schedule/'+formdata.doctor+'/'+date,header);
      console.log(res.data)
      setav_slot(res.data)
    } catch (err) {
      console.error(err);
    }finally{
      hideLoader()
    }
  };
  useEffect(() => {
   fetchdoctors()
  }, [])

 function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob); // Parse the date of birth
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

      useEffect(() => {
        setformdata({...formdata,age:`${calculateAge(formdata.dob)}`})
      }, [formdata.dob])

  const create=async(e)=>{
    e.preventDefault();
    console.log(formdata)
    const payload={
    agent_id:'H0001',   
    patient_name: formdata.patient,
    guardian_name: formdata.guardian,
    date_of_appointment: formdata.date_of_appointment,
    time_slot: formdata.time_slot,
    doctor_phone_id: formdata.doctor,
    email: 'none',
    symptoms: formdata.symptoms,
    age: formdata.age,
    timestamp: Date.now(),
    phone: formdata.whatsapp_number,
    date_of_birth: formdata.dob,
    city: formdata.city,
    address: formdata.address,
    role: 'appointment',
    status: 'pending',
    createdAt: 'x',
    vaccine: formdata.vaccine
    }
    console.log(payload)
     showLoader()
    try {
      const res = await axios.post(URL+'/appointments/agent/create',payload,header);
      console.log(res.data)
    } catch (err) {
      console.error(err);
    }finally{
      hideLoader()
    }
  }
  

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
          ></i>Book Appointment
          </h2>
         <form onSubmit={create}>
  {/* Location Info */}
  <h3 style={{ margin: "20px 0 10px", color: "#333" }}>Location Info</h3>
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    {[
      {
        label: "State",
        type: "select",
        name: "state",
        options: statejosn,
      },
      {
        label: "District",
        type: "select",
        name: "district",
        options: formdata.state
          ? statejosn.find((s) => s.state === formdata.state)?.districts
          : [],
      },
    ].map((field, idx) => (
      <div key={idx} style={formItem}>
        <label style={labelStyle}>{field.label}</label>
        {field.type === "select" ? (
          <select
            required
            value={formdata[field.name]}
            onChange={(e) =>
              setformdata({ ...formdata, [field.name]: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Select</option>
            {field.options.map((opt, i) => (
              <option key={i}>
                {field.label === "State" ? opt.state : opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            required
            value={formdata[field.name]}
            onChange={(e) =>
              setformdata({ ...formdata, [field.name]: e.target.value })
            }
            type={field.type || "text"}
            style={inputStyle}
          />
        )}
      </div>
    ))}
  </div>

  {/* Appointment Details */}
  <h3 style={{ margin: "20px 0 10px", color: "#333" }}>Appointment Details</h3>
  <div style={formItem}>
    <label style={labelStyle}>Department</label>
    <select
      required
      value={formdata.department}
      onChange={(e) =>
        setformdata({ ...formdata, department: e.target.value })
      }
      style={inputStyle}
    >
      <option value="">Select</option>
      <option>Cardiologist</option>
      <option>Neurologist</option>
      <option>Gynecologist</option>
    </select>
  </div>

  <div style={formItem}>
    <label style={labelStyle}>Doctor</label>
    <select
      required
      value={formdata.doctor}
      onChange={(e) => {
        fetchdate(e.target.value);
        setformdata({ ...formdata, doctor: e.target.value });
      }}
      style={inputStyle}
    >
      <option value="">Select</option>
      {doctors.map((opt, i) => (
        <option key={i} value={opt._id}>
          {opt.name}
        </option>
      ))}
    </select>
  </div>

  <div style={formItem}>
    <label style={labelStyle}>Date</label>
    <select
      required
      value={formdata.date_of_appointment}
      onChange={(e) => {
        fetchslot(e.target.value);
        setformdata({ ...formdata, date_of_appointment: e.target.value });
      }}
      style={inputStyle}
    >
      <option value="">Select</option>
      {av_date.map((opt, i) => (
        <option key={i} value={opt.id}>
          {opt.title}
        </option>
      ))}
    </select>
  </div>

  <div style={formItem}>
    <label style={labelStyle}>Time Slot</label>
    <select
      required
      value={formdata.time_slot}
      onChange={(e) =>
        setformdata({ ...formdata, time_slot: e.target.value })
      }
      style={inputStyle}
    >
      <option value="">Select</option>
      {av_slot.map((opt, i) => (
        <option key={i} value={opt.id}>
          {opt.title}
        </option>
      ))}
    </select>
  </div>

  {/* Personal Info */}
  <h3 style={{ margin: "20px 0 10px", color: "#333" }}>Personal Info</h3>
  <div style={formItem}>
    <label style={labelStyle}>Gender</label>
    <select
      required
      value={formdata.gender}
      onChange={(e) => setformdata({ ...formdata, gender: e.target.value })}
      style={inputStyle}
    >
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
    </select>
  </div>

  <div style={{ display: "flex", flexWrap: "wrap" }}>
    {[
      { label: "Patient Name", name: "patient" },
      { label: "DOB", name: "dob", type: "date" },
      { label: "Age", name: "age", type: "number" },
      { label: "Guardian Name", name: "guardian" },
      { label: "Address", name: "address" },
      { label: "City", name: "city" },
      { label: "Whatsapp Number", name: "whatsapp_number", type: "number" },
      { label: "Symptoms", name: "symptoms" },
    ].map((field, idx) => (
      <div key={idx} style={formItem}>
        <label style={labelStyle}>{field.label}</label>
        <input
          required
          value={formdata[field.name]}
          onChange={(e) =>
            setformdata({ ...formdata, [field.name]: e.target.value })
          }
          type={field.type || "text"}
          style={inputStyle}
        />
      </div>
    ))}
  </div>

  {/* Other Info */}
  <h3 style={{ margin: "20px 0 10px", color: "#333" }}>Other Info</h3>
  <label>
    <input
      type="checkbox"
      name="vaccine"
      checked={formdata.vaccine}
      onChange={(e) =>
        setformdata({ ...formdata, vaccine: e.target.checked })
      }
      style={{ marginRight: 8, marginBottom: 25 }}
    />
    I am vaccinated
  </label>

  <button type="submit" style={buttonStyle}>
    Apply
  </button>
</form>

        </div>
      )}

export default DrAppoint

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

