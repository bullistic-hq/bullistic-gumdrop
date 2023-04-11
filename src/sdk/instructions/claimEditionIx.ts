import {
  deserializeMerkleProof,
  findAtaPda,
  findEditionMarkerPda,
  findEditionPda,
  TOKEN_METADATA_PROGRAM_ID,
  treeNodeToArray,
} from "@bullistic-hq/bullistic-program-shared";
import { BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import { GumdropProgram } from "sdk/idl";
import findClaimCountPda from "sdk/pdas/findClaimCountPda";
import findTokenMetadataPda from "sdk/pdas/findTokenMetadataPda";
import ClaimantWithProof from "sdk/types/ClaimantWithProof";

type Accounts = {
  distributor: PublicKey;
  gumdropProgramId: PublicKey;
  limitedEditionUpdateAuthority: PublicKey;
  mint: PublicKey;
  newMint: PublicKey;
  payer?: PublicKey;
  wallet: PublicKey;
};

type Args = {
  claimant: ClaimantWithProof;
  edition: number;
  program: GumdropProgram;
};

export default async function claimEditionIx(
  {
    wallet,
    limitedEditionUpdateAuthority,
    distributor,
    mint,
    newMint,
    gumdropProgramId,
    payer,
  }: Accounts,
  { edition, claimant, program }: Args
): Promise<TransactionInstruction> {
  const [claimCountKey] = findClaimCountPda(
    distributor,
    wallet,
    gumdropProgramId
  );
  const [limitedEditionMetadata] = findTokenMetadataPda(newMint);
  const [masterEditionMetadata] = findTokenMetadataPda(mint);
  const [limitedEditionPda] = findEditionPda(newMint);
  const [masterEditionPda, editionBump] = findEditionPda(mint);
  const [masterEditionTokenAccount] = findAtaPda(distributor, mint);
  const [editionMarkerPda] = findEditionMarkerPda(mint, new BN(edition));

  const { serializedProof, amount } = claimant;
  const proof = deserializeMerkleProof(serializedProof);

  return program.methods
    .claimEdition(
      editionBump,
      new BN(edition),
      amount,
      proof.map((val) => treeNodeToArray(val))
    )
    .accounts({
      claimCount: claimCountKey,
      distributor,
      editionMarkerPda,
      limitedEditionMetadata,
      limitedEditionMint: newMint,
      limitedEditionMintAuthority: wallet,
      limitedEditionPda,
      limitedEditionUpdateAuthority,
      masterEditionMetadata,
      masterEditionMint: mint,
      masterEditionPda,
      masterEditionTokenAccount,
      payer: payer ?? wallet,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}
