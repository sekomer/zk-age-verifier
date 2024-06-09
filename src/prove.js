const fs = require("fs");
const snarkjs = require("snarkjs");

async function main() {
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      in: 18,
    },
    "build/age_js/age.wasm",
    "age.zkey"
  );

  // save proof and publicSignals to a file
  const proofJson = JSON.stringify(proof);
  const publicSignalsJson = JSON.stringify(publicSignals);

  fs.writeFileSync("proof.json", proofJson);
  fs.writeFileSync("publicSignals.json", publicSignalsJson);

  const vkey = await snarkjs.zKey.exportVerificationKey("age.zkey");
  fs.writeFileSync("verification_key.json", JSON.stringify(vkey));
}

main()
  .then(() => {
    console.log("done!");
    process.exit(0);
  })
  .catch(console.error);
