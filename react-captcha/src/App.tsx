import Turnstile from "react-turnstile";

import "./App.css";
import axios from "axios";
import { useState } from "react";

function App() {
  const [token, setToken] = useState<string>("");

  return (
    <>
      <input placeholder="OTP"></input>
      <input placeholder="New password"></input>

      <Turnstile
        onSuccess={(token) => {
          setToken(token);
        }}
        sitekey="0x4AAAAAABca7vLG2EcjPTPr"
      />

      <button
        onClick={() => {
          axios.post("http://localhost:3000/reset-password", {
            email: "harkirat@gmail.com",
            otp: "123456",
            newPassword: "password",
            token: token,
          });
        }}
      >
        Update password
      </button>
    </>
  );
}

export default App;
