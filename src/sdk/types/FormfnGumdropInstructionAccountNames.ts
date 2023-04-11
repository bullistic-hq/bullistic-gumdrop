/**
 * NOTE: This is an auto-generated file. Don't edit it directly.
 */
import {
  DecodedInstructionAccount,
  GenericDecodedTransaction,
} from "@bullistic-hq/bullistic-program-shared";
import { IDL as BULLISTIC_GUMDROP_IDL } from "sdk/idl/BullisticGumdrop";
import BullisticGumdropInstructionName from "sdk/types/BullisticGumdropInstructionName";

const identity = <T>(val: T): T => val;

const ixMap = BULLISTIC_GUMDROP_IDL.instructionsMap ?? {};

const ClaimEditionAccounts = (ixMap.claimEdition ?? []).map(identity);

const CloseDistributorAccounts = (ixMap.closeDistributor ?? []).map(identity);

const CloseDistributorTokenAccountAccounts = (
  ixMap.closeDistributorTokenAccount ?? []
).map(identity);

const CreateGumdropConfigAccounts = (ixMap.createGumdropConfig ?? []).map(
  identity
);

const NewDistributorAccounts = (ixMap.newDistributor ?? []).map(identity);

const UpdateDistributorAccounts = (ixMap.updateDistributor ?? []).map(identity);

const UpdateGumdropConfigAccounts = (ixMap.updateGumdropConfig ?? []).map(
  identity
);

type DecodedBullisticGumdropTransactionResult = {
  claimEdition?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof ClaimEditionAccounts[0]]: DecodedInstructionAccount;
    };
  };
  closeDistributor?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CloseDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  closeDistributorTokenAccount?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CloseDistributorTokenAccountAccounts[0]]: DecodedInstructionAccount;
    };
  };
  createGumdropConfig?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CreateGumdropConfigAccounts[0]]: DecodedInstructionAccount;
    };
  };
  newDistributor?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof NewDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  updateDistributor?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof UpdateDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  updateGumdropConfig?: GenericDecodedTransaction<BullisticGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof UpdateGumdropConfigAccounts[0]]: DecodedInstructionAccount;
    };
  };
};

export default DecodedBullisticGumdropTransactionResult;
