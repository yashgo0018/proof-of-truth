#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Contract names to generate ABIs for
const contracts = ["BidSeller", "Auction", "MixrNFT"];

// Paths
const outDir = path.join(__dirname, "..", "out");
const indexerAbisDir = path.join(__dirname, "..", "..", "indexer", "abis");

// Ensure indexer abis directory exists
if (!fs.existsSync(indexerAbisDir)) {
  fs.mkdirSync(indexerAbisDir, { recursive: true });
}

function generateAbiFile(contractName) {
  try {
    // Read the compiled contract artifact
    const artifactPath = path.join(
      outDir,
      `${contractName}.sol`,
      `${contractName}.json`
    );

    if (!fs.existsSync(artifactPath)) {
      console.error(`❌ Artifact not found: ${artifactPath}`);
      return false;
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    const abi = artifact.abi;

    // Generate TypeScript content
    const tsContent = `export const ${contractName}Abi = ${JSON.stringify(
      abi,
      null,
      2
    )} as const;
`;

    // Write to indexer abis directory
    const outputPath = path.join(indexerAbisDir, `${contractName}Abi.ts`);
    fs.writeFileSync(outputPath, tsContent);

    console.log(`✅ Generated ABI for ${contractName} at ${outputPath}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error generating ABI for ${contractName}:`,
      error.message
    );
    return false;
  }
}

function main() {
  console.log("🔨 Generating TypeScript ABI files for indexer...\n");

  let successCount = 0;
  let totalCount = contracts.length;

  for (const contractName of contracts) {
    if (generateAbiFile(contractName)) {
      successCount++;
    }
  }

  console.log(
    `\n📊 Generated ${successCount}/${totalCount} ABI files successfully`
  );

  if (successCount === totalCount) {
    console.log("🎉 All ABI files generated successfully!");
    process.exit(0);
  } else {
    console.log("⚠️  Some ABI files failed to generate");
    process.exit(1);
  }
}

// Run the script
main();
