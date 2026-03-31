import { useNavigate } from "react-router-dom";
import withAuth from "../utils/withAuth";
import { useContext, useState } from "react";
import RestoreIcon from "@mui/icons-material/Restore";
import { Button, IconButton, TextField } from "@mui/material";
import "../App.css";
import { AuthContext } from "../contexts/AuthContext";
import Navbar from "./Navbar";

function Home() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");


const {addToUserHistory} = useContext(AuthContext);

  let handleJoinVideoCall = async (e) => {
    const trimmedCode = meetingCode.trim();

    if (!trimmedCode) {
      setError("Please enter a meeting code.");
      return;
    }

    if (trimmedCode.length < 5) {
      setError("Meeting code must be at least 5 characters long.");
      return;
    }


    await addToUserHistory(trimmedCode);
    navigate(`/${trimmedCode}`);
  };

  return (
    <>
      <Navbar />

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2 style={{ marginBottom: "20px" }}>
              Providing Quality Video Call Just Like Quality Education
            </h2>

            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => {
                  setMeetingCode(e.target.value);
                  if (error) {
                    setError("");
                  }
                }}
                id="outlined-basic"
                label="Meeting Code"
                placeholder="Ex : ZHDFBJE"
                variant="outlined"
                error={!!error} 
                helperText={error}
              />
              <Button onClick={handleJoinVideoCall} style={{height:"50px",width:"90px"}} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo3.png" alt="Meet your loved ones" />
        </div>
      </div>
    </>
  );
}

export default withAuth(Home);
