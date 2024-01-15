const { generateWallet, getQueryClient } = require("@sei-js/core")
require("dotenv").config()

const restURL = process.env.REST_URL

async function main() {

  let count = 0
  let balance = 0
  let wallet
  let walletAddress

  while (balance == 0) {
    
    //await new Promise(resolve => setTimeout(resolve, 333)) // Wait .333 seconds each time
    count++

    wallet = await generateWallet()
    walletAddress = await wallet.getAccounts()

    const queryClient = await getQueryClient(restURL)
    const balances = await queryClient.cosmos.bank.v1beta1.allBalances({ address: walletAddress[0].address });
    balance = balances.pagination.total
    console.log(count, walletAddress[0].address, balance)
  }

  console.log("Tried", count, "wallet(s) - Found this one:")
  console.log(walletAddress[0])
  console.log(wallet.mnemonic)

}

main()
