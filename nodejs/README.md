## Node.JS for SEI and NFTs.

### Setup

1. Clone the repo or download file from `nodejs` folder.  You need NodeJS.  I run it using Docker.

2. In the `nodejs` folder, run:
   - `npm install`

3. Rename `.env_example` to `.env`

4. Open `.env` file and edit with your RPC/REST URLs, Seed for your bot wallet and the Recipient wallet.

### Running the scripts

In the `nodejs` folder use

- `node [ScriptFileName]`

or using Docker

- `docker run -v $(pwd):/usr/node/app -w /usr/node/app -it --rm node [ScriptFileName]`

#### findCoolWallet.js

Look for a SEI wallet with a patern of phrase.
Edit the `startStr`, `includeStr` and `endStr` variables with what you want in you wallet address.

The more complex or impossible it is the longer it will take.
Be ready to stop the script by force.

#### findUsedWallet.js

Look for a SEI wallet that already has SEI in it.
Chances are very low of ever finding anything.

This will run indefinitly.
Be ready to stop the script by force.

#### lighthouseGetCollection.js

Show collection information, including current supply, max supply, mint groups, prices and times.
Edit the `nftConstract` variable with the contract you want to query.
Should be an NFT minting using Lighthouse.

#### mintLighthouseNFT.js

Edit the `nftConstract` variable with the contract you want mint.
Should be an NFT minting using Lighthouse.
Check it using `lighthouseGetCollection.js`.

Script will mint on the last group (usually public) and will wait until that time to send the transaction.
If mint is open, it will send transaction right away, even if collection is sold out.
Currently only works for free mints and can only mint one NFT.