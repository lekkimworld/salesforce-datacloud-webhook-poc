import express from "express";
import { json } from "body-parser";
import crypto from "crypto";
import { config as dotenv_config } from "dotenv";
import {InvalidSignatureError, MissingSignatureError, errorHandler} from "./errors";
dotenv_config();

// store last request
let lastsuccess: any;

// read environment
if (!process.env.DATACLOUD_SIGNING_KEY) {
  console.error("Missing DATACLOUD_SIGNING_KEY environment variable");
  process.exit(1);
}
const SIGNING_ALGORITHM = "sha256";
const SIGNING_KEY = Buffer.from(process.env.DATACLOUD_SIGNING_KEY, "utf8");

// create app
const app = express();
app.use(
  json({
    inflate: true,
    limit: "1mb",
    verify(req, res, buf, encoding) {
      // show raw buffer
      console.log("Request verification - incoming body follows");
      console.log(buf.toString("utf8"));

      // get header
      const signature = req.headers["x-signature"];
      if (!signature) throw new MissingSignatureError();

      // compute signature on body
      const hash = crypto
        .createHmac(SIGNING_ALGORITHM, SIGNING_KEY)
        .update(buf)
        .digest("base64");
      console.log("Computed signature", hash);

      // validate
      if (signature !== hash) {
        throw new InvalidSignatureError();
      }

      // continue chain
      console.log("Validated signature - passing request on...");
    },
  })
);

/**
 * Process incoming webhook requests.
 */
app.post("/", (req, res) => {
  // get body
  const obj = req.body;
  lastsuccess = obj;
  
  // response
  return res.status(200).end();
});

app.get("/last", (req, res) => {
  res.type("application/json").send(lastsuccess);
});

// listen
app.use(errorHandler);
app.listen(process.env.PORT || 8080);
