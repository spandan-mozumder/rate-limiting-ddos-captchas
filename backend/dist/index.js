"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
const SECRET_KEY = "0x4AAAAAABca7mTT32b0ohnp66Ze9JYyR8g";
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: "Too many requests, please try again after 5 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
const passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many password reset attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});
const otpStore = {};
app.post("/generate-otp", otpLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    console.log(`OTP for ${email}: ${otp}`);
    return res.status(200).json({ message: "OTP generated and sent to email" });
}));
app.post("/reset-password", passwordResetLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp, newPassword, token } = req.body;
    let formData = new FormData();
    formData.append("secret", SECRET_KEY);
    formData.append("response", token);
    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = yield fetch(url, {
        body: formData,
        method: "POST",
    });
    console.log(yield result.json());
    const challengeSucceeded = (yield result.json()).success;
    if (!challengeSucceeded) {
        return res.status(403).json({ message: "Invalid reCAPTCHA token" });
    }
    if (!email || !otp || !newPassword) {
        return res
            .status(400)
            .json({ message: "Email, OTP and new password are required" });
    }
    if (otpStore[email] === otp) {
        console.log(`Password reset for ${email} has been reset to: ${newPassword}`);
        delete otpStore[email];
        return res.status(200).json({ message: "Password reset successfully" });
    }
    else {
        return res.status(401).json({ message: "Invalid OTP" });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
