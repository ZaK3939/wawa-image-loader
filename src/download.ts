import axios from "axios";
import { ethers } from "ethers";
import fs from "fs";

import WawaNFT from "./WawaNFT.json";

async function fetchMetadata() {
  const provider = ethers.getDefaultProvider("homestead");

  const contractAddress = "0x2d9181b954736971bb74043d4782dfe93b55a9af";

  const contract = new ethers.Contract(contractAddress, WawaNFT.abi, provider);

  const totalSupply = await contract.totalSupply();
  console.log("Total supply: ", totalSupply.toString());

  const metadataList = [];

  for (let i = 1; i <= totalSupply; i++) {
    const tokenURI = await contract.tokenURI(i);
    const response = await axios.get(tokenURI);
    console.log(response.data, tokenURI, response.data.properties.files[2].uri);
    metadataList.push(response.data.properties.files[2].uri);
  }

  fs.writeFileSync("metadataList.json", JSON.stringify(metadataList, null, 2));

  console.log("Metadata list saved to metadataList.json");
}

async function downloadImage(url: string, filename: string) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filename, response.data);
}

async function main() {
  await fetchMetadata().catch(console.error);
  const rawData = fs.readFileSync("metadataList.json", "utf-8");
  const urls: string[] = JSON.parse(rawData);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    await downloadImage(url, `./output/${i + 1}.png`);
    console.log(`Downloaded ${i + 1}.png`);
  }
}

main().catch((error) => {
  console.error("Error downloading images:", error);
});
