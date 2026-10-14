import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const FirstRoute = () => {
  const navigate = useNavigate();
  const iconList = [
    { id: 3, name: 'Add Member', icon: 'fa-solid fa-user-plus', action: 'addmember' },
    { id: 9, name: 'Member List', icon: 'fa-solid fa-handshake', action: 'memberlist' },
    { id: 2, name: 'Apply Loan', icon: 'fa-solid fa-landmark', action: 'applyloan' },
    { id: 1, name: 'Loan List', icon: 'fa-solid fa-list', action: 'loanlist' },
    { id: 5, name: 'Apply Agent', icon: 'fa-solid fa-user-secret', action: 'agent' },
    { id: 8, name: 'Agent List', icon: 'fa-solid fa-network-wired', action: 'agentsview' },
    { id: 4, name: 'Commision', icon: 'fa-solid fa-sack-dollar', action: 'commission' },
    { id: 10, name: 'Comm Slab', icon: 'fa-solid fa-layer-group', action: 'commission-slabs' },
    { id: 6, name: 'Change Pswd', icon: 'fa-solid fa-user-lock', action: 'change' },
    { id: 7, name: 'TPIN', icon: 'fa-solid fa-user-lock', action: 'tpin_manage' },
    { id: 11, name: 'Dr. Appoint', icon: 'fa-solid fa-user-doctor', action: 'dr_appointment' },
    { id: 12, name: 'Appoint List', icon: 'fa-solid fa-clipboard-list', action: 'appointment_list' },
  ];

  const handleIconClick = (item) => {
    if (item.action) {
      navigate('/' + item.action.replace(/^\//, ''));
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Coming Soon',
        text: 'Doctor appointment feature will be available soon.',
        confirmButtonColor: '#385FBF',
      });
    }
  };

  const [searchText, setSearchText] = useState("");
  const [info, setInfo] = useState({});

  const getOrder = () => {
    // Simulate fetch
    console.log(`Searching for order ID: ${searchText}`);
  };

  return (
    <div style={{ width: '100%', backgroundColor: 'white', minHeight: '100vh', padding: '20px',boxSizing:"border-box" }}>
      <div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: '16px',
  margin: '15px 0'
}}>
  {iconList.map((item) => (
    <button
      key={item.id}
      onClick={() => handleIconClick(item)}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        border: 'none', 
        background: 'none', 
        cursor: 'pointer',
        outline: 'none'
      }}
    >
      <div style={{ 
        backgroundColor: '#385FBF', 
        width: 50, 
        height: 50, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: 5 
      }}>
        <i className={item.icon} style={{ color: '#b4a383', fontSize: 25 }}></i>
      </div>
      <span style={{ fontSize: 12, marginTop: 5 }}>{item.name}</span>
    </button>
  ))}
</div>
      <hr/>
      {/* <div style={{background:"#eee",borderRadius:8,display:'flex',alignItems:"center",marginTop:10,backgroundColor:'#385FBF',padding:3}}>
        <i style={{padding:"0 12px",color: '#b4a383',fontSize:20}} className='fa fa-magnifying-glass'/>
        <input type='search' style={{padding:"10px 0",width:"88%",background:'transparent',border:"none",outline:"none",color:'#b4a383',fontSize:18}}/>
      </div>
      <div>
        <button style={{width:"100%",padding:10,fontSize:18,borderRadius:8,margin:"10px 0",fontWeight: '700', color: '#b4a383',cursor:"pointer",background:"#385FBF"}}>Search</button>
      </div> */}
      {/* Search box + search button UI will go next */}
    </div>
  );
};

export default FirstRoute;
