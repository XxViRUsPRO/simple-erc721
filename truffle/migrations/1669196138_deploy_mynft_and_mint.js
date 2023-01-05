const MyNFT = artifacts.require("MyNFT");

module.exports = async function (_deployer) {
  await _deployer.deploy(MyNFT);
};
