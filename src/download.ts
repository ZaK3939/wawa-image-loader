import axios from "axios";
import { Contract, ethers } from "ethers";
import fs from "fs";

import WawaNFT from "./WawaNFT.json";

async function fetchMetadata() {
  const provider = ethers.getDefaultProvider("homestead", process.env.ALCHEMY_API_KEY);

  const contractAddress = "0x2d9181b954736971bb74043d4782dfe93b55a9af";

  const contract = new ethers.Contract(contractAddress, WawaNFT.abi, provider);

  const totalSupply = await contract.totalSupply();
  console.log("Total supply: ", totalSupply.toString());

  const images = {
    image1x: [],
    image10x: [],
    image10xBg: [],
  };

  // spawn 5 threads
  for (let i = 1; i <= totalSupply; i++) {
    if (i % 10 !== 1) {
      continue;
    }

    await Promise.all([
      fetch(i, contract, images),
      fetch(i + 1, contract, images),
      fetch(i + 2, contract, images),
      fetch(i + 3, contract, images),
      fetch(i + 4, contract, images),
      fetch(i + 5, contract, images),
      fetch(i + 6, contract, images),
      fetch(i + 7, contract, images),
      fetch(i + 8, contract, images),
      fetch(i + 9, contract, images),
      fetch(i + 10, contract, images),
    ]);
  }

  fs.writeFileSync("image1x.json", JSON.stringify(images.image1x, null, 2));
  fs.writeFileSync("image10x.json", JSON.stringify(images.image10x, null, 2));
  fs.writeFileSync(
    "image10xBg.json",
    JSON.stringify(images.image10xBg, null, 2)
  );

  console.log("Metadata lists saved!");
}

async function fetch(tokenId: number, contract: Contract, images: any) {
  const tokenURI = await contract.tokenURI(tokenId);
  const response = await axios.get(tokenURI);
  const files = response.data.properties.files;

  console.log(tokenId, response.data.name, tokenURI);

  images.image1x.push(files[1].uri);
  images.image10x.push(files[2].uri);
  images.image10xBg.push(files[0].uri);
}

async function downloadImages(json_path: string, output_path: string) {
  const rawData = fs.readFileSync(json_path, "utf-8");
  const urls: string[] = JSON.parse(rawData);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    await downloadImage(url, `./output/${output_path}/${i + 1}.png`);
    console.log(`Downloaded ${i + 1}.png`);
  }
}

async function downloadImage(url: string, filename: string) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filename, response.data);
}

async function main() {
  await fetchMetadata().catch(console.error);
  await Promise.all([
    downloadImages("image1x.json", "image1x"),
    downloadImages("image10x.json", "image10x"),
    downloadImages("image10xBg.json", "image10xBg"),
  ]);
}

main().catch((error) => {
  console.error("Error downloading images:", error);
});
