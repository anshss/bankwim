import { useState } from "react";
import styles from "../styles/collateral.module.css";
import Image from "next/image";
import axios from "axios";

export default function Card(prop) {
  const [dataInput, setData] = useState({
    value: "",
    term: "",
  });
  const [nftUrl, setNftUrl] = useState();
  console.log(prop.uri)

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

  const imageFromUri = fetchData(prop.uri).then((value) => {
    console.log(setNftUrl(value));
  });

  return (
    <>
   { nftUrl&& <div className={styles.card}>
        <Image src={nftUrl} width={500} height={500}
        className="w-full p-4 border border-white border-1 hover:border-2 rounded-md transition duration-700 ease-in-out"
        ></Image>
        <div className="flex ml-10 w-3/4 justify-around gap-1">
  <input
    name="Value (Matic)"
    placeholder="Value"
    required
    value={dataInput.value}
    onChange={(e) => setData({ ...dataInput, value: e.target.value })}
    style={{ textAlign: 'center' }}
    className="mt-2 bg-white text-black !important text-base font-normal border-none p-1 w-3/4 rounded-md"
  />
  <input
    name="Term"
    placeholder="Term (weeks)"
    required
    value={dataInput.term}
    onChange={(e) => setData({ ...dataInput, term: e.target.value })}
    style={{ textAlign: 'center' }}
    className="mt-2 bg-white text-black !important text-base font-normal border-none p-1 w-3/4 rounded-md"
  />
</div>

      <button
        className="flex justify-center items-center text-center p-[0.5rem] rounded-full border cursor-pointer bg-white hover:bg-black mt-3 ml-9 w-3/4 text-black hover:text-white font-medium text-base"
        onClick={() => prop.Collateral({ ...prop, dataInput: dataInput })}
      >
        Collateral
      </button>
    </div>}</>
  );
}
