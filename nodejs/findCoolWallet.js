const { generateWallet } = require("@sei-js/core")

const startStr = "420"
const includeStr = "420"
const endStr = "420"

async function main() {

  let count = 0
  let found = false
  let wallet
  let walletAddress

  while (!found) {

    count++

    wallet = await generateWallet()
    walletAddress = await wallet.getAccounts()

    if (String(walletAddress[0].address).startsWith("sei1" + startStr) ||
        String(walletAddress[0].address).includes(includeStr) ||
        String(walletAddress[0].address).endsWith(endStr)) {
      found = true
    }

    console.log(count, walletAddress[0].address)
  }

  console.log("Tried", count, "wallet(s) - Found this one:")
  console.log(walletAddress[0])
  console.log(wallet.mnemonic)

}

main()
