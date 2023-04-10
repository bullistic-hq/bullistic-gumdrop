//! These functions deal with verification of Merkle trees (hash trees).
//!
//! The initial implementation for Solidity based Ethereum contracts is here:
//! https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0/contracts/cryptography/MerkleProof.sol
//!
//! That was then ported to Solana by the Saber Team:
//! https://github.com/saber-hq/merkle-distributor/blob/master/programs/merkle-distributor/src/merkle_proof.rs
//!
//! The Saber code was then used directly in the Metaplex Gumdrop implementation
//! which served as the basis for the current formfn-gumdrop program.

/// Returns true if a `leaf` can be proved to be a part of a Merkle tree
/// defined by `root`. For this, a `proof` must be provided, containing
/// sibling hashes on the branch from the leaf to the root of the tree. Each
/// pair of leaves and each pair of pre-images are assumed to be sorted.
pub fn verify(proof: Vec<[u8; 32]>, root: [u8; 32], leaf: [u8; 32]) -> bool {
    let mut computed_hash = leaf;
    for proof_element in proof.into_iter() {
        if computed_hash <= proof_element {
            // Hash(current computed hash + current element of the proof)
            computed_hash =
                solana_program::keccak::hashv(&[&[0x01], &computed_hash, &proof_element]).0;
        } else {
            // Hash(current element of the proof + current computed hash)
            computed_hash =
                solana_program::keccak::hashv(&[&[0x01], &proof_element, &computed_hash]).0;
        }
    }
    // Check if the computed hash (root) is equal to the provided root
    computed_hash == root
}
