import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { signIn } from "next-auth/react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import axios from "axios";

function SignIn() {
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
    console.log(message.mmessage);

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
  };

  return (
    <div>
      <p onClick={() => handleAuth()}>Sign-in</p>
    </div>
  );
}

export default SignIn;
