"use client";
import web3modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { Web3Storage } from "web3.storage";
import Moralis from "moralis";


// collateral function

async function Collateral(prop) {
    const modal = new web3modal()
    const connection = await modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const nftAddress = prop.tokenContract
    const nftcontract = new ethers.Contract(
      nftAddress.toString(),
      nftabi,
      signer,
    )
    const approve = await nftcontract.approve(contractAddress, prop.tokenId)
    const valueString = dataInput.value
    const parseValue = ethers.utils.parseUnits(valueString, 'ether')
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer,
    )
    const txn = await contract.deposit(
      prop.tokenContract,
      prop.tokenId,
      parseValue,
      dataInput.term,
      )
      await receipt(
        prop.tokenContract,
        prop.tokenId,
        dataInput.term,
        dataInput.value,
      )
      await approve.wait()
      await txn.wait()
      // router.push('/dashboard')
      fetch()
}

function getAccessToken() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQ4NzhFNjQ1NkUwYzUyYzE2RDI5ODI0MWUzNzA1MWY0NDgyM2Q1MTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM2MTU3ODEyMTksIm5hbWUiOiJGb3IgbXkgcHJvamVjdCJ9.4p3tWCPEz4FA9kO9M6-JvrNVyQorsVWXCvJ89ByoWx4'
}

function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() })
}

async function receipt(nftContract, tokenId, term, value) {
    const data = JSON.stringify({
      nftContract: nftContract,
      tokenId: tokenId,
      term: term,
      value: value,
    })
    const files = [new File([data], 'data.json')]
    const metaCID = await uploadToIPFS(files)
    console.log(`https://ipfs.io/ipfs/${metaCID}/data.json`)
    const url =  `https://ipfs.io/ipfs/${metaCID}/data.json`
    Download('receipt.txt', url)
}

async function Download(_fileName, _fileUrl) {
    const name = _fileName;
    const fileUrl = _fileUrl;
    saveAs(fileUrl, name);
}



