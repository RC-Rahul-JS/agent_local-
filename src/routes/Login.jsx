import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoader } from "../loader/LoaderContext";
import { BASE_URL } from '../config/api';

const Login = () => {
  const { showLoader, hideLoader } = useLoader();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please fill in both fields.");
      return;
    }
    
    try {
      showLoader();
      // Use BASE_URL + /agent/login
      const api = `${BASE_URL}/agent/login`;
      const payload = {
        agentCode: username,
        password: password
      };
      
      const res = await axios.post(api, payload);
      
      if (res.data && res.data.success) {
        const user = res.data.data;
        console.log("Login successful:", user);
        
        // Save user data to localStorage
        localStorage.setItem('AUID', user.agentCode || username);
        localStorage.setItem('Name', `${user.FirstName || ''} ${user.LastName || ''}`.trim());
        localStorage.setItem('MID', user.memberId || '');
        
        // Save additional agent-specific details returned from the backend
        if (user.isAgent !== undefined) localStorage.setItem('isAgent', user.isAgent);
        if (user.agentStatus) localStorage.setItem('agentStatus', user.agentStatus);
        if (user.branchCode) localStorage.setItem('branchCode', user.branchCode);
        if (user.branchName) localStorage.setItem('branchName', user.branchName);
        if (user.designationCode) localStorage.setItem('designationCode', user.designationCode);
        if (user.designationName) localStorage.setItem('designationName', user.designationName);
        
        toast.success(res.data.message || "Login successful!");
        navigate('/');
      } else {
        toast.error(res.data?.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      hideLoader();
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e3c72, #2a5298, #ff4e50, #f9d423)",
        backgroundSize: "cover",
        fontFamily: "Arial, sans-serif",
        padding: "1rem"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "10px",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem"
        }}
      >
        <div style={{textAlign:'center'}}>

       
      <img src="mlogo.png" alt="img" style={{width:150,height:150,textAlign:'center'}}/>
       </div>
        <h2 style={{ textAlign: "center", color: "white" }}>Login</h2>

        <div style={{ position: "relative" }}>
            <i
                className="fas fa-user"
                style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#aaa",
                }}
            />
            <input
                type="text"
                placeholder="User Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                padding: "0.75rem 0.75rem 0.75rem 2.5rem", // left padding for icon
                borderRadius: "5px",
                border: "none",
                outline: "none",
                fontSize: "1rem",
                width: "100%",
                }}
            />
            </div>

            <div style={{ position: "relative" }}>
                <i
                    className="fas fa-lock"
                    style={{
                    position: "absolute",
                    top: "50%",
                    left: "12px",
                    transform: "translateY(-50%)",
                    color: "#aaa",
                    }}
                />  
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                    padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                    borderRadius: "5px",
                    border: "none",
                    outline: "none",
                    fontSize: "1rem",
                    width: "100%",
                    }}
                />
                </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.9rem",
            color: "white",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />{" "}
            Remember Me
          </label>
          {/* <a href="#" style={{ color: "#eee", textDecoration: "underline" }}>
            Forgot?
          </a> */}
        </div>

        <button
          onClick={handleLogin}
          style={{
            padding: "0.75rem",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#ffffffaa",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#fff")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ffffffaa")}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
