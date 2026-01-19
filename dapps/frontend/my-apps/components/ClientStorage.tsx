'use client';

import { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { avalancheFuji } from 'wagmi/chains';

const CONTRACT_ADDRESS =
  '0x0484828Af574805f4f7D5e3257bbc2Bf67235268' as `0x${string}`;

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export default function ClientStorage() {
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address, isConnected, chain } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: value, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    chainId: avalancheFuji.id,
    query: { enabled: mounted && isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isConfirming && txHash) {
      refetch();
      setTxHash(undefined);
      setInputValue('');
    }
  }, [isConfirming, txHash, refetch]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm border border-white/10 rounded-xl p-4 space-y-4">
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isPending}
            className="w-full bg-blue-600 py-2 rounded"
          >
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <>
            <p className="text-xs break-all">{address}</p>
            <p className="text-sm text-blue-400">
              Network: {chain?.name}
            </p>

            <p className="text-3xl font-bold text-center">
              {isLoading ? '...' : value?.toString()}
            </p>

            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-2 bg-black border border-white/10 rounded"
            />

            <button
              onClick={async () => {
                const hash = await writeContractAsync({
                  address: CONTRACT_ADDRESS,
                  abi: SIMPLE_STORAGE_ABI,
                  functionName: 'setValue',
                  args: [BigInt(inputValue)],
                });
                setTxHash(hash);
              }}
              disabled={isConfirming}
              className="w-full bg-green-600 py-2 rounded"
            >
              {isConfirming ? 'Confirming...' : 'Set Value'}
            </button>

            <button
              onClick={() => disconnect()}
              className="text-xs text-red-400 underline"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
