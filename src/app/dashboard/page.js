"use client";
import styles from "../../styles/dashboard.module.css";

import { CollateralContract } from "../config-address.js";

import { CollateralFundsContract } from "../config-address.js";

import { CollateralAbi } from "../config-abi.js";

import web3modal from "web3modal";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const CollateralContractAbi = CollateralAbi;

  const [uri, setUri] = useState({ collateral: "", lending: "" });
  const [collateralClaimed, setCollateralClaimed] = useState(false);

  const [state, setState] = useState(false);

  useEffect(() => {
    fetchdata().then(setState(true));
    hasClaimedCollateral();
  }, []);

  async function fetchdata() {
    const promise1 = fetchCollateralStake();

    const [result1] = await Promise.all([promise1]);
  }

  // const CollateralContract = "0xDbAe147fbcCE70b6C238f231ff854817412720a8";
  // const CollateralFundsContract = "0xb41eA4DEF472879812DF17d987Be179073AB5f46";
  const tokenAddress = "0x01456A1e09d59E39C13ba8561188D637a7FE2C4a"; //usdt

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
    try {
      const signer = await getSignerOrProvider(true);
      const contract = new ethers.Contract(
        CollateralContract,
        CollateralContractAbi,
        signer
      );
      const user = await fetchAccount();
      const stake = await contract.userToStake(user);
      const parsedData = {
        contractAdd: stake.contractAdd,
        tokenId: stake.tokenId,
      };
      // console.log("collateral", parsedData)
      if (parsedData.tokenId == null) return;
      const nftcontract = new ethers.Contract(
        parsedData.contractAdd,
        uriAbi,
        signer
      );
      const id = parsedData.tokenId;
      const uriHere = await nftcontract.tokenURI(id.toNumber());
      console.log(uriHere);
      setUri({ ...uri, collateral: uriHere });
    } catch (error) {
      // console.log(error)
    }
  }

  async function claimCollateral() {
    const signer = await getSignerOrProvider(true);
    // const provider = new ethers.providers.JsonRpcProvider(`https://stylish-dark-violet.matic-testnet.discover.quiknode.pro/d935f45044efc89c96e437b0774f40b074c7816e/`)
    const provider = await getSignerOrProvider();
    const contract = new ethers.Contract(
      CollateralContract,
      CollateralContractAbi,
      signer
    );
    const user = await fetchAccount();
    const gasPrice = await provider.getFeeData();
    const gas = ethers.utils.formatUnits(gasPrice.gasPrice, "wei");
    const transaction = {
      from: user,
      gasPrice: gas,
      gasLimit: "1000000",
      maxFeePerGas: "300",
      maxPriorityFeePerGas: "10",
    };
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
    const gasPrice = await provider.getFeeData();
    const gas = ethers.utils.formatUnits(gasPrice.gasPrice, "wei");
    const transaction = {
      from: user,
      gasPrice: gas,
      gasLimit: "100000",
      maxFeePerGas: "300",
      maxPriorityFeePerGas: "10",
    };
    const txn = await contract.unstake();
    await approve.wait();
    await txn.wait();
    router.push("/collateral");
  }

  function CardCollateral() {
    return (
      <div className={styles.col}>
        {uri.collateral ? (
          <div className={styles.card}>
            <img src={uri.collateral} />
            <div className={styles.bb}>
              {collateralClaimed ? (
                <button onClick={claimCollateral} disabled>
                  {" "}
                  Claimed{" "}
                </button>
              ) : (
                <button onClick={claimCollateral}> Claim </button>
              )}
              <button onClick={unstakeCollateral}> Unstake </button>
            </div>
          </div>
        ) : null}
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
        </div>
      </div>
    );
  }
}
