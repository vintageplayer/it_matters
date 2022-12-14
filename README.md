# A cross-chain DAO proposal voting dapp

The dapp is created during gitcoin's Illuminate hackathon using wormhole's core-bridge for cross-chain messaging.

## Challenges
The project took a lot of thought even to get to the POC stage. Understanding the technology, creating a voting process which is fair, creating a user experience close to single-chain usage (by writing relayer logic).

### Things lacking for basic interaction
There are many small areas to make it usage even for understanding, for eg:
 - The proposal state is currently not auto-refreshed
 - Handling of transaction failures due to unpredictable gas is not handled right now.
 - End of voting backend takes time to process which is not shown on frontend. (For 15-20 seconds, user doesn't know an operation is going on unless they look at the backend logs
 - Another confusing part is the votes shown, each chain should total votes at the moment, but that would need creation of cross-chain indexer. All these were out of scope given the tight timeline.
 - A user can vote only once (1 address = 1 vote per chain). But the frontend still shows an option to vote untill the deadline. The transaction will fail if the user tries to vote again.

## Architecture Decisions
- Proposal Life Cycle based actions are taken only on one chain, called the main chain.
- Voting happens independently in each chain as per the chain's specific voting rights of an address
- At the end of voting, vote count from all side chains are submitted to main chain for the final tally
- To improve UX, the next js api is used to relay the messages between chains
- End of voting requires a special relayer as a message from main chain is submitted to side chains to notify end of voting period, which triggers another message from the side chain sharing the vote count
- The relayer api is created to only load one side chain currently, though it can be easily modified to have any number of side votign chains
- As this a POC, voting power in each chain is set to 1 for a user. So the same address can cast vote per chain. In the limited time-frame, intension was to show the concept of cross-chain voting. The actual voting weightage can be integrated similar to Compound and OpenZepplin contracts.


## Setup

### Setup Contracts
1. `cd contracts`
2. `cp .env.example .env` and add wallet private key and the desired chain RPC
3. `cp xdapp.config.json.example xdapp.config.json` and the desired chain's rpc and wormhole details
4. Edit hardhat_config to add the network names matching xdapp.config.json 
5. Deploy main contract using hardhat `npx hardhat run scripts/deploy.js --network avaxfuji_main`
6. Deploy side contract using hardhat `npx hardhat run scripts/deploy.js --network moonalpha_side`
7. Register the contracts with each other `node orchestrator.mjs avaxfuji_main register_chain moonalpha_side`
8. Register the contracts with each other `node orchestrator.mjs moonalpha_side register_chain avaxfuji_main`

## Testing Smart Contracts
Run `npx run test_moon` to test deployment to avax_fuji as a main voting contract and moonbase_alpha as a side voting contract.
It runs the `test/avax_main_n_moon_side.sh`. For other chain combinations, you can refer and modify according to the chains used.

Sometimes an error could occur due to unpredictable gas. Either re-try or manually specify gas limits in `contracts/orchestrator.js` file.

You can also use `npx run test_avax` which deploys both main & side contracts to avax_fuji. Due to it's block finality time, it is convenient to test logic without handling gas or retries.

## Setup Frontend
1. Run `npm install`
2. `cp .env.example .env` and add wallet private key and the desired chain RPC
3. `cp xdapp.config.json.example xdapp.config.json` and the desired chain's rpc and wormhole details
4. run  `npm run dev` to start in dev mode or build the application

