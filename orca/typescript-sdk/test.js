
const { Connection, Keypair } = require('@solana/web3.js');
const { OrcaProtocol } = require("./dist/index")
const bs58 = require("bs58");
const main = async () => {

  //const connection = new Connection("https://api.mainnet-beta.solana.com", "singleGossip");
  const connection = new Connection("https://solana-api.projectserum.com", "singleGossip");

  try {
    let testAccounts = [];
    testAccounts.push(
      {
        testAccount: "H1jhQsrgaipd4dTCBanKmRNHUJMRBtirLY1i7AvN8hhz",//developer addr
      },
      // {
      //   testAccount: "Gy4sp9PZE3bCddqkgf8smpa544GGSzLu3W31cURBZ4QT",
      // }
    )
    // for (var testAccount of testAccounts) {
    //   console.log(await OrcaProtocol.getOrcaUserFarmBalance(connection, testAccount.testAccount))
    // }

    let secretKey = "4g3WTg69bHNrtD4G3fXLFXvh1mxCZrDAnUHjVQxa6dnxNKSydWY3NHstu3bgeDrW1kNuYEjAtXSKw3jsQB1aMTZ2"
    let owner = Keypair.fromSecretKey(
      bs58.decode(secretKey)
    );
    console.log(await OrcaProtocol.harvest(connection, owner, "HFmY1ggCsCky1zJ1sfdkNR4zb3u5n38YNRdf4vsGu17t"))

  } catch (err) {
    console.warn(err);
  }
};

main()
  .then(() => {
    console.log("Done");
  })
  .catch((e) => {
    console.error(e);
  });

