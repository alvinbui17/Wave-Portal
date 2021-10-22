import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

// https://app.mycrypto.com/faucet
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { TextField } from '@mui/material';

import Loader from "react-loader-spinner";

import WavePortalArtifact from "../utils/WavePortalArtifact.json"
import { borderRadius } from '@mui/system';

const App = () => {
  const contractAddress = '0xbAd0d5E03493CbeBC2D9afCED2Cd86624f1Fd548';
  const contractABI = WavePortalArtifact.abi;
  /*
  * Just a state variable we use to store our user's public wallet.
  */

  const [waveMessage, setWaveMessage] = useState("");
  const [waveMessageValue, setWaveMessageValue] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);

  const [currentAccount, setCurrentAccount] = useState("");
  const [currentNumWaves, setCurrentNumWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [isMining, setIsMining] = useState(false);
  
  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getCurrentCount = async () => {
    try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          let count = await wavePortalContract.getTotalWaves();
          setCurrentNumWaves(count.toNumber())
        }
          else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        console.log(error)
      }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      getCurrentCount();
      getAllWaves();
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
        * Execute the actual wave from your smart contract

        A transaction hash/id is a unique string of characters that is given to every transaction that is verified and added to the blockchain. In many cases, a transaction hash is needed in order to locate funds.

        */

        const waveTxn = await wavePortalContract.wave(waveMessage, { gasLimit: 300000 });

        try {
          setIsDisabled(true)
          setIsMining(true)
          console.log("Mining...", waveTxn.hash);
          await waveTxn.wait();
          
          setIsMining(false)
          console.log("Mined -- ", waveTxn.hash);
          setIsDisabled(false)
          setWaveMessage("")
        } catch (e) {
          setIsDisabled(false)
          setIsMining(false)
          console.log(e)
          setWaveMessage("")
          setIsDisabled(false)
          alert("Something went wrong /:")
        }

        let count = await wavePortalContract.getTotalWaves();
        setCurrentNumWaves(count.toNumber());
        getAllWaves();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      setIsMining(false)
    }
}

const handleMessageChange = (e) => {
  setWaveMessage(e.target.value)
}
  
  useEffect(() => {
    checkIfWalletIsConnected();
    getCurrentCount();
  }, [])
  
  return (
    <div className={styles.mainContainer}>

      <div className={styles.dataContainer}>
        <div className={styles.header}>
        👋 Hey there!
        </div>

        <div className={styles.bio}>
        {`I am Alvin and I'm not sure what I'm doing.`}
        </div>

        <div className={styles.bio}>
        {`Connect your Ethereum wallet and wave at me!`}
        </div>
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount ? (
          <button className={styles.waveButton} onClick={connectWallet}>
            Connect Wallet
          </button>
        ) :
         <>
         <div className={styles.textField} >
         <TextField size="small" variant="standard" placeholder="Include a Message..." fullWidth="true" onChange={handleMessageChange} value={waveMessage} disabled={isDisabled}/>
         </div>
        {isMining ? (
          <button className={styles.waveButton} onClick={wave}>
          <Loader type="ThreeDots" color="#2a9d8f" height={10} width={40}/>
        </button>) : (
          <button className={styles.waveButton} onClick={wave}>
          Wave at Me
        </button>
        )}
        </>
        }

         <div className={styles.bio}>
        Current number of waves: {currentNumWaves}
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "lightgrey", marginTop: "16px", padding: "8px", borderRadius: "5px"}}>
              <div>Address: {wave.address}</div>
              <br/>
              <div>Time: {wave.timestamp.toString()}</div>
              <br/>
              <div>Message: {wave.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App;