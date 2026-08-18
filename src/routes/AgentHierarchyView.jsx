import React, { useState ,useEffect} from 'react';
  import { database } from '../DB/Firebase';
  import { get, ref } from 'firebase/database';

const AgentHierarchyView = () => {
  
  const [agents, setagents] = useState([])

  let AUID= localStorage.getItem("AUID")

  useEffect(() => {
   (async()=>{
    try {
        let snap= await get( ref(database, 'Agent/Agents'))
        console.log(Object.values(snap.val()))
        setagents(Object.values(snap.val()))
    } catch (error) {
        console.log(error)
    }
   })()
  }, [])

  const getDownlineAgents = (agents, managerId) => {
  const downline = [];
console.log(managerId)
  const collectSubordinates = (id) => {
    agents.forEach(agent => {
      if (agent.IntroCode === id) {
        downline.push(agent);
        collectSubordinates(agent.Code); // Recursively add their reports
      }
    });
  };
  collectSubordinates(managerId);
  return downline;
};
  
const myTeam = AUID ? getDownlineAgents(agents, AUID) : [];
  // Group agents by Designation
  const groupedByDesignation = myTeam.reduce((acc, agent) => {
    const { Designation } = agent;
    if (!acc[Designation]) acc[Designation] = [];
    acc[Designation].push(agent);
    return acc;
  }, {});

  // Sort designations by hierarchy (optional)
  const designationOrder = [
    "Regional Manager",
    "Area Manager",
    "Team Leader",
    "Senior Officer",
    "Officer",
    "Executive"
  ];

  const sortedDesignations = Object.keys(groupedByDesignation).sort((a, b) => {
    return designationOrder.indexOf(a) - designationOrder.indexOf(b);
  });

  // Collapsible state
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (desig) => {
    setOpenGroups(prev => ({ ...prev, [desig]: !prev[desig] }));
  };

  // Inline Styles
  const pageStyle = {
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.6',
    maxWidth: '100%',
    margin: '0 auto',
  };

  const headerStyle = {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '20px',
    borderBottom: '2px solid #3498db',
    paddingBottom: '8px',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    marginBottom: '12px',
    padding: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
  };

  const titleStyle = (isOpen) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
    color: '#2980b9',
    cursor: 'pointer',
    marginBottom: '8px',
  });

  const countBadge = {
    backgroundColor: '#e0e0e0',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#555',
  };

  const agentItemStyle = {
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
    fontSize: '13.5px',
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#2c3e50',
    display: 'inline-block',
    minWidth: '80px',
    fontSize: '13px',
  };

  const valueStyle = {
    color: '#555',
    marginLeft: '8px',
    fontSize: '13px',
  };

  return (
    <div style={pageStyle}>
       <h2 style={headerStyle}>
      <i 
            className="fa-solid fa-arrow-left"
            style={{
              position: 'absolute',
              left: '14%',
              top: '4%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#b4a383',
              marginLeft: '10px'
            }}
            onClick={() => window.history.back()} 
          ></i>Book Appointment
          
     Agents Under You</h2>

      {sortedDesignations.map((designation) => {
        const agents = groupedByDesignation[designation];
        const isOpen = openGroups[designation] !== false; // default open

        return (
          <div key={designation} style={cardStyle}>
            <div style={titleStyle(isOpen)} onClick={() => toggleGroup(designation)}>
              <span>{designation}</span>
              <span style={countBadge}>
                {agents.length} Agent{agents.length !== 1 ? 's' : ''}
                <span> ▼</span>
              </span>
            </div>

            {isOpen && (
              <div>
                {agents.map((agent) => (
                  <div key={agent.AgentId} style={agentItemStyle}>
                    <div><strong>{agent?.mdata?.Title} {agent?.mdata?.FirstName} {agent?.mdata?.LastName}</strong></div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={labelStyle}>ID:</span>
                      <span style={valueStyle}>{agent.Code}</span>
                    </div>
                    <div>
                      <span style={labelStyle}>Report To:</span>
                      <span style={valueStyle}>{agent.IntroCode}</span>
                    </div>
                    <div>
                      <span style={labelStyle}>Phone:</span>
                      <span style={valueStyle}>{agent?.mdata?.MobileNo}</span>
                    </div>
                    {/* <div>
                      <span style={labelStyle}>Email:</span>
                      <span style={valueStyle}>{agent.Email}</span>
                    </div> */}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#aaa' }}>
        Total Agents: {myTeam.length}
      </div>
    </div>
  );
};

export default AgentHierarchyView;