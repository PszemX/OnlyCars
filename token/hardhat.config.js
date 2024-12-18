require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = "840b9e035c495858c03c9b6163582bf717ae4cf9f54cdfd4658b00c99536dc6a"

module.exports = {
  solidity: "0.8.28",
  networks:{
    holesky:{
      url: "https://holesky.infura.io/v3/ab0cfe4975ae44dcb3b4c4e81bbd1918",
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};
