require("dotenv").config();
const { ethers } = require("ethers");

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Auction contract setup
const contractAddress = "0xYourAuctionContractAddress";
const abi = [
  "event BidPlaced(address indexed bidder, uint256 amount)",
  "event AuctionWon(address indexed winner, uint256 amount)"
];
const contract = new ethers.Contract(contractAddress, abi, provider);

console.log("Listening to auction events...");

// Auto-buy function
async function autoBuyToken(tokenAddress) {
  console.log("Auto-buy triggered!");

  // Uniswap V2 Router contract address (Mainnet)
  const uniswapRouterAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 

  // Uniswap Router ABI (only the swapExactETHForTokens function)
  const routerAbi = [
    "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)"
  ];

  const routerContract = new ethers.Contract(uniswapRouterAddress, routerAbi, wallet);

  const amountIn = ethers.utils.parseEther("0.001"); // Amount of ETH to swap

  const path = [
    "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2", // WETH address
    tokenAddress // Token you want to buy
  ];

  const to = wallet.address;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

  try {
    const tx = await routerContract.swapExactETHForTokens(
      0, // amountOutMin: set to 0 for testing, but should use real slippage settings in production
      path,
      to,
      deadline,
      { value: amountIn, gasLimit: ethers.utils.hexlify(300000) }
    );

    console.log(`Swap transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log("Swap confirmed.");
  } catch (error) {
    console.error("Swap failed:", error);
  }
}


// Listen to BidPlaced event
// Example: assuming the event emits tokenAddress as last argument

contract.on("BidPlaced", async (bidder, amount, tokenAddress, event) => {
  console.log(`New bid by ${bidder} for amount ${amount.toString()} on token ${tokenAddress}`);
  await autoBuyToken("0xdAC17F958D2ee523a2206206994597C13D831ec7");
});


// Listen to AuctionWon event
contract.on("AuctionWon", async (winner, amount, event) => {
  console.log(`Auction won by ${winner} for amount ${amount.toString()}`);

  // Trigger auto-buy function
  await autoBuyToken();
});
