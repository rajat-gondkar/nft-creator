const hre = require("hardhat");

async function main() {
  const PhotoNFT = await hre.ethers.getContractFactory("PhotoNFT");
  const photoNFT = await PhotoNFT.deploy();

  await photoNFT.deployed();

  console.log("PhotoNFT deployed to:", photoNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 