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
import { avalancheFuji } from 'wagmi/chains';

const CONTRACT_ADDRESS =
  '0x0484828Af574805f4f7D5e3257bbc2Bf67235268' as `0x${string}`;

const ABI = [
  {
    name: 'getValue',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'setValue',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_value', type: 'uint256' }],
    outputs: [],
  },
];

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: value, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
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
      setInput('');
    }
  }, [isConfirming, txHash, refetch]);

  if (!mounted) return <div className="text-white">Loading...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-sm border border-white/10 rounded-lg p-4 space-y-4">
        <h1 className="text-xl font-bold text-center">
          Simple Storage dApp
        </h1>

        {!isConnected ? (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
            className="w-full bg-blue-600 py-2 rounded"
          >
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <>
            <p className="text-xs break-all">{address}</p>
            <p className="text-xs text-blue-400">
              Network: {chain?.name}
            </p>

            {chain?.id !== avalancheFuji.id && (
              <p className="text-xs text-red-400">
                ⚠ Switch to Avalanche Fuji
              </p>
            )}

            <div className="text-center">
              <p className="text-xs text-gray-400">Stored Value</p>
              <p className="text-3xl font-bold">
                {value?.toString() ?? '--'}
              </p>
            </div>

            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="New value"
              className="w-full p-2 bg-black border border-white/10 rounded"
            />

            <button
              onClick={async () => {
                const hash = await writeContractAsync({
                  address: CONTRACT_ADDRESS,
                  abi: ABI,
                  functionName: 'setValue',
                  args: [BigInt(input)],
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
              className="text-xs text-red-400 underline w-full"
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </main>
  );
}
