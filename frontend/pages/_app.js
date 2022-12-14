import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';

// 1. Get projectID at https://cloud.walletconnect.com
if (!process.env.NEXT_PUBLIC_PROJECT_ID) {
  throw new Error('You need to provide NEXT_PUBLIC_PROJECT_ID env variable');
}

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const moonbase_alpha = {
  id: 1287,
  name: "Moonbase Alpha",
  nativeCurrency: {
    decimals: 18,
    name: "DEV",
    symbol: "DEV",
  },
  rpcUrls: {
    default: "https://rpc.testnet.moonbeam.network",
  },
  blockExplorers: {
    default: { name: "MoonScan", url: "https://moonbase.moonscan.io" },
    snowtrace: { name: "MoonScan", url: "https://moonbase.moonscan.io" },
  },
  testnet: true,
};

const avalancheChain = {
  id: 43_113,
  name: "Avalanche",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: "https://api.avax-test.network/ext/bc/C/rpc",
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://testnet.snowtrace.io" },
    snowtrace: { name: "SnowTrace", url: "https://testnet.snowtrace.io" },
  },
  testnet: true,
};

// 2. Configure wagmi client
const chains = [avalancheChain, moonbase_alpha];
const { provider } = configureChains(chains, [walletConnectProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'web3Modal', chains }),
  provider
});

// 3. Configure modal ethereum client
export const ethereumClient = new EthereumClient(wagmiClient, chains);


function MyApp({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true)
  }, []);

  return (
    <>
      {ready ? (
          <WagmiConfig client={wagmiClient}>
            <Component {...pageProps} />
          </WagmiConfig>
      ) : null}

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}

export default MyApp
