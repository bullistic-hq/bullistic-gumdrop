import ClaimantInfo from "sdk/types/ClaimantInfo";

interface ClaimantWithProof extends ClaimantInfo {
  serializedProof: string;
}

export default ClaimantWithProof;
