import { useState } from "react";
export default function Card(prop) {
    const [dataInput, setData] = useState({ 
        value: "", 
        term: "" 
      })
    
    return(
        <div>
            <img src={prop.uri}/>
            
        </div>
    )}