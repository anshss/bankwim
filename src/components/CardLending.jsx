import { useState } from 'react';
import styles from '../styles/collateral.module.css'
import axios from 'axios';

export function Card(prop) {
    const [dataInput, setData] = useState({ 
        value: "", 
        term: "" 
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
      <div className={styles.card}>
        <img 
        className="w-full p-4 border border-white border-2 rounded-sm"
        src={nftUrl} />
        
        <div className="flex max-w-[400px] justify-around gap-1.5">
          <input
            className="mt-3 bg-white items-center text-center text-xl font-normal border-0 text-black p-2.5 w-[180px] rounded-md"
            name="Value"
            placeholder="Value (Matic)"
            required
            value={dataInput.value}
            onChange={(e) => setData({ ...dataInput, value: e.target.value,})}
          />
          <input
            className="mt-3 bg-white items-center text-center text-xl font-normal border-0 text-black p-2.5 w-[180px] rounded-md"
            name="Term"
            placeholder="Term (weeks)"
            required
            value={dataInput.term}
            onChange={(e) => setData({ ...dataInput, term: e.target.value, })}
          />
        </div>
        <button className="flex justify-center items-center text-center py-3 px-20 m rounded-full border-2 border-black cursor-pointer bg-black hover:bg-white text-white hover:text-black mt-5 font-medium text-base"
         onClick={() => prop.Lending(prop)}>
        Lending
        </button>
      </div>
    )
  }
  