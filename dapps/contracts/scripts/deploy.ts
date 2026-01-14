import { createWalletClient, createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import Artifact from "../artifacts/contracts/simple-storage.sol/SimpleStorage.json";
import "dotenv/config";

async function main() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY tidak ditemukan di .env");
  }
  //  Buat account dari private key
  const account = privateKeyToAccount(
    `0x${process.env.PRIVATE_KEY}` as `0x${string}`
  );
  //  Wallet client (signer)
  const walletClient = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });
  //  Public client (read-only)
  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http("https://api.avax-test.network/ext/bc/C/rpc"),
  });
  console.log("Deploying with account:", account.address);
  //  Deploy contract
  const hash = await walletClient.deployContract({
    abi: Artifact.abi,
    bytecode: Artifact.bytecode as `0x${string}`,
    args: [],
  });
  console.log("Deployment tx hash:", hash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ SimpleStorage deployed at:", receipt.contractAddress);
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
