import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();
const PORT = 3000;

const SECRET_KEY = "0x4AAAAAABca7mTT32b0ohnp66Ze9JYyR8g";

app.use(express.json());
app.use(cors());

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: "Too many requests, please try again after 5 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Too many password reset attempts, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpStore: Record<string, string> = {};

app.post("/generate-otp", otpLimiter, async (req, res): Promise<any> => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  console.log(`OTP for ${email}: ${otp}`);
  return res.status(200).json({ message: "OTP generated and sent to email" });
});

app.post(
  "/reset-password",
  passwordResetLimiter,
  async (req, res): Promise<any> => {
    const { email, otp, newPassword, token } = req.body;

    let formData = new FormData();
    formData.append("secret", SECRET_KEY);
    formData.append("response", token);

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    console.log(result.json());

    const challengeSucceeded = (await result.json()).success;

    if (!challengeSucceeded) {
      return res.status(403).json({ message: "Invalid reCAPTCHA token" });
    }

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    if (otpStore[email] === otp) {
      console.log(
        `Password reset for ${email} has been reset to: ${newPassword}`
      );
      delete otpStore[email];
      return res.status(200).json({ message: "Password reset successfully" });
    } else {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
