import { useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useLogin } from "../context/UserContext";
import { SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  executeSponsoredTxn,
} from "../utils/sponsorWalletUtils";

const FULLNODE_URL = import.meta.env.VITE_APP_SUI_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "mainnet" | "testnet";

const MintNFT = () => {
  const flow = useEnokiFlow();
  const { userDetails } = useLogin();

  const [loading, setLoading] = useState(false);
  const [txnDigest, setTxnDigest] = useState("");

  const handleNFTMint = async () => {
    try {
      setLoading(true);
      const suiClient = new SuiClient({ url: FULLNODE_URL });
      const keypair = await flow.getKeypair({ network: NETWORK });

      // Mint Sample NFT
      const txb = new TransactionBlock();
      txb.moveCall({
        target:
          "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
        arguments: [
          txb.pure("Suiet NFT"),
          txb.pure("Suiet Sample NFT"),
          txb.pure(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });

      const txnRes = await suiClient.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      console.log("txnRes", txnRes);

      if (txnRes && txnRes?.digest) {
        setTxnDigest(txnRes?.digest);
        alert(`NFT Minting Success. Digest: ${txnRes?.digest}`);
      }
    } catch (err) {
      console.log("Error Minting NFT.", err);
      alert("Error minting NFT. Check logs for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleNFTMintSponsored = async () => {
    try {
      setLoading(true);

      // Mint Sample NFT
      const txb = new TransactionBlock();
      txb.moveCall({
        target:
          "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
        arguments: [
          txb.pure("Suiet NFT"),
          txb.pure("Suiet Sample NFT"),
          txb.pure(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });

      const txnRes = await executeSponsoredTxn(
        txb,
        flow,
        userDetails
      );

      console.log("txnRes", txnRes);

      if (txnRes && txnRes?.digest) {
        setTxnDigest(txnRes?.digest);
        alert(`Sponsored NFT Minting Success. Digest: ${txnRes?.digest}`);
      }
    } catch (err) {
      console.log("Error Minting NFT.", err);
      alert("Error minting NFT. Check logs for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Mint NFT</h3>

      <div>
        <button onClick={handleNFTMint}>Mint NFT</button>
        <button onClick={handleNFTMintSponsored}>
          Mint NFT (Sponsored Txn)
        </button>
        <div>{txnDigest && <div>Transaction Digest: {txnDigest}</div>}</div>
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default MintNFT;
