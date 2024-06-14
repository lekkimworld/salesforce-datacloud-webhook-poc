import express from "express";
import {json} from "body-parser";
import crypto from "crypto";
import {config as dotenv_config} from "dotenv";
dotenv_config();

// read environment
if (!process.env.DATACLOUD_SIGNING_KEY) {
    console.error("Missing DATACLOUD_SIGNING_KEY environment variable");
    process.exit(1);
}
const SIGNING_ALGORITHM = "HMACSHA256";
const SIGNING_KEY = Buffer.from(process.env.DATACLOUD_SIGNING_KEY, "base64");

// create app
const app = express();

/**
 * Middleware to validate signature of payload.
 * 
 */
app.use((req, res, next) => {
    // get raw body
    const body = req.body;
    console.log(body);

    // get header
    const signature = req.headers["x-signature"];

    // compute signature on body
    const hash = crypto
      .createHmac("sha256", SIGNING_KEY)
      .update(body)
      .digest().toString("base64");
    console.log(hash);

    // validate
    if (signature !== hash) {
        console.log("Signature validation failed");
        return res.status(417).send("Signature validation failed");
    }

    // continue chain
    next();
})

// parse body as json
app.use(json());

// show incoming request
app.post("/", (req, res) => {
    // get body
    const obj = req.body;
    console.log(JSON.stringify(obj, undefined, 2));

    // response
    return res.status(200).end();
})

// listen
app.listen(process.env.PORT || 8080);
