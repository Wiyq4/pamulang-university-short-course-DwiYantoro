import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";

import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { SIMPLE_STORAGE_ABI } from "./simple-storage.abi";

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl) {
      throw new Error("RPC_URL belum diset di env");
    }

    if (!contractAddress) {
      throw new Error("CONTRACT_ADDRESS belum diset di env");
    }

    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(rpcUrl, {
        timeout: 10_000,
      }),
    });

    this.contractAddress = contractAddress as `0x${string}`;
  }

  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: "getValue",
      });

      return { value: value.toString() };
    } catch (error: any) {
      this.handleRpcError(error);
    }
  }

  async getValueUpdatedEvents() {
    try {
      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: "event",
          name: "ValueUpdated",
          inputs: [{ name: "newValue", type: "uint256", indexed: false }],
        },
        fromBlock: 0n,
        toBlock: "latest",
      });

      return events.map((event) => ({
        blockNumber: event.blockNumber?.toString(),
        value: event.args.newValue.toString(),
        txHash: event.transactionHash,
      }));
    } catch (error: any) {
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || "";

    if (message.includes("timeout")) {
      throw new ServiceUnavailableException(
        "RPC timeout. Silakan coba beberapa saat lagi."
      );
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      throw new ServiceUnavailableException(
        "Tidak dapat terhubung ke blockchain RPC."
      );
    }

    throw new InternalServerErrorException(
      "Terjadi kesalahan saat membaca data blockchain."
    );
  }
}
