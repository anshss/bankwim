import Moralis from "moralis";

import { NextResponse } from "next/server";
console.log("hhhh");

const configx = {
  domain: process.env.APP_DOMAIN,
  statement: "Please sign this message to confirm your identity.",
  uri: process.env.NEXTAUTH_URL,
  expirationTime: "2024-02-01T00:00:00.000Z",
  timeout: 60,
};

const config = {
  domain: "defi.finance",
  statement: "Please sign this message to confirm your identity.",
  uri: "https://defi.finance",
  timeout: 60,
};

// interface RequestMessageEvmOptions {
//   networkType?: 'evm';
//   domain: string;
//   chain: EvmChainish;
//   address: EvmAddressish;
//   statement?: string;
//   uri: string;
//   expirationTime?: string;
//   notBefore?: string;
//   resources?: string[];
//   timeout: number;
// }

export async function POST(req, res) {
  const reqBody = await req.json();
  const { address, chain, network } = reqBody;
  const networkType = network;

  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
  console.log(reqBody);
  console.log("chain");
  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      networkType,
      ...config,
    });

    console.log(message)

    return NextResponse.json({ message: message }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
