import { useWeb3Modal, Web3Button } from '@web3modal/react';
import {
  useAccount,
  useNetwork
} from 'wagmi'
// import styles from "../styles/Home.module.css";
import NavigationBar from "../components/NavigationBar";
import Main from "../components/Main";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  return (
    <>
      { !isConnected ? 
      <div className="connect_wallet">
        <Web3Button />
      </div>
      : <>
        <NavigationBar network={chain} />
        <Main />
      </>
      }
    </>
  )
}