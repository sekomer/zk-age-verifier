const fs = require("fs");
const path = require("path");
const axios = require("axios");
const exec = require("child_process").exec;
const snarkjs = require("snarkjs");

const ptauName = "powersOfTau28_hez_final_12.ptau";

async function downloadPtau() {
  fs.mkdirSync("./ptaus", { recursive: true });

  if (fs.existsSync(`./ptaus/${ptauName}`)) {
    return;
  }

  const url = `https://hermez.s3-eu-west-1.amazonaws.com/${ptauName}`;
  const filename = path.basename(url);
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
  });
  const writer = fs.createWriteStream(`./ptaus/${filename}`);
  const totalBytes = response.headers["content-length"];
  let downloadedBytes = 0;

  response.data.on("data", (chunk) => {
    downloadedBytes += chunk.length;
    const progress = (downloadedBytes / totalBytes) * 100;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Downloading ptau: ${progress.toFixed(2)}%`);
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      resolve();
    });
    writer.on("error", reject);
  });
}

async function compileCircuit() {
  fs.mkdirSync("./build", { recursive: true });

  exec(
    "circom circuits/age.circom --wasm --r1cs -o ./build",
    function (err, stdout, stderr) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(stdout);
    }
  );

  await snarkjs.zKey.newZKey(
    "./build/age.r1cs",
    "./ptaus/powersOfTau28_hez_final_12.ptau",
    "age.zkey"
  );

  process.exit(0);
}

async function main() {
  await downloadPtau();
  await compileCircuit();
}

main()
  .then(() => {
    console.log("done!");
    process.exit(0);
  })
  .catch(console.error);
