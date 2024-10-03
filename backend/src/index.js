import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

import { executeTx, sponsorTx } from "./services/sponsoredServices.js";

app.use(cors());
app.use(express.json());

app.post("/api/v1/sponsor", async (req, res) => {
  const { network, sender, txBytes, allowedAddresses, allowedMoveCallTargets } =
    req.body;

  if (!network || !sender || !txBytes) {
    return res.status(400).json({
      error: "Missing necessary parameters.",
    });
  }

  try {
    const sponsoredTxRes = await sponsorTx({
      network,
      sender,
      transactionKindBytes: txBytes,
      allowedAddresses,
      allowedMoveCallTargets,
    });

    return res.status(200).json({
      bytes: sponsoredTxRes.bytes,
      digest: sponsoredTxRes.digest,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the transaction." });
  }
});

app.post("/api/v1/execute", async (req, res) => {
  const { digest, signature } = req.body;

  if (!digest || !signature) {
    return res.status(400).json({
      error: "Missing necessary parameters.",
    });
  }

  try {
    const sponsoredTxRes = await executeTx({
      digest,
      signature,
    });

    if (!sponsoredTxRes.digest) {
      return res.status(400).json({
        error: "Failed to get digest for the transaction.",
      });
    }

    return res.status(200).json({
      digest: sponsoredTxRes.digest,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the transaction." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
