const { getCosmWasmClient } = require("@sei-js/core")
const { SigningCosmWasmClient } = require("@cosmjs/cosmwasm-stargate")
const { DirectSecp256k1HdWallet } = require("@cosmjs/proto-signing")
require("dotenv").config()

const nftContract = "sei1ueznkdkldf4yd88f7fr0qv4xustz735tzavvc888ca0cvdxu9q7szn7969"  // The NFT to mint
const TxFee = 127000             // Transaction (gas) fee: 50000 = 0.050000 SEI
const gasBase = 150000           // Base gas
const gasMultiplier = 300000     // For each additionnal NFT add Multiplier: 150000 + 300000
const maxMintAmount = 2          // The max amount of NFTs to mint in one transaction
const earlyMintMs = 600          // Milliseconds before mint to send transaction

const rpcURL = process.env.RPC_URL
const botWalletMnemonic = process.env.BOT_SEED
const recipientWallet = process.env.RECIPIENT_WALLET

const minterContract = "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d"  // Lighthouse contract

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
    throw new Error(colName + " is sold out (" + colSupply + ")")

  // TODO - Pick a mint group
  const mintGroup = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].name
  const mintStartTimeMs = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].start_time * 1000
  const mintPrice = collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].unit_price

  // Check how many NFT can be minted
  const mintMaxToken = (collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].max_tokens < maxMintAmount ? collectionInfo.mint_groups[collectionInfo.mint_groups.length-1].max_tokens : maxMintAmount)
  if (mintMaxToken < 1)
    throw new Error("Max tokens too small:", mintMaxToken)

  // Create message and instructions
  const msg = {
    mint_native: {
      collection: nftContract,
      group: mintGroup,
      hashed_address: null,
      merkle_proof: null,
      recipient: recipientWallet
    }
  }
  const instruction = {
    contractAddress: minterContract,
    msg: msg
  }

  // Add funds - mint price + lighthouse fee
  if (mintPrice != 0) {
      instruction.funds = [{
          denom: 'usei',
          amount: new BigNumber(mintPrice).plus(BigNumber(1.5)).toString()
      }]
  }

  // Add instructions for each NFT to mint
  let instructions = []
  for (let i = 0; i < mintMaxToken; i++) {
      instructions.push(instruction)
  }

  // Estimate gas fees
  const gasFees = {
    amount: [{ denom: "usei", amount: TxFee.toString() }],
    gas: (gasBase+(gasMultiplier*mintMaxToken)).toString()
  }

  // Show mint information
  const delay = mintStartTimeMs - Date.now() - earlyMintMs
  console.log("Started at:", new Date(Date.now()), "Minting", mintMaxToken, colName, "at:", new Date(mintStartTimeMs - earlyMintMs), "\n",
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
  const result = await signingClient.executeMultiple(mintWalletAddress, instructions, gasFees)
  console.log(result)

}

main()