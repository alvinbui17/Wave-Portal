// const main = async () => {
//   const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
//   const waveContract = await waveContractFactory.deploy();
//   await waveContract.deployed();

//   console.log('Contract deployed to:', waveContract.address);

//   let waveCount;
//   waveCount = await waveContract.getTotalWaves();

//   let waveTxn = await waveContract.wave("A message!");
//   // wait until the transaction is mined
//   await waveTxn.wait();

//   waveCount = await waveContract.getTotalWaves();

//   const [_, randomPerson] = await hre.ethers.getSigners();
//   waveTxn = await waveContract.connect(randomPerson).wave("A message from randomPerson!");
//   // wait until the transaction is mined
//   await waveTxn.wait();

//   let allWaves = await waveContract.getAllWaves();
//   console.log(allWaves);
// };

const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  // deploy contract and fund it with 0.1 ETH from my wallet
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await waveContract.deployed();
  console.log('Contract address:', waveContract.address);

  /*
   * Get Contract balance
   */
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  /*
   * Send Waves
   */
  const waveTxn = await waveContract.wave('This is wave #1');
  await waveTxn.wait();

  const waveTxn2 = await waveContract.wave('This is wave #2');
  await waveTxn2.wait();

  /*
   * Get Contract balance to see what happened!
   */
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};


const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();