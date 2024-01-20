"use client";

import { useEffect, useState } from "react";
import Moralis from "moralis";
import Navbar from "../components/Navbar";
import { CollateralContract } from "../config-address";
import { CollateralAbi } from "../config-abi";
import web3modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";
import { saveAs } from "file-saver";
import Card from "../components/CardCollateral";

export default function Collateral() {
  const contractAddress = CollateralContract;
  const contractAbi = CollateralAbi;

  const [nfts, setNfts] = useState([]);

  // const router = useRouter()

  useEffect(() => {
    fetchAccount().then((user) => fetch(user));
  }, []);

  async function fetchAccount() {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      // setUser(account)
      return account;
    }
  }

  async function fetch(user) {
    const options = {
      method: "GET",
      url: `https://deep-index.moralis.io/api/v2/${user}/nft`,
      params: { chain: "mumbai", format: "hex", normalizeMetadata: "false" },
      headers: {
        accept: "application/json",
        "X-API-Key":
          "ECu9sgtiXTgwMKEoJCg0xkjXfwm2R3NhOAATMBiTNIQoIzd7cAmeBibctzQyLkvY",
      },
    };

    const data = await axios.request(options);
    const res = await data.data.result;
    console.log("res", res);
    setNfts(res);
    return res;
  }

  const nftabi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  async function Collateral(prop) {
    const modal = new web3modal();
    const connection = await modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const nftAddress = prop.tokenContract;
    const nftcontract = new ethers.Contract(
      nftAddress.toString(),
      nftabi,
      signer
    );
    console.log(prop.dataInput);
    const approve = await nftcontract.approve(contractAddress, prop.tokenId);
    const valueString = prop.dataInput.value;
    const parseValue = ethers.utils.parseUnits(valueString, "ether");
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);
    const txn = await contract.deposit(
      prop.tokenContract,
      prop.tokenId,
      parseValue,
      prop.dataInput.term
    );

    await approve.wait();
    await txn.wait();
    // router.push('/dashboard')
    fetch();
  }

  if (nfts.length == 0) {
    return (
      <div className="">
        <Navbar />
        <h2>Lock your Nfts and get 40% of value</h2>
        <h1 className="">No Nfts in your wallet</h1>
      </div>
    );
  }

  return (
    <div className="">
      <Navbar />
      <h2>Lock your Nfts and get 40% of value</h2>

      <div className="">
        {nfts.map((nft, i) => (
          <Card
            key={i}
            uri={nft.token_uri}
            tokenContract={nft.token_address}
            tokenId={nft.token_id}
            Collateral={Collateral}
          />
        ))}
      </div>
    </div>
  );
}
