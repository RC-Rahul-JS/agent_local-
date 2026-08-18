import { useState } from "react";
import { ref,get } from 'firebase/database';
import { database } from '../DB/Firebase';  
import {toast} from 'react-toastify'

export default function TPIN({verified,close}) {
  const [tpin, setTpin] = useState(["", "", "", ""]);
 const agentId = localStorage.getItem("AUID");
  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newTpin = [...tpin];
      newTpin[index] = value;
      setTpin(newTpin);

      if (value && index < 3) {
        document.getElementById(`tpin-${index + 1}`).focus();
      }

      // Auto-submit when all digits filled
      if (newTpin.join("").length === 4) {
        handleSubmit(newTpin.join(""));
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !tpin[index] && index > 0) {
      document.getElementById(`tpin-${index - 1}`).focus();
    }
  };

  const handleSubmit = async(pin) => {
    try {
         let snap= await get( ref(database, `Agent/TPIN/${agentId}`))
        console.log(snap.val())
        let tpin = snap.val()?.tpin
        if(pin===tpin){
            verified()
        }else{
            console.log(pin,tpin)
            toast.error('Invalid TPIN !');
            setTpin(["", "", "", ""])
            document.getElementById(`tpin-0`).focus();
        }
    } catch (error) {
        console.log(error)
    }
    // alert("Entered TPIN: " + pin);
  };

  return (
    <div
      style={{
        margin: 0,
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f5f5f5",
        position:'fixed',
        top:0,
        right:0,
        left:0,
        bottom:0
      }}
    >
      <h2 style={{ marginBottom: 20, color: "#333" }}>Enter 4-Digit TPIN</h2>

      <div style={{ display: "flex", gap: 15 }}>
        {tpin.map((digit, i) => (
          <input
            key={i}
            id={`tpin-${i}`}
            type="password"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            style={{
              width: 50,
              height: 50,
              textAlign: "center",
              fontSize: 20,
              border: "1px solid #aaa",
              borderRadius: 10,
            }}
          />
        ))}
      </div>
    </div>
  );
}
