import { EnokiClient } from "@mysten/enoki";

const ENOKI_PRIVATE_API_KEY = process.env.ENOKI_PRIVATE_API_KEY;

export const sponsorTx = async (txData) => {
  try {
    const enokiClient = new EnokiClient({
      apiKey: ENOKI_PRIVATE_API_KEY,
    });

    const sponsoredTxRes = await enokiClient.createSponsoredTransaction({
      network: txData.network || "mainnet",
      transactionKindBytes: txData.transactionKindBytes,
      sender: txData.sender || "",
      allowedAddresses: txData.allowedAddresses,
      allowedMoveCallTargets: txData.allowedMoveCallTargets,
    });
    console.log("sponsoredTxRes", sponsoredTxRes);
    return sponsoredTxRes;
  } catch (error) {
    throw error;
  }
};

export const executeTx = async (txData) => {
  try {
    const enokiClient = new EnokiClient({
      apiKey: ENOKI_PRIVATE_API_KEY,
    });
    const executeTxRes = await enokiClient.executeSponsoredTransaction({
      digest: txData.digest,
      signature: txData.signature,
    });
    console.log("executeTxRes", executeTxRes);
    return executeTxRes;
  } catch (error) {
    throw error;
  }
};
