export async function getBlockchainValue() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/blockchain/value`,
    { cache: 'no-store' }
  );
  return res.json();
}
