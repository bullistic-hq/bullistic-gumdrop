/**
 * NOTE: This is an auto-generated file. Don't edit it directly.
 */
import {
  DecodedInstructionAccount,
  GenericDecodedTransaction,
} from "@formfunction-hq/formfunction-program-shared";
import { IDL as FORMFN_GUMDROP_IDL } from "sdk/idl/FormfnGumdrop";
import FormfnGumdropInstructionName from "sdk/types/FormfnGumdropInstructionName";

const identity = <T>(val: T): T => val;

const ixMap = FORMFN_GUMDROP_IDL.instructionsMap ?? {};

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

type DecodedFormfnGumdropTransactionResult = {
  claimEdition?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof ClaimEditionAccounts[0]]: DecodedInstructionAccount;
    };
  };
  closeDistributor?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CloseDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  closeDistributorTokenAccount?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CloseDistributorTokenAccountAccounts[0]]: DecodedInstructionAccount;
    };
  };
  createGumdropConfig?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof CreateGumdropConfigAccounts[0]]: DecodedInstructionAccount;
    };
  };
  newDistributor?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof NewDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  updateDistributor?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof UpdateDistributorAccounts[0]]: DecodedInstructionAccount;
    };
  };
  updateGumdropConfig?: GenericDecodedTransaction<FormfnGumdropInstructionName> & {
    accountsMap: {
      [Key in typeof UpdateGumdropConfigAccounts[0]]: DecodedInstructionAccount;
    };
  };
};

export default DecodedFormfnGumdropTransactionResult;
