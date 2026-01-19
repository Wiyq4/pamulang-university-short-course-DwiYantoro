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

// ==============================
// CONFIG
// ==============================
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
  // ==============================
  // STATE
  // ==============================
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // ==============================
  // WALLET
  // ==============================
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // ==============================
  // READ
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    chainId: avalancheFuji.id,
    query: {
      enabled: mounted && isConnected,
    },
  });

  // ==============================
  // WRITE
  // ==============================
  const { writeContractAsync, isPending: isWriting } =
    useWriteContract();

  const { isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // ==============================
  // EFFECT
  // ==============================
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isConfirming && txHash) {
      refetch();
      setTxHash(undefined);
      setInputValue('');
    }
  }, [isConfirming, txHash, refetch]);

  // ==============================
  // HANDLER
  // ==============================
  const handleSetValue = async () => {
    if (!inputValue) return;

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      });

      setTxHash(hash);
    } catch {
      alert('Transaction rejected');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================
  return (
    <main
      className="
        min-h-screen
        flex items-center justify-center
        px-4
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
        from-blue-900/40 via-black to-black
        text-white
      "
    >
      <div className="relative w-full max-w-sm">
        {/* Glow */}
        <div
          className="
            absolute -inset-0.5 rounded-2xl
            bg-gradient-to-r from-blue-600/40 to-cyan-400/40
            blur-xl
          "
        />

        {/* Card */}
        <div
          className="
            relative rounded-xl bg-black/70 backdrop-blur-xl
            border border-white/10 shadow-lg
            p-4 space-y-4
          "
        >
          {/* HEADER */}
          <header className="text-center space-y-0.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Simple Storage
            </h1>
            <p className="text-xs text-blue-400">
              Avalanche Fuji Testnet
            </p>
            <p className="text-[11px] text-gray-400">
              Dwi Yantoro — 231011403367
            </p>
          </header>

          {/* WALLET */}
          <div className="rounded-xl border border-white/10 p-4 space-y-2">
            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                disabled={isConnecting}
                className="
                  w-full py-2.5 rounded-lg font-medium
                  bg-gradient-to-r from-blue-600 to-cyan-500
                  hover:opacity-90 transition
                "
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Wallet</span>
                  <span
                    className="
                      px-2 py-0.5 rounded-full text-xs
                      bg-green-500/10 text-green-400
                    "
                  >
                    Connected
                  </span>
                </div>

                <p className="font-mono text-sm break-all text-gray-200">
                  {address}
                </p>

                <p className="text-xs text-blue-400">
                  Network: {chain?.name}
                </p>

                {chain?.id !== avalancheFuji.id && (
                  <p className="text-xs text-red-400">
                    ⚠ Please switch to Avalanche Fuji
                  </p>
                )}

                <button
                  onClick={() => disconnect()}
                  className="text-xs text-red-400 underline"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* READ */}
          <div className="rounded-xl border border-white/10 p-5 text-center space-y-1">
            <p className="text-xs text-gray-400 tracking-widest">
              STORED VALUE
            </p>

            <p className="text-5xl font-bold tracking-tight">
              {!isConnected
                ? '--'
                : isReading
                ? '...'
                : value?.toString()}
            </p>

            <button
              onClick={() => refetch()}
              disabled={!isConnected}
              className="text-xs underline text-gray-300 hover:text-white"
            >
              Refresh
            </button>
          </div>

          {/* WRITE */}
          <div className="rounded-xl border border-white/10 p-4 space-y-2">
            <p className="text-xs text-gray-400 tracking-widest">
              UPDATE VALUE
            </p>

            <input
              type="number"
              placeholder="Enter new value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="
                w-full p-2.5 rounded-lg bg-black/60
                border border-white/10
                focus:outline-none
                focus:ring-2 focus:ring-blue-500/50
              "
            />

            <button
              onClick={handleSetValue}
              disabled={!isConnected || isWriting || isConfirming}
              className={`
                w-full py-2.5 rounded-lg font-medium transition
                ${
                  isConfirming
                    ? 'bg-yellow-500/80 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-700'
                }
                disabled:opacity-50
              `}
            >
              {isWriting
                ? 'Sending...'
                : isConfirming
                ? 'Confirming...'
                : 'Set Value'}
            </button>

            {txHash && (
              <p className="text-xs text-center text-blue-400 break-all">
                Tx: {txHash.slice(0, 10)}…{txHash.slice(-6)}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-gray-500">
            Smart contract is the single source of truth
          </p>
        </div>
      </div>
    </main>
  );
}
