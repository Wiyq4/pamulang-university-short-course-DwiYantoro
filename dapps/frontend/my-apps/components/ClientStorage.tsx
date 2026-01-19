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
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: value, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    chainId: avalancheFuji.id,
    query: { enabled: mounted && isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isConfirming } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => setMounted(true), []);

  const handleSetValue = async () => {
    if (!inputValue) return;

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_STORAGE_ABI,
      functionName: 'setValue',
      args: [BigInt(inputValue)],
    });

    setTxHash(hash);
    setInputValue('');
    refetch();
  };

  if (!mounted) return null;

  return (
    <section className="border border-white/10 rounded-lg p-4 space-y-3">
      {!isConnected ? (
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="text-xs text-gray-400 break-all">{address}</p>

          <p className="text-xl font-bold">
            Client Read: {value?.toString()}
          </p>

          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 bg-black border border-white/10"
          />

          <button
            onClick={handleSetValue}
            disabled={isConfirming}
            className="px-4 py-2 bg-green-600 rounded"
          >
            Set Value
          </button>

          <button
            onClick={() => disconnect()}
            className="text-xs text-red-400 underline"
          >
            Disconnect
          </button>
        </>
      )}
    </section>
  );
}
