export default function CreateProposalTab({contractType, loading, votingPower, styles, setProposalTitle, createProposal }) {
  if (loading) {
    return (
      <div className={styles.description}>
        Loading... Waiting for transaction...
      </div>
    );
  } else if (contractType === "side") {
    return (
      <div className={styles.description}>
        Proposal can only be created on main chain!
      </div>
    );
  } else if (votingPower === 0) {
    return (
      <div className={styles.description}>
        You do not have voting rights in AnyChain DAO. <br />
        <b>You cannot create or vote on proposals</b>
      </div>
    );
  } else {
    return (
      <div className={styles.container}>
        <label>Enter Proposal Title: </label>
        <input
          placeholder="Proposal Title"
          type="text"
          onChange={(e) => setProposalTitle(e.target.value)}
        /> &nbsp;
        <button className={styles.button2} onClick={createProposal}>
          Create
        </button>
      </div>
    );
  }
}
