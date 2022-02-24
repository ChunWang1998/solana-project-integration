const {
  getSolFarmPoolInfo
} = require('./leveragePools');

const POOLS = {
  RAYDIUM: 0,
  ORCA: 1
};

const main = async () => {

  /**
   *  Fill this with proper values and uncomment.
   */

  // ORCA WHETH-USDC Example
  // await getVaultData(
  //   POOLS.ORCA,
  //   "WHETH-USDC",
  //   "BN2vN85Q4HiWJL6JejX2ke82fKY7nxnFUBjAWFMC8Wcb"
  // );

  //RAYDIUM RAY-SOL EXAMPLE
  await getVaultData(
    POOLS.RAYDIUM,
    "RAY-SOL",
    "Fv9cU218yZrHD25mbaptFG7vNs1rMLhugQgg8d3e8EhE"
  );

};

const getVaultData = async (
  _pool,
  _pair,
  _userPubKey
) => {

  try {

    let { lpMintAddress,baseMint,quoteMint,borrowed, virtualValue, value, debtValue, borrowedAsset } = await getSolFarmPoolInfo(
      _pool,
      _pair,
      _userPubKey,
    );

    //console.log("User Key", _userPubKey);
    console.log("------------FARMING------------");
    console.log("Pair", _pair);
    console.log(`Position Value: ${virtualValue} USD`);
    console.log(`Debt Value: ${debtValue} USD`);
    console.log("LpMintAddress",lpMintAddress);
    console.log("baseMint",baseMint);
    console.log("quoteMint",quoteMint);
    //console.log(`Borrowed: ${borrowed} ${borrowedAsset}`);

    //console.log(`Equity Value: ${value} USD`);
    console.log("------------LENDING------------");
    console.log("------------VAULT------------");

    return {
      borrowed, virtualValue, value, debtValue, borrowedAsset
    };

  } catch (error) {
    console.log(error);
  };

};


main();


