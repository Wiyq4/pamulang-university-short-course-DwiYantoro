import { getBlockchainValue } from '@/services/blockchain.service';
import ClientStorage from '@/components/ClientStorage';

export default async function Page() {
  const value = await getBlockchainValue();

  return (
    <main className="min-h-screen p-6 space-y-6 text-white bg-black">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Simple Storage dApp</h1>
        <p className="text-sm text-gray-400">
          Dwi Yantoro · 231011403367
        </p>
      </header>

      {/* READ (SERVER) */}
      <section className="border border-white/10 rounded-lg p-4">
        <p className="text-xs text-gray-400">LATEST VALUE (Server)</p>
        <p className="text-4xl font-bold">{value.value}</p>
      </section>

      {/* WRITE (CLIENT) */}
      <ClientStorage />
    </main>
  );
}
