import ClientStorage from '@/components/ClientStorage';

export default function Page() {
  return (
    <main className="min-h-screen p-6 space-y-6 text-white bg-black">
      <header>
        <h1 className="text-2xl font-bold">Simple Storage dApp</h1>
        <p className="text-sm text-gray-400">
          Dwi Yantoro · 231011403367
        </p>
      </header>

      <ClientStorage />
    </main>
  );
}
