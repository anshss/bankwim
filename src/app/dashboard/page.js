"use client";

import styles from "../../styles/dashboard.module.css";

import { CollateralContract } from "../config-address.js";

import { CollateralFundsContract } from "../config-address.js";

import { CollateralAbi } from "../config-abi.js";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import web3modal from "web3modal";

export default function Dashboard() {
  const CollateralContractAbi = CollateralAbi;

  const [uri, setUri] = useState({ collateral: "" });
  const [collateralClaimed, setCollateralClaimed] = useState(false);
  const [nftUrl, setNftUrl] = useState();
  const [state, setState] = useState(false);
  const [collectralBalance, setCollectralBalance] = useState("a");
  const [borrowBalance, setBorrowBalance] = useState("a");
  const [healthFactor, setHealthFactor] = useState("a");
  const [sucessfulReturns, setSucessfulReturns] = useState("a");
  const [creditLimit, setCreditLimit] = useState("a");
  const [creditScore, setCreditScore] = useState("a");

  useEffect(() => {
    fetchdata().then(setState(true));
    hasClaimedCollateral();
    claimTime();
  }, []);

  async function fetchdata() {
    const promise1 = fetchCollateralStake();

    const result1 = await Promise.all([promise1]);
    console.log("result1");
    console.log(promise1);
  }

  // const CollateralContract = "0xDbAe147fbcCE70b6C238f231ff854817412720a8";
  // const CollateralFundsContract = "0xb41eA4DEF472879812DF17d987Be179073AB5f46";
  const tokenAddress = "0x0000A70C55690e20E8bCaf40E8338d8c57496Ca4";

  const router = useRouter();

  const uriAbi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  async function fetchAccount() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];

      return account;
    }
  }

  const getSignerOrProvider = async (needSigner = false) => {
    const modal = new web3modal();
    const connection = await modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    if (needSigner) {
      const signer = provider.getSigner();

      return signer;
    }

    return provider;
  };

  async function fetchCollateralStake() {
    console.log("fetching data");
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );
      console.log(contract);
      const user = await fetchAccount();

      const stake = await contract.userToStake(user);

      console.log(stake);
      const parsedData = {
        contractAdd: stake.contractAdd,
        tokenId: stake.tokenId,
      };
      console.log("collateral", parsedData);
      if (parsedData.tokenId == null) return;
      const nftcontract = new ethers.Contract(
        parsedData.contractAdd,
        uriAbi,
        signer
      );
      console.log(nftcontract);
      const id = parsedData.tokenId;
      const uriHere = await nftcontract.tokenURI(id.toNumber());
      console.log(uriHere);
      setUri({ ...uri, collateral: uriHere });
    } catch (error) {
      console.log(error);
    }
  }

  async function claimCollateral() {
    const signer = await getSignerOrProvider(true);
    //const provider = new ethers.providers.JsonRpcProvider(`https://stylish-dark-violet.matic-testnet.discover.quiknode.pro/d935f45044efc89c96e437b0774f40b074c7816e/`)
    const provider = await getSignerOrProvider();
    const contract = new ethers.Contract(
      CollateralContract,
      CollateralContractAbi,
      signer
    );
    const user = await fetchAccount();
    // const gasPrice = await provider.getFeeData();
    // const gas = ethers.utils.formatUnits(gasPrice.gasPrice, "wei");
    // const transaction = {
    //     from: user,
    //     gasPrice: gas,
    //     gasLimit: "1000000",
    //     maxFeePerGas: "300",
    //     maxPriorityFeePerGas: "10",
    //   };
    const txn = await contract.claim();
    hasClaimedCollateral();
  }

  async function hasClaimedCollateral() {
    try {
      const provider = await getSignerOrProvider();
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        provider
      );
      const user = await fetchAccount();
      const txn = await contract.hasClaimed(user);
      setCollateralClaimed(txn);
    } catch (error) {
      // console.log(error)
    }
  }

  const approveAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  async function unstakeCollateral() {
    const signer = await getSignerOrProvider(true);
    const tokenContract = new ethers.Contract(tokenAddress, approveAbi, signer);
    const contract = new ethers.Contract(
      CollateralContract,
      CollateralContractAbi,
      signer
    );
    // const parseValue = ethers.utils.parseEther("1000");
    const nftValue = await contract.fetchNftValue();
    const approve = await tokenContract.approve(
      CollateralFundsContract,
      nftValue
    );
    const provider = await getSignerOrProvider();
    const user = await fetchAccount();

    // const gasPrice = await provider.getGasPrice();
    // const gasPrice = await provider.getFeeData();
    // const gas = ethers.utils.formatUnits(gasPrice.gasPrice, "wei");
    // const transaction = {
    //   from: user,
    //   gasPrice: gas,
    //   gasLimit: "100000",
    //   maxFeePerGas: "300",
    //   maxPriorityFeePerGas: "10",
    // };

    const txn = await contract.unstake();
    await approve.wait();
    await txn.wait();
    router.push("/collateral");
  }

  const fetchData = async (url) => {
    try {
      const ipfsUrl = url;
      const uslObj = { ipfsUri: ipfsUrl };
      const response = await axios.post("/api/uriHandler/", uslObj);

      const imageUrl = response.data.ipfsData.image;
      return imageUrl;

      console.log("Data from IPFS:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  async function claimTime() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        LendingContract,
        LendingContractAbi,
        signer
      );
      const txn = await contract.claimTime();
      setLendingClaimed(txn);
    } catch (error) {
      // console.log(error)
    }
  }

  const imageFromUri = fetchData(uri.collateral).then((value) => {
    console.log(setNftUrl(value));
  });
  async function getCreditScore() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );

      const user = await fetchAccount();

      const score = await contract.getCreditScore(user);

      // console.log(BigInt(score._hex).toString());
      setCreditScore(BigInt(score._hex).toString());
    } catch (error) {
      console.log(error);
    }
  }
  async function getHealthFactor() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );

      const user = await fetchAccount();

      const score = await contract.getHealthFactor(user);

      // console.log(BigInt(score._hex).toString());
      setHealthFactor(BigInt(score._hex).toString());
    } catch (error) {
      console.log(error);
    }
  }
  async function getSucessfulReturns() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );

      const user = await fetchAccount();

      const score = await contract.getSucessfulReturns(user);

      // console.log(BigInt(score._hex).toString());
      setSucessfulReturns(BigInt(score._hex).toString());
    } catch (error) {
      console.log(error);
    }
  }
  async function getCreditLimit() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );

      const user = await fetchAccount();

      const score = await contract.getCreditLimit(user);

      // console.log(BigInt(score._hex).toString());
      setCreditLimit(BigInt(score._hex).toString());
    } catch (error) {
      console.log(error);
    }
  }

  getCreditScore();
  getHealthFactor();
  getSucessfulReturns();
  getCreditLimit();

  // const imagedata = fetch(uri.collateral);
  // console.log(imagedata);
  function CardCollateral() {
    return (
      <div className="bg-black border-2 rounded-md border-white">
        {uri.collateral ? (
          <div className={styles.card}>
            <Image src={nftUrl} width={300} height={300} alt="nftimage"></Image>
            <div className="flex flex-row w-400 gap-4 p-4 ml-4 mb-0">
              {collateralClaimed ? (
                <button onClick={claimCollateral} disabled>
                  {" "}
                  Claimed{" "}
                </button>
              ) : (
                <button
                  onClick={claimCollateral}
                  className=" border-2 border-white bg-white hover:bg-black text-black hover:text-white p-2 w-3/4 rounded-full"
                >
                  {" "}
                  Claim{" "}
                </button>
              )}
              <button
                onClick={unstakeCollateral}
                className=" border-2 border-white bg-white hover:bg-black text-black hover:text-white p-2 w-3/4 rounded-full"
              >
                {" "}
                Unstake{" "}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (state == true) {
    return (
      <div className="bg-zinc-700 w-full h- ">
        <div className={styles.container}>
          <div>
            <h2 className="text-white text-4xl text-bold mt-40 mb-10 text-center font-mono">
              Collateral
            </h2>
            <div className="">
              <CardCollateral />
            </div>
          </div>
        </div>
        <div className=" ml-60 mt-10 flex flex-col justify-center pb-10 -pr-10 pt-10 w-3/4 ">
          <div className=" w-1/4 ml-96 text-3xl text-center font-sans mb-4 border-2 hover:bg-white hover:text-black cursor-cell rounded-lg text-white ">
            Health Factor : {healthFactor}
          </div>
          <div className="w-1/4 ml-96 text-3xl text-center font-sans mb-4 border-2 hover:bg-white hover:text-black cursor-cell rounded-lg text-white">
            Sucessful Returns : {sucessfulReturns}
          </div>

          <div className="w-1/4 ml-96 text-3xl text-center font-sans border-2 hover:bg-white hover:text-black cursor-cell rounded-lg text-white ">
            Credit Score : {creditScore}
          </div>
        </div>
      </div>
    );
  }

  //lending work
  async function fetchLendingStake() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        LendingContract,
        LendingContractAbi,
        signer
      );
      const user = await fetchAccount();
      const stake = await contract.userToStake(user);
      const parsedData = {
        contractAdd: stake.contractAdd,
        tokenId: stake.tokenId,
      };
      // console.log(parsedData)
      if (parsedData.tokenId == null) return;
      const nftcontract = new ethers.Contract(
        parsedData.contractAdd,
        uriAbi,
        signer
      );
      const id = parsedData.tokenId;
      const uriHere = await nftcontract.tokenURI(id.toNumber());
      console.log(uriHere);
      setUri({ ...uri, lending: uriHere });
    } catch (error) {
      // console.log(error)
    }
  }

  async function claimLending() {
    const signer = await getSignerOrProvider(true);
    const contract = new ethers.Contract(
      LendingContract,
      LendingContractAbi,
      signer
    );
    const txn = await contract.claim();
    await txn.wait();
    setClaimed(true);
  }

  async function unstakeLending() {
    const signer = await getSignerOrProvider(true);
    const contract = new ethers.Contract(
      LendingContract,
      LendingContractAbi,
      signer
    );
    const txn = await contract.unstake();
    await txn.wait();
  }

  async function claimTime() {
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        LendingContract,
        LendingContractAbi,
        signer
      );
      const txn = await contract.claimTime();
      setLendingClaimed(txn);
    } catch (error) {
      // console.log(error)
    }
  }

  function CardLending() {
    return (
      <div className={styles.len}>
        {uri.lending && (
          <div className={styles.card}>
            <img src={uri.lending} />
            <div className={styles.bb}>
              {lendingClaimed ? (
                <button onClick={claimLending} disabled>
                  {" "}
                  Claimed{" "}
                </button>
              ) : (
                <button onClick={claimLending}> Claim </button>
              )}
              <button onClick={unstakeLending}> Unstake </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (state == true) {
    return (
      <div>
        <div className={styles.container}>
          <div>
            <h2 className={styles.heading}>Collateral</h2>
            <CardCollateral />
          </div>
          <div>
            <h2 className={styles.heading}>Lending</h2>
            <CardLending />
          </div>
        </div>
      </div>
    );
  }
}
