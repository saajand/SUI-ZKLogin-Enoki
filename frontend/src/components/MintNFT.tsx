import { useState } from "react";
import { useEnokiFlow } from "@mysten/enoki/react";
import { useLogin } from "../context/UserContext";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { fromBase64, toBase64 } from "@mysten/sui/utils";
import { executeSponsoredTxn } from "../utils/sponsorWalletUtils";

const FULLNODE_URL = import.meta.env.VITE_APP_SUI_FULLNODE_URL as string;
const NETWORK = import.meta.env.VITE_APP_NETWORK as "mainnet" | "testnet";
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL as string;

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
      const txb = new Transaction();
      txb.moveCall({
        target:
          "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
        arguments: [
          txb.pure.string("Suiet NFT"),
          txb.pure.string("Suiet Sample NFT"),
          txb.pure.string(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });

      const txnRes = await suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: txb,
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
      const txb = new Transaction();
      txb.moveCall({
        target:
          "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
        arguments: [
          txb.pure.string("Suiet NFT"),
          txb.pure.string("Suiet Sample NFT"),
          txb.pure.string(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });

      const txnRes = await executeSponsoredTxn(txb, flow, userDetails);

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

  const handleNFTMintSponsoredUsingEnoki = async () => {
    try {
      setLoading(true);
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const keypair = await flow.getKeypair({ network: NETWORK });

      // Mint Sample NFT
      const txb = new Transaction();
      txb.moveCall({
        target:
          "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
        arguments: [
          txb.pure.string("Suiet NFT"),
          txb.pure.string("Suiet Sample NFT"),
          txb.pure.string(
            "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
          ),
        ],
      });

      const kindBytes = await txb.build({
        client: suiClient,
        onlyTransactionKind: true,
      });
      console.log("kindBytes", kindBytes);
      const kindBytesB64 = toBase64(kindBytes);

      const sponsorTxnData = await fetch(`${BACKEND_URL}/api/v1/sponsor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network: "testnet",
          sender: userDetails.address,
          txBytes: kindBytesB64,
          allowedAddresses: [userDetails.address],
          allowedMoveCallTargets: [
            "0x5ea6aafe995ce6506f07335a40942024106a57f6311cb341239abf2c3ac7b82f::nft::mint",
          ],
        }),
      });
      const sponsorTxnDataJson = await sponsorTxnData.json();
      console.log("sponsorTxnDataJson", sponsorTxnDataJson);

      const sponsoredTxBytes = sponsorTxnDataJson.bytes;
      const signature = await keypair.signTransaction(
        fromBase64(sponsoredTxBytes)
      );
      console.log("signature", signature);

      const executeTxnData = await fetch(`${BACKEND_URL}/api/v1/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          digest: sponsorTxnDataJson.digest,
          signature: signature.signature,
        }),
      });
      const executeTxnDataJson = await executeTxnData.json();
      console.log("executeTxnDataJson", executeTxnDataJson);
      if (executeTxnDataJson && executeTxnDataJson?.digest) {
        setTxnDigest(executeTxnDataJson?.digest);
        alert(
          `Sponsored NFT Minting Success. Digest: ${executeTxnDataJson?.digest}`
        );
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
        <button onClick={handleNFTMintSponsoredUsingEnoki}>
          Mint NFT (Enoki's Sponsored Txn)
        </button>
        <div>{txnDigest && <div>Transaction Digest: {txnDigest}</div>}</div>
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default MintNFT;
