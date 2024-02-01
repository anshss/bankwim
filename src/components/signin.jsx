import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

function SignIn() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { push } = useRouter();

  const handleAuth = async () => {
    if (isConnected) {
      await disconnectAsync();
    }

    const { account, chain } = await connectAsync({
      connector: new MetaMaskConnector(),
    });

    console.log(account, chain);

    const userData = { address: account, chain: chain.id, network: "evm" };

    const { data } = await axios.post("/api/auth/request-message", userData);

    const message = data.message.message;
    console.log(message.message);

    const signature = await signMessageAsync({ message });

    // redirect user after success authentication to '/user' page
    // const { url } = await signIn("credentials", {
    //   message,
    //   signature,
    //   redirect: "/user",
    // });
    /**
     * instead of using signIn(..., redirect: "/user")
     * we get the url from callback and push it to the router to avoid page refreshing
     */
    //console.log(url);
    //push(url);
    setIsSignedIn(true);
  };

  return (
    <div >
     <button className="text-black hover:text-white bg-white hover:bg-black border border-gray-200 focus:ring-4 focus:outline-none font-medium rounded-full text-md px-10 py-2 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2 mt-1">
     <p onClick={handleAuth}>
      {isSignedIn ? 'Signed' : 'Sign-In'}
    </p>
      </button> 
    </div>
  );
}

export default SignIn;
