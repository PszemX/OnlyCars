async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const OnlyCarsToken = await ethers.getContractFactory("OnlyCarsToken");
    const onlyCarsToken = await OnlyCarsToken.deploy();
  
    console.log("Token address:", await onlyCarsToken.getAddress());
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });