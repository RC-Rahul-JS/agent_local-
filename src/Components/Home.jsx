import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { IoLogOutOutline, IoListCircleOutline } from 'react-icons/io5';
import FirstRoute from './FirstRoute';
import SecondRoute from './SecondRoute';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Home = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem('AUID');
  //   navigate('/login');
  // };

  const handleLogout = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Do you want to logout?",
      text: "You'll be logged out of this session.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
    });

    if (isConfirmed) {
      try {
        localStorage.removeItem('AUID');
        navigate('/login');
      } catch (err) {
        Swal.fire("Error", "Logout failed. Try again.", "error");
      }
    }
  };


  const renderContent = () => {
    switch (index) {
      case 0:
        return <FirstRoute />;
      case 1:
        return <SecondRoute />;
      default:
        return null;
    }
  };



   useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Do you want to logout?",
        text: "You'll be logged out of this session.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, go back",
        cancelButtonText: "Stay here",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('AUID');
        navigate('/login');
        } else {
          // push user back to current route
          navigate(window.location.pathname, { replace: true });
        }
      });
    };

    // force pushState so that back button always fires popstate
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);
 


  return (
    <div>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        width: '100vw',
        boxSizing:"border-box",
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#b4a383'
        }}>
          Agent
        </span>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 15
        }}>
          <button onClick={() => navigate('/requests')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <IoListCircleOutline size={25} color="#b4a383" />
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <IoLogOutOutline size={25} color="#b4a383" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: 'white', display: 'flex' }}>
        {['Loan A/c', 'Wallet'].map((title, idx) => (
          <div
            key={idx}
            onClick={() => setIndex(idx)}
            style={{
              flex: 1,
              fontSize:16,
              padding: '10px 0',
              textAlign: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: index === idx ? '#b4a383' : '#E3DAC8',
              borderBottom: index === idx ? '2px solid #b4a383' : '2px solid transparent'
            }}
          >
            {title}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Home;
