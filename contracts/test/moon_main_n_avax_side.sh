echo "Deploying main contract...."
npx hardhat run scripts/deploy.js --network moonalpha_main
echo "\nDeploying side contract...."
npx hardhat run scripts/deploy.js --network avaxfuji_side
echo "\nRegistering side contract to main contract..."
node orchestrator.mjs moonalpha_main register_chain avaxfuji_side
echo "\nRegistering main contract to side contract..."
node orchestrator.mjs avaxfuji_side register_chain moonalpha_main

## Ensure the deployment is fresh, otherwise proposal id below needs to be updated
echo "\nCreating First Proposal on main contract..."
node orchestrator.mjs moonalpha_main create_proposal "First Proposal"
echo "\nSharing creation of proposal to side contract..."
node orchestrator.mjs avaxfuji_side submit_vaa moonalpha_main latest

echo "\nVoting inFavor of proposal on main contract"
node orchestrator.mjs moonalpha_main cast_vote 0 1
echo "\nVoting neutral on side contract"
node orchestrator.mjs avaxfuji_side cast_vote 0 1
echo "\nSleeping for 5 minutes for voting deadline to end..."
sleep 300
echo "\nTriggering End of voting period on main contract..."
node orchestrator.mjs moonalpha_main end_voting 0
echo "\nSubmitting end of voting message to side contracts..."
node orchestrator.mjs avaxfuji_side submit_end_of_voting moonalpha_main latest
echo "\nSubmitting vote tally message to main contract..."
node orchestrator.mjs moonalpha_main submit_vaa avaxfuji_side latest
echo "\nExecuting Proposal on main contract..."
node orchestrator.mjs moonalpha_main execute_proposal 0
echo "\nSharing final result to side contract...."
node orchestrator.mjs avaxfuji_side submit_vaa moonalpha_main latest
