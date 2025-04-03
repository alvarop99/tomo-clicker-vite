import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { getDefaultConfig, TomoEVMKitProvider, ConnectButton } from '@tomo-inc/tomo-evm-kit';
import { WagmiProvider, useAccount, useContractWrite, useContractRead } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@tomo-inc/tomo-evm-kit/styles.css';

const CONTRACT_ADDRESS = import.meta.env.REACT_APP_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "player", "type": "address" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "recordScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "player", "type": "address" }
    ],
    "name": "getHighScore",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const config = getDefaultConfig({
  clientId: import.meta.env.REACT_APP_CLIENT_ID,
  appName: 'Tomo Clicker',
  projectId: import.meta.env.REACT_APP_PROJECT_ID,
  chains: [mainnet]
});

const queryClient = new QueryClient();

function GameApp() {
  const [points, setPoints] = useState(0);
  const { address, isConnected } = useAccount();

  const { write } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'recordScore'
  });

  const { data: highScore } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getHighScore',
    args: [address],
    watch: true,
    enabled: isConnected && !!address
  });

  const handleClick = () => {
    const newPoints = points + 1;
    setPoints(newPoints);
    if (isConnected && address) {
      write({ args: [address, newPoints] });
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <ConnectButton />
      <h1>Tomo Clicker Game (Vite)</h1>
      <p>Wallet: {address || 'Not connected'}</p>
      <p>Points this session: {points}</p>
      <p>Your High Score: {highScore?.toString() || 'Loading...'}</p>
      <button onClick={handleClick}>Click Me!</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TomoEVMKitProvider socialsEnabled={true}>
        <GameApp />
      </TomoEVMKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
