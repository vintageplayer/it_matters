export default function ViewProposalsTab({contractType, loading, styles, proposals, voteOnProposal, endVoting, executeProposal}) {
  if (loading) {
    return (
      <div className={styles.description}>
        Loading... Waiting for transaction...
      </div>
    );
  } else if (proposals.length === 0) {
    return (
      <div className={styles.description}>
        No proposals have been created
      </div>
    );
  } else {
    return (
      <div>
        {proposals.map((p, index) => (
          <div key={index} className={styles.proposalCard}>
            <p>Proposal ID: {p.proposalId}</p>
            <p>Proposal Title: {p.proposalTitle}</p>
            <p>Deadline: {p.deadline.toLocaleString()}</p>
            <p>Supporting Votes: {p.inFavorVotes}</p>
            <p>Against Votes: {p.againstVotes}</p>
            <p>Votes Abstained: {p.abstainVotes}</p>
            <p>Proposal Status: {p.deadline.getTime() > Date.now() ? "Open" : (
              (p.proposalExecuted  ? ( p.proposalPassed ? "Accepted" : "Rejected") : (p.votingEnded ? "Yet to Execute" : "Yet to End Voting"))
            )}</p>
            <p>Voting Ended?: {p.votingEnded.toString()}</p>
            <p>Executed?: {p.executed.toString()}</p>
            { p.deadline.getTime() > Date.now() ? (
              <div className={styles.flex}>
                <button
                  className={styles.button2}
                  onClick={() => voteOnProposal(p.proposalId, "YES")}
                >
                  Vote Yes
                </button>
                <button
                  className={styles.button2}
                  onClick={() => voteOnProposal(p.proposalId, "NO")}
                >
                  Vote Against
                </button>
                <button
                  className={styles.button2}
                  onClick={() => voteOnProposal(p.proposalId, "ABSTAIN")}
                >
                  Abstain Vote
                </button>
              </div>
            ) : contractType == "main" ? ( !p.executed ? ( !p.votingEnded ? (
              <div className={styles.flex}>
                <button
                  className={styles.button2}
                  onClick={() => endVoting(p.proposalId)}
                >
                  End Voting{" "}
                </button>
              </div>
            ) : (
              <div className={styles.flex}>
                <button
                  className={styles.button2}
                  onClick={() => executeProposal(p.proposalId)}
                >
                  Execute Proposal{" "}
                  {p.inFavorVotes > p.againstVotes ? "(YES)" : "(NO)"}
                </button>
              </div>
            )) : (
              <div className={styles.description}>Proposal Executed</div>
            )) : (
              <p><b>Go to main chain to execute the proposal</b></p>
            )}
          </div>
        ))}
      </div>
    );
  }
};