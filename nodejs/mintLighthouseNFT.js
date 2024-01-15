const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate")
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing")
require("dotenv").config()

const nftContract = "sei16zt75829qyqx26smgcp4qktsqdkhhfqd6v0mwd43xl7ytyw5fsnqycf70u"     // The NFT to mint
const mintGroup = "Public"                                                               // Group (case sensitive)
const startEpochTime = 1705348800   // Start date/time in seconds
const TxFee = "250000"              // Transaction fee: 50000 = 0.050000 SEI
const gasLimit = "600000"           // Max gas for transaction

const minterContract = "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d"  // Lighthouse contract

const rpcURL = process.env.RPC_URL
const botWalletMnemonic = process.env.BOT_SEED
const recipientWallet = process.env.RECIPIENT_WALLET

async function main() {

  const mintWallet = await DirectSecp256k1HdWallet.fromMnemonic(botWalletMnemonic, { prefix: "sei" })

  const mintWalletAccount = await mintWallet.getAccounts()
  const mintWalletAddress = mintWalletAccount[0].address

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

  // Wait for mint time
  const liveTime = Date.now();
  const mintTime = startEpochTime * 1000
  const delay = mintTime - liveTime
  if (delay > 0) {
    console.log("Started at:", new Date(liveTime), "Minting at:", new Date(mintTime), "In", delay, "ms")
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const liveMintTime = Date.now()
  console.log("Send it!", liveMintTime, new Date(liveMintTime))

  // Sign and Mint
  const signingClient = await SigningCosmWasmClient.connectWithSigner(rpcURL, mintWallet)
  const result = await signingClient.execute(mintWalletAddress, minterContract, msg, gasFees)
  console.log(result)

}

main()