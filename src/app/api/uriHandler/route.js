import { NextRequest, NextResponse } from "next/server";

export async function POST(req, res) {
  try {
    const reqBody = await req.json()
    const { ipfsUri } = reqBody;
    console.log("ipfsUri")
    console.log(ipfsUri)

    if (!ipfsUri) {
      return res.json({ error: "Missing IPFS URL" });
    }
    const ipfsResponse = await fetch(ipfsUri);
    // console.log(ipfsResponse)
    const ipfsData = await ipfsResponse.json();
    console.log(ipfsData)

    return NextResponse.json({ipfsData:ipfsData});
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
