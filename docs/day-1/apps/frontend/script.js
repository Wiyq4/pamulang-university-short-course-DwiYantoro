const connectBtn = document.getElementById("connectBtn");
const disconnectBtn = document.getElementById("disconnectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

// Format balance dari Wei ke AVAX
function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

// CONNECT WALLET
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  try {
    statusEl.textContent = "Connecting...";
    statusEl.style.color = "#ffffff";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = address;

    // Get chainId
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      balanceEl.textContent = formatAvaxBalance(balanceWei);

      connectBtn.style.display = "none";
      disconnectBtn.style.display = "block";
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed ❌";
    statusEl.style.color = "#e84142";
  }
}

// DISCONNECT WALLET (reset UI)
function disconnectWallet() {
  statusEl.textContent = "Disconnected";
  statusEl.style.color = "#ffffff";

  addressEl.textContent = "-";
  networkEl.textContent = "-";
  balanceEl.textContent = "-";

  connectBtn.style.display = "block";
  disconnectBtn.style.display = "none";
}

// EVENT LISTENERS
connectBtn.addEventListener("click", connectWallet);
disconnectBtn.addEventListener("click", disconnectWallet);

// OPTIONAL: auto reload jika account / network berubah
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => {
    disconnectWallet();
  });

  window.ethereum.on("chainChanged", () => {
    disconnectWallet();
  });
}
