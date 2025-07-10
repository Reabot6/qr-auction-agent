require("dotenv").config();
const { ethers } = require("ethers");

try {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log("Wallet loaded successfully:", wallet.address);
} catch (error) {
  console.error("Failed to load wallet:", error);
}
