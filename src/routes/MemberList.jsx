import React, { useState, useEffect } from 'react';
import { useLoader } from '../loader/LoaderContext';
import { toast } from 'react-toastify';
import personalLoanAnim from '../Components/personalLoanAnim.json'
import Lottie from 'react-lottie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL as localprimeBase } from '../config/api';

const shimmerStyle = {
  backgroundColor: '#f6f7f8',
  backgroundImage: 'linear-gradient(to right, #eeeeee 0%, #dddddd 50%, #eeeeee 100%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite linear',
};

const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

function getRandomLightColor() {
  const letters = '89ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

const MemberList = () => {
  const navigate = useNavigate();

   const [shimmer, setShimmer] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [members, setMembers] = useState([]);


  const fetch_members = async () => {
    try {
      showLoader();
      const MID = localStorage.getItem("MID");
      if (!MID) {
        toast.error("No MID found in localStorage");
        return;
      }

      // 1. Hit the API endpoint
      const api = `${localprimeBase}/get-members`;
      const res = await axios.get(api);
      
      // 2. Safely extract the array from the response
      let rawList = [];
      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray(res.data?.data)) {
        rawList = res.data.data;
      } else if (res.data?.data && typeof res.data.data === 'object') {
        rawList = [res.data.data];
      } else if (res.data && typeof res.data === 'object') {
        rawList = [res.data];
      }

      // Filter members introduced by this agent (MID)
      const agentMembers = rawList.filter(m => m.MemberId === MID);

      // 3. Filter for ONLY approved members & Normalize the data
      const approvedMembers = agentMembers
        .filter((item) => {
          // Look at the lowercase 'status' field (real approval status)
          const approvalStatus = (
            item.status || 
            item.request_status || 
            item.approval_status || 
            item.Status || 
            ''
          ).toString().toLowerCase().trim();
          // Keep only if they are approved
          return ['approved', 'active', 'accepted', 'verified'].includes(approvalStatus);
        })
        .map((item, idx) => {
          let extractedId = item.memberId || item.MemberNo || item.member_id || item.MemberId || '';
          if (!extractedId) extractedId = item._id || item.id || `MEM-${1000 + idx}`;
          
          const isMongoId = /^[a-f\d]{24}$/i.test(String(extractedId));
          const displayId = isMongoId ? `MEM-${String(idx + 1).padStart(4, '0')}` : String(extractedId);

          // Standardize the fields so your UI is easy to build
          return {
            ...item,
            id: item._id || item.id,
            // Safely grab the Member ID
            memberId: extractedId,
            // Combine First and Last Name
            fullName: `${item.FirstName || ''} ${item.LastName || ''}`.trim() || 'Unknown',
            mobile: item.MobileNo || item.Phone || item.mobile || 'N/A',
            branch: item.BranchName || item.branchName || item.branch_name || 'Main Branch',
            type: item.MemberCategory || item.memberCategory || item.MemberType || 'Ordinary',
            
            // --- Legacy fields required by the agent UI ---
            Title: item.Title || '',
            FirstName: item.FirstName || item.firstname || '',
            LastName: item.LastName || item.lastname || '',
            CustomerCode: displayId,
            UploadPhoto: item.UploadPhoto || ''
          };
        });

      // 4. Save to your React state
      console.log("Approved Members: ", approvedMembers);
      setMembers(approvedMembers);
    } catch (error) {
      console.error("Failed to fetch members: ", error);
      toast.error("Failed to fetch data.");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetch_members();
  }, []);

  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: personalLoanAnim,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const list = members;

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', fontFamily: 'Arial' }}>
      <style>{shimmerKeyframes}</style>
      <h2 style={{ textAlign: 'center',color: '#b4a383', fontSize: '18px', margin: '20px', position: 'relative' }}>
        
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
          onClick={() => navigate(-1)} 
        ></i>
            Member List
      </h2>

      <div style={{ padding: 20 }}>
        {(shimmer ? [1, 2, 3] : list).map((item, idx) => (
          <div key={idx} style={{
            border: '1px solid #E3E3E3',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 15
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  backgroundColor: shimmer ? '#eee' : getRandomLightColor(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={item.UploadPhoto} height={50} width={50} alt='profile' style={{borderRadius:8}}/>
                </div>
                <div style={{ paddingLeft: 10 }}>
                  <div style={shimmer ? { ...shimmerStyle, height: 14, width: 100 } : { fontSize: 14, fontWeight: 600 }}>{item?.Title} {item?.FirstName} {item?.LastName}</div>
                  <div style={shimmer ? { ...shimmerStyle, height: 10, width: 100 } : { fontSize: 12 }}>{item?.CustomerCode}</div>
                </div>
              </div>
            { !item.CustomerCode&& <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1474E1',
                  color: 'white',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(item.CustomerCode?'/member_details':"/firstmemberfee", { state: { Data: item} })}
              >
                {item.CustomerCode?"View Details":"Pay Now"}
              </button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
