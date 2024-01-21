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
        <Image src={nftUrl} width={1080} height={1080}></Image>
      <div className={styles.inpbutton}>
        <input
          name="Value (Matic)"
          placeholder="Value"
          required
          value={dataInput.value}
          onChange={(e) => setData({ ...dataInput, value: e.target.value })}
        />
        <input
          name="Term"
          placeholder="Term (weeks)"
          required
          value={dataInput.term}
          onChange={(e) => setData({ ...dataInput, term: e.target.value })}
        />
      </div>
      <button
        className={styles.cltrlbutton}
        onClick={() => prop.Collateral({ ...prop, dataInput: dataInput })}
      >
        Collateral
      </button>
    </div>}</>
  );
}
