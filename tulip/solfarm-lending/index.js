const {
  getCoinsUsdValue,
  getReservePoolData
} = require('./utils');

/**
 * The following example uses Polis (Atlas network) for Solfarm Reserve Pool
 * Information about accounts can be found here: https://gist.github.com/therealssj/11a0f7b9e27ca43b783dcc1e5a6bb093
 */
(async () => {

  const Value = await getCoinsUsdValue("solana");//Check the string id on Coingecko or https://gist.github.com/therealssj/934c9b1d23a97f0d099b74abbdc31526
  //const Value = await getCoinsUsdValue("solfarm");
  console.log(await getReservePoolData(
    //"BN2vN85Q4HiWJL6JejX2ke82fKY7nxnFUBjAWFMC8Wcb",//User address
    "Fv9cU218yZrHD25mbaptFG7vNs1rMLhugQgg8d3e8EhE",
    //"658FZo9B4HgKxsKsM7cUHN7jfNFgC7YftusWWYWc4piD",//Collateral token mint: https://gist.github.com/therealssj/11a0f7b9e27ca43b783dcc1e5a6bb093#file-solfarm-lending-reserves-L168
    "H4Q3hDbuMUw8Bu72Ph8oV2xMQ7BFNbekpfQZKS2xF7jW",
    //"7hxTjiLvBuZcUQnztSRhtvthcsVdu7Na5WWXocwBWA8y",//Reserve account: https://gist.github.com/therealssj/11a0f7b9e27ca43b783dcc1e5a6bb093#file-solfarm-lending-reserves-L164
    "FzbfXR7sopQL29Ubu312tkqWMxSre4dYSrFyYAjUYiC4",
    Value
  ));
})()


