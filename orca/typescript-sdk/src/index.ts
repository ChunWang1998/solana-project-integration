export * from "./public";
import axios from 'axios'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { getOrca } from "./public/main/orca"
import { OrcaFarmConfig } from "./public/farms/config"
import { OrcaPoolConfig } from "./public/pools/config"
import BigNumber from 'bignumber.js'
import { orcaFarmConfigs } from "./constants/farms"
export const OrcaProtocol = {
    getOrcaAllPoolsAPIData,
    getOrcaPoolsAPIData,
    getOrcaUserFarmBalance,
    harvest
}

export async function getOrcaAllPoolsAPIData() {
    let url = "https://api.orca.so/allPools"
    let response = await axios.get(url);
    let datas = response.data;
    return datas;
}

export async function getOrcaPoolsAPIData() {
    let url = "https://api.orca.so/pools";
    let response = await axios.get(url);
    let datas = response.data;
    return datas;
}

export async function getOrcaUserFarmBalance(connection: Connection, ownerAddress: string) {
    const orca = getOrca(connection);
    let owner = new PublicKey(ownerAddress)

    const values = Object.values(OrcaFarmConfig);
    let userFarmParams: any = [];

    let orcaFarmConfigsValue: any = [];
    for (const [key, value] of Object.entries(orcaFarmConfigs)) {
        orcaFarmConfigsValue.push(value);
    }
    for (let a_OrcaFarmConfig of values) {
        
        let farm: any = orca.getFarm(a_OrcaFarmConfig);
        let farmBalance = await farm.getFarmBalance(owner); 
        if (farmBalance.toNumber() != 0) {
            let poolConfig: any = a_OrcaFarmConfig;
            let pool: any = orca.getPool(poolConfig);
            if (pool.poolParams) {// if it pool is in double dip, there is no poolParams in it
                let farmBaseDecimal = await pool.getTokenA().scale;
                let farmQuoteDecimal = await pool.getTokenB().scale;

                let poolBaseReward = await farm.getHarvestableAmount(owner);
                let tmpFarmParams = await farm.farmParams;
                let farmParams: any = [];

                farmParams.mintAddress = tmpFarmParams.farmTokenMint.toString();
                farmParams.poolBaseRewardMintAddress = tmpFarmParams.rewardTokenMint.toString();
                farmParams.poolToken = farmBalance.toNumber().toString()
                farmParams.baseTokenMint = tmpFarmParams.baseTokenMint.toString()
                farmParams.poolBaseReward = poolBaseReward.toNumber().toString()
                farmParams.farmBaseDecimal = farmBaseDecimal;
                farmParams.farmQuoteDecimal = farmQuoteDecimal;
                farmParams.farmLpDecimal = tmpFarmParams.baseTokenDecimals;
                userFarmParams.push(farmParams)
            }
            else {//double dip
                //dd get decimal from AQ, so first search compared AQ farm address
                //(dd address is AQ farm's farmTokenMint)
       
                for (var a_orcaFarmConfigsValue of orcaFarmConfigsValue) {
                    if (a_orcaFarmConfigsValue.farmTokenMint == a_OrcaFarmConfig) {
                        poolConfig = a_orcaFarmConfigsValue.baseTokenMint.toString()
                        pool = orca.getPool(poolConfig);
                    }
                }
                let farmBaseDecimal = await pool.getTokenA().scale;
                let farmQuoteDecimal = await pool.getTokenB().scale;

                let poolBaseReward = await farm.getHarvestableAmount(owner);
                let tmpFarmParams = await farm.farmParams;
                let farmParams: any = [];
                farmParams.mintAddress = tmpFarmParams.farmTokenMint.toString();
                farmParams.poolBaseRewardMintAddress = tmpFarmParams.rewardTokenMint.toString();
                farmParams.poolToken = farmBalance.toNumber().toString()
                farmParams.baseTokenMint = tmpFarmParams.baseTokenMint.toString()
                farmParams.poolBaseReward = poolBaseReward.toNumber().toString()
                farmParams.farmBaseDecimal = farmBaseDecimal;
                farmParams.farmQuoteDecimal = farmQuoteDecimal;
                farmParams.farmLpDecimal = tmpFarmParams.baseTokenDecimals;
                userFarmParams.push(farmParams)
            }
        }
    }
    console.log("get farm several info done")

    let datas = await getOrcaPoolsAPIData();
    for (var userFarmParam of userFarmParams) {
        for (let datasIndex = 0; datasIndex < datas.length; datasIndex++) {
            if (datas[datasIndex].mint_account == userFarmParam.baseTokenMint) {
                userFarmParam.account = datas[datasIndex].account
                break;
            }
        }
        if (!userFarmParam.account) console.log("can't find token info in https://api.orca.so/pools")
    }
    console.log("get farm acc done")

    let tmpDatas = await getOrcaAllPoolsAPIData();
    datas = Object.values(tmpDatas);
    for (var userFarmParam of userFarmParams) {
        for (let datasIndex = 0; datasIndex < datas.length; datasIndex++) {
            if (datas[datasIndex].poolAccount == userFarmParam.account) {
                userFarmParam.tokenAAmount = datas[datasIndex].tokenAAmount
                userFarmParam.tokenBAmount = datas[datasIndex].tokenBAmount
                userFarmParam.poolTokenSupply = datas[datasIndex].poolTokenSupply
                userFarmParam.apr = datas[datasIndex].apy.week
                break;
            }

        }
        if (!userFarmParam.apr) console.log("can't find account in https://api.orca.so/allPools")
    }
    console.log("get farm info from allPools done")

    //cal each token amount
    for (var userFarmParam of userFarmParams) {
        let poolTokenSupply = new BigNumber(userFarmParam.poolTokenSupply)
        let poolToken = new BigNumber(userFarmParam.poolToken)
        let tokenAAmount = new BigNumber(userFarmParam.tokenAAmount)
        let tokenBAmount = new BigNumber(userFarmParam.tokenBAmount)

        tokenAAmount = tokenAAmount.div(10 ** userFarmParam.farmBaseDecimal)
        tokenBAmount = tokenBAmount.div(10 ** userFarmParam.farmQuoteDecimal)
        poolTokenSupply = poolTokenSupply.div(10 ** userFarmParam.farmLpDecimal)

        userFarmParam.farmBaseValue = poolToken.multipliedBy(tokenAAmount).div(poolTokenSupply).toString()
        userFarmParam.farmQuoteValue = poolToken.multipliedBy(tokenBAmount).div(poolTokenSupply).toString()
    }
    console.log("cal farmBaseValue and farmQuoteValue done")

    return userFarmParams
}

export async function harvest(connection: Connection, owner: Keypair, baseTokenMint: string) {
    const orca = getOrca(connection);
    let orcaConfig: any = baseTokenMint;
    let farm: any = orca.getFarm(orcaConfig);

    let transaction = await farm.harvest(owner);
    let tx = transaction.transaction;
    let signers = transaction.signers;
    tx.feePayer = owner.publicKey;
    signers.push(owner);
    let txhash = await connection.sendTransaction(tx, signers);

    return txhash
}