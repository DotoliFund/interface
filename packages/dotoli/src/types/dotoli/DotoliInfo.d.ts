/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface DotoliInfoInterface extends ethers.utils.Interface {
  functions: {
    "addTokenId(uint256,address,uint256)": FunctionFragment;
    "createFund()": FunctionFragment;
    "decreaseFeeToken(uint256,address,uint256)": FunctionFragment;
    "decreaseFundToken(uint256,address,uint256)": FunctionFragment;
    "decreaseInvestorToken(uint256,address,address,uint256)": FunctionFragment;
    "feeTokens(uint256,uint256)": FunctionFragment;
    "fundIdCount()": FunctionFragment;
    "fundTokens(uint256,uint256)": FunctionFragment;
    "getFeeTokens(uint256)": FunctionFragment;
    "getFundTokenAmount(uint256,address)": FunctionFragment;
    "getFundTokens(uint256)": FunctionFragment;
    "getInvestorTokenAmount(uint256,address,address)": FunctionFragment;
    "getInvestorTokens(uint256,address)": FunctionFragment;
    "getTokenIds(uint256,address)": FunctionFragment;
    "increaseFeeToken(uint256,address,uint256)": FunctionFragment;
    "increaseFundToken(uint256,address,uint256)": FunctionFragment;
    "increaseInvestorToken(uint256,address,address,uint256)": FunctionFragment;
    "investingFundCount(address)": FunctionFragment;
    "investingFunds(address,uint256)": FunctionFragment;
    "investorCount(uint256)": FunctionFragment;
    "investorTokens(uint256,address,uint256)": FunctionFragment;
    "isSubscribed(address,uint256)": FunctionFragment;
    "manager(uint256)": FunctionFragment;
    "managingFund(address)": FunctionFragment;
    "owner()": FunctionFragment;
    "setOwner(address)": FunctionFragment;
    "subscribe(uint256)": FunctionFragment;
    "subscribedFunds(address)": FunctionFragment;
    "tokenIdOwner(uint256)": FunctionFragment;
    "tokenIds(uint256,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addTokenId",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createFund",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "decreaseFeeToken",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "decreaseFundToken",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "decreaseInvestorToken",
    values: [BigNumberish, string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "feeTokens",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "fundIdCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "fundTokens",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getFeeTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getFundTokenAmount",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getFundTokens",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getInvestorTokenAmount",
    values: [BigNumberish, string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getInvestorTokens",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenIds",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseFeeToken",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseFundToken",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseInvestorToken",
    values: [BigNumberish, string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "investingFundCount",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "investingFunds",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "investorCount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "investorTokens",
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isSubscribed",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "manager",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "managingFund",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "setOwner", values: [string]): string;
  encodeFunctionData(
    functionFragment: "subscribe",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "subscribedFunds",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenIdOwner",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenIds",
    values: [BigNumberish, string, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "addTokenId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createFund", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "decreaseFeeToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "decreaseFundToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "decreaseInvestorToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "feeTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "fundIdCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fundTokens", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getFeeTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFundTokenAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFundTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInvestorTokenAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInvestorTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenIds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseFeeToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseFundToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "increaseInvestorToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "investingFundCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "investingFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "investorCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "investorTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isSubscribed",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "manager", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "managingFund",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOwner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "subscribe", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "subscribedFunds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenIdOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenIds", data: BytesLike): Result;

  events: {
    "FundCreated(uint256,address)": EventFragment;
    "InfoCreated()": EventFragment;
    "OwnerChanged(address,address)": EventFragment;
    "Subscribe(uint256,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "FundCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "InfoCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OwnerChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Subscribe"): EventFragment;
}

export type FundCreatedEvent = TypedEvent<
  [BigNumber, string] & { fundId: BigNumber; manager: string }
>;

export type InfoCreatedEvent = TypedEvent<[] & {}>;

export type OwnerChangedEvent = TypedEvent<
  [string, string] & { owner: string; newOwner: string }
>;

export type SubscribeEvent = TypedEvent<
  [BigNumber, string] & { fundId: BigNumber; investor: string }
>;

export class DotoliInfo extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: DotoliInfoInterface;

  functions: {
    addTokenId(
      fundId: BigNumberish,
      investor: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    createFund(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    decreaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    decreaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    decreaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    feeTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    fundIdCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    fundTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    getFeeTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [([string, BigNumber] & { token: string; amount: BigNumber })[]]
    >;

    getFundTokenAmount(
      fundId: BigNumberish,
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getFundTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [([string, BigNumber] & { token: string; amount: BigNumber })[]]
    >;

    getInvestorTokenAmount(
      fundId: BigNumberish,
      investor: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getInvestorTokens(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<
      [([string, BigNumber] & { token: string; amount: BigNumber })[]]
    >;

    getTokenIds(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber[]] & { _tokenIds: BigNumber[] }>;

    increaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    increaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    increaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    investingFundCount(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    investingFunds(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    investorCount(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    investorTokens(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    isSubscribed(
      investor: string,
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    manager(arg0: BigNumberish, overrides?: CallOverrides): Promise<[string]>;

    managingFund(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    setOwner(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    subscribe(
      fundId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    subscribedFunds(
      investor: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber[]]>;

    tokenIdOwner(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    tokenIds(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  addTokenId(
    fundId: BigNumberish,
    investor: string,
    tokenId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  createFund(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  decreaseFeeToken(
    fundId: BigNumberish,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  decreaseFundToken(
    fundId: BigNumberish,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  decreaseInvestorToken(
    fundId: BigNumberish,
    investor: string,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  feeTokens(
    arg0: BigNumberish,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

  fundIdCount(overrides?: CallOverrides): Promise<BigNumber>;

  fundTokens(
    arg0: BigNumberish,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

  getFeeTokens(
    fundId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

  getFundTokenAmount(
    fundId: BigNumberish,
    token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getFundTokens(
    fundId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

  getInvestorTokenAmount(
    fundId: BigNumberish,
    investor: string,
    token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getInvestorTokens(
    fundId: BigNumberish,
    investor: string,
    overrides?: CallOverrides
  ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

  getTokenIds(
    fundId: BigNumberish,
    investor: string,
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  increaseFeeToken(
    fundId: BigNumberish,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  increaseFundToken(
    fundId: BigNumberish,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  increaseInvestorToken(
    fundId: BigNumberish,
    investor: string,
    token: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  investingFundCount(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  investingFunds(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  investorCount(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  investorTokens(
    arg0: BigNumberish,
    arg1: string,
    arg2: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

  isSubscribed(
    investor: string,
    fundId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  manager(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  managingFund(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  owner(overrides?: CallOverrides): Promise<string>;

  setOwner(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  subscribe(
    fundId: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  subscribedFunds(
    investor: string,
    overrides?: CallOverrides
  ): Promise<BigNumber[]>;

  tokenIdOwner(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  tokenIds(
    arg0: BigNumberish,
    arg1: string,
    arg2: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    addTokenId(
      fundId: BigNumberish,
      investor: string,
      tokenId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    createFund(overrides?: CallOverrides): Promise<BigNumber>;

    decreaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    decreaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    decreaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    feeTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    fundIdCount(overrides?: CallOverrides): Promise<BigNumber>;

    fundTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    getFeeTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

    getFundTokenAmount(
      fundId: BigNumberish,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFundTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

    getInvestorTokenAmount(
      fundId: BigNumberish,
      investor: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInvestorTokens(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<([string, BigNumber] & { token: string; amount: BigNumber })[]>;

    getTokenIds(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    increaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    increaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    increaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    investingFundCount(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investingFunds(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investorCount(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investorTokens(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, BigNumber] & { token: string; amount: BigNumber }>;

    isSubscribed(
      investor: string,
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    manager(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

    managingFund(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<string>;

    setOwner(newOwner: string, overrides?: CallOverrides): Promise<void>;

    subscribe(fundId: BigNumberish, overrides?: CallOverrides): Promise<void>;

    subscribedFunds(
      investor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    tokenIdOwner(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    tokenIds(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "FundCreated(uint256,address)"(
      fundId?: null,
      manager?: string | null
    ): TypedEventFilter<
      [BigNumber, string],
      { fundId: BigNumber; manager: string }
    >;

    FundCreated(
      fundId?: null,
      manager?: string | null
    ): TypedEventFilter<
      [BigNumber, string],
      { fundId: BigNumber; manager: string }
    >;

    "InfoCreated()"(): TypedEventFilter<[], {}>;

    InfoCreated(): TypedEventFilter<[], {}>;

    "OwnerChanged(address,address)"(
      owner?: null,
      newOwner?: null
    ): TypedEventFilter<[string, string], { owner: string; newOwner: string }>;

    OwnerChanged(
      owner?: null,
      newOwner?: null
    ): TypedEventFilter<[string, string], { owner: string; newOwner: string }>;

    "Subscribe(uint256,address)"(
      fundId?: null,
      investor?: string | null
    ): TypedEventFilter<
      [BigNumber, string],
      { fundId: BigNumber; investor: string }
    >;

    Subscribe(
      fundId?: null,
      investor?: string | null
    ): TypedEventFilter<
      [BigNumber, string],
      { fundId: BigNumber; investor: string }
    >;
  };

  estimateGas: {
    addTokenId(
      fundId: BigNumberish,
      investor: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    createFund(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    decreaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    decreaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    decreaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    feeTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    fundIdCount(overrides?: CallOverrides): Promise<BigNumber>;

    fundTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFeeTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFundTokenAmount(
      fundId: BigNumberish,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFundTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInvestorTokenAmount(
      fundId: BigNumberish,
      investor: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInvestorTokens(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenIds(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    increaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    increaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    increaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    investingFundCount(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investingFunds(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investorCount(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    investorTokens(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isSubscribed(
      investor: string,
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    manager(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    managingFund(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    setOwner(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    subscribe(
      fundId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    subscribedFunds(
      investor: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenIdOwner(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    tokenIds(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addTokenId(
      fundId: BigNumberish,
      investor: string,
      tokenId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    createFund(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    decreaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    decreaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    decreaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    feeTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    fundIdCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    fundTokens(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFeeTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFundTokenAmount(
      fundId: BigNumberish,
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFundTokens(
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInvestorTokenAmount(
      fundId: BigNumberish,
      investor: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInvestorTokens(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenIds(
      fundId: BigNumberish,
      investor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    increaseFeeToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    increaseFundToken(
      fundId: BigNumberish,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    increaseInvestorToken(
      fundId: BigNumberish,
      investor: string,
      token: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    investingFundCount(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    investingFunds(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    investorCount(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    investorTokens(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isSubscribed(
      investor: string,
      fundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    manager(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    managingFund(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setOwner(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    subscribe(
      fundId: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    subscribedFunds(
      investor: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenIdOwner(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokenIds(
      arg0: BigNumberish,
      arg1: string,
      arg2: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
