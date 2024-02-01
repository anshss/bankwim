import { useState } from 'react';
import styles from '../styles/collateral.module.css'

export function Card(prop) {
    const [dataInput, setData] = useState({ 
        value: "", 
        term: "" 
      })
      
    return (
      <div className={styles.card}>
        <img 
        className="w-full p-4 border border-white border-2 rounded-sm"
        src={prop.uri} />
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
  