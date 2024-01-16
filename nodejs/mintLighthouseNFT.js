const { getCosmWasmClient } = require("@sei-js/core")
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate")
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing")
require("dotenv").config()

const nftContract = "sei164t32ynsxdft4n2e0r9geacwfgjzammj9vuh4ayfqew7ywdz7wds7fvxvv"     // The NFT to mint
const TxFee = "80000"              // Transaction fee: 50000 = 0.050000 SEI
const gasLimit = "600000"           // Max gas for transaction

const minterContract = "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d"  // Lighthouse contract

const rpcURL = process.env.RPC_URL
const botWalletMnemonic = process.env.BOT_SEED
const recipientWallet = process.env.RECIPIENT_WALLET

async function main() {

  const mintWallet = await DirectSecp256k1HdWallet.fromMnemonic(botWalletMnemonic, { prefix: "sei" })

  const mintWalletAccount = await mintWallet.getAccounts()
  const mintWalletAddress = mintWalletAccount[0].address

  // Get collection info
  const cosmWasmClient = await getCosmWasmClient(rpcURL)
  const queryMsg = {
    get_collection: {
      collection: nftContract
    }
  }
  const collectionInfo = await cosmWasmClient.queryContractSmart(minterContract, queryMsg)

  const colName = collectionInfo.name
  // Last group usually public and time in seconds - double check
  const mintGroup = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].name
  const mintStartTimeMs = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].start_time * 1000

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

  const liveDate = Date.now()
  const delay = mintStartTimeMs - Date.now()
  console.log("Started at:", new Date(Date.now()), "Minting", colName, "at:", new Date(mintStartTimeMs))
  console.log("Mint group:", mintGroup, "in", delay, "ms")

  // Wait for mint time
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  console.log("Send it!", new Date(Date.now()), msg)

  // Sign and Mint
  const signingClient = await SigningCosmWasmClient.connectWithSigner(rpcURL, mintWallet)
  const result = await signingClient.execute(mintWalletAddress, minterContract, msg, gasFees)
  console.log(result)

}

main()