# Salesforce Data Cloud Data Action Webhook Proof-of-Concept
This is an example of how to do signature verification on the payloads sent from Data Cloud to a webhook Data Action Target. The most important part is that although the signature key when copied from Data Cloud looks like a base64 encoded binary key it shouldn't be treated as such. Simply extract the UTF-8 bytes from the string and use that to key the SHA-256 HMAC. 

See the source for details.
