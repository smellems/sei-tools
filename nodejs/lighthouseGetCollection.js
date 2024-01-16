const { getCosmWasmClient } = require("@sei-js/core")
require("dotenv").config()

const nftContract = "sei15kry55jvrg3auca9hkwh3yqtsmhg92hcmt7ze9vz5l6kg2mtaw3sqnc5qe"     // The Collection to check

const minterContract = "sei1hjsqrfdg2hvwl3gacg4fkznurf36usrv7rkzkyh29wz3guuzeh0snslz7d"  // Lighthouse contract

const rpcURL = process.env.RPC_URL

async function main() {

  const cosmWasmClient = await getCosmWasmClient(rpcURL)
  const queryMsg = {
    get_collection: {
      collection: nftContract
    }
  }
  const collectionInfo = await cosmWasmClient.queryContractSmart(minterContract, queryMsg)

  console.log("cw721:          ", collectionInfo.cw721_address)
  console.log("Name:           ", collectionInfo.name)
  console.log("Symbol:         ", collectionInfo.symbol)
  console.log("Supply:         ", collectionInfo.supply)
  console.log("Next id:        ", collectionInfo.next_token_id)
  console.log("Start:          ", collectionInfo.start_order)
  console.log("Token URI:      ", collectionInfo.token_uri)
  console.log("Placeholder URI:", collectionInfo.placeholder_token_uri)
  console.log("Iterated URI:   ", collectionInfo.iterated_uri)
  console.log("Royalty:        ", collectionInfo.royalty_percent, "%")
  console.log("Frozen:         ", collectionInfo.frozen)
  console.log("Hidden:         ", collectionInfo.hidden_metadata)
  console.log("Dagora:          https://dagora.xyz/collection/seiMainnet/" + nftContract)
  console.log("Pallet:          https://pallet.exchange/collection/" + String(collectionInfo.name).toLowerCase().replaceAll(" ", "-"))
  console.log("Mint Groups:")

  collectionInfo.mint_groups.forEach((group) => console.log("  ", group.name, ":", group.unit_price, "SEI - from", new Date(group.start_time*1000), "to", new Date(group.end_time*1000)))

}

main()
