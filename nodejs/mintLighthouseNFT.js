const { getCosmWasmClient } = require("@sei-js/core")
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate")
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing")
require("dotenv").config()

const nftContract = "sei1t37a3zz329n58mw58jjh4qm3n8w38cu2s2wcre9dshy0h39hh3ysrv39ys"     // The NFT to mint
const TxFee = "50000"              // Transaction fee: 50000 = 0.050000 SEI
const gasLimit = "500000"           // Max gas for transaction

const minterContract = "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d"  // Lighthouse contract

const rpcURL = process.env.RPC_URL
const botWalletMnemonic = process.env.BOT_SEED
const recipientWallet = process.env.RECIPIENT_WALLET

async function main() {

  const mintWallet = await DirectSecp256k1HdWallet.fromMnemonic(botWalletMnemonic, { prefix: "sei" })

  const mintWalletAccount = await mintWallet.getAccounts()
  const mintWalletAddress = mintWalletAccount[0].address

  // TODO - Check account balance

  // Get collection info
  const cosmWasmClient = await getCosmWasmClient(rpcURL)
  const queryMsg = {
    get_collection: {
      collection: nftContract
    }
  }
  const collectionInfo = await cosmWasmClient.queryContractSmart(minterContract, queryMsg)
  const colName = collectionInfo.name

  // Detect if sold out!
  const colSupply = collectionInfo.supply
  const colNextTokenId = collectionInfo.next_token_id
  const colStartId = collectionInfo.start_order
  if (colNextTokenId-colStartId >= colSupply)
    throw new Error(colName + " is sold out (" + colSupply + ")");

  // TODO - Pick a mint group
  const mintGroup = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].name
  const mintStartTimeMs = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].start_time * 1000
  //const mintMaxToken = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].max_tokens
  const mintPrice = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].unit_price

  const gasFees = {
    amount: [{ denom: "usei", amount: TxFee }],
    gas: gasLimit
  }

  const msg = {
    mint_native: {
      collection: nftContract,
      group: mintGroup,
      hashed_address: null,
      merkle_proof: null,
      recipient: recipientWallet
    }
  }

  const amount = [{
    denom: "usei",
    amount: mintPrice
  }]

  // Show mint information
  const delay = mintStartTimeMs - Date.now()
  console.log("Started at:", new Date(Date.now()), "Minting 1", colName, "at:", new Date(mintStartTimeMs), "\n",
              "Mint group:", mintGroup, "in", delay, "ms", "\n",
              "Mint price:", (mintPrice > 0 ? mintPrice/1000000 : mintPrice), "SEI")

  // Sign transaction
  const signingClient = await SigningCosmWasmClient.connectWithSigner(rpcURL, mintWallet)

  // Wait for mint time
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Send signed transaction
  console.log("Send it!", new Date(Date.now()), msg)
  const result = await signingClient.execute(mintWalletAddress, minterContract, msg, gasFees)
  console.log(result)

}

main()