# Crystal Cave NFT - IPFS Deployment Guide

## 🌐 Overview

This guide will walk you through uploading your Crystal Cave NFT images and metadata to IPFS using Pinata, ensuring proper decentralized storage for your NFT collection.

## 📋 Prerequisites

1. **Pinata Account**: Sign up at [pinata.cloud](https://pinata.cloud)
2. **API Keys**: Generate Pinata API key and secret
3. **Images Ready**: All 22 artifact images (0.png to 21.png)
4. **Metadata Files**: All 22 JSON metadata files (0.json to 21.json)

## 🚀 Step-by-Step Process

### Step 1: Prepare Your Pinata Environment

#### 1.1 Get Pinata API Credentials
```bash
# Log into Pinata Dashboard
# Go to: https://app.pinata.cloud/keys
# Create new API key with permissions:
# - pinFileToIPFS
# - pinJSONToIPFS
# - userPinnedDataTotal
```

#### 1.2 Install Pinata SDK (Optional)
```bash
npm install --save-dev @pinata/sdk axios
```

### Step 2: Upload Images to IPFS

#### 2.1 Prepare Images Folder
```bash
# Ensure all images are in public/images/
ls public/images/
# Should show: 0.png, 1.png, 2.png, ..., 21.png
```

#### 2.2 Upload Images via Pinata Web Interface

**Method A: Web Upload (Recommended for simplicity)**
1. Go to [Pinata Files](https://app.pinata.cloud/pinmanager)
2. Click "Upload" → "Folder"
3. Select your `public/images/` folder
4. Name it: `crystal-cave-artifacts-images`
5. Click "Upload"
6. **Copy the IPFS hash** (starts with `Qm...` or `bafy...`)

**Method B: API Upload (Advanced)**
```javascript
// scripts/upload-images.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const pinata = pinataSDK('YOUR_API_KEY', 'YOUR_SECRET_KEY');

async function uploadImages() {
    const imagesPath = path.join(__dirname, '..', 'public', 'images');
    
    const options = {
        pinataMetadata: {
            name: 'crystal-cave-artifacts-images',
            keyvalues: {
                project: 'crystal-cave-nft',
                version: '1.0'
            }
        }
    };
    
    try {
        const result = await pinata.pinFromFS(imagesPath, options);
        console.log('Images uploaded to IPFS:');
        console.log('Hash:', result.IpfsHash);
        console.log('Size:', result.PinSize);
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading images:', error);
    }
}

uploadImages();
```

#### 2.3 Verify Image Upload
Test your images are accessible:
```
https://gateway.pinata.cloud/ipfs/YOUR_IMAGES_HASH/0.png
https://gateway.pinata.cloud/ipfs/YOUR_IMAGES_HASH/1.png
// etc.
```

### Step 3: Update Metadata with IPFS Image URLs

#### 3.1 Create Metadata Update Script
```javascript
// scripts/update-metadata-ipfs.js
const fs = require('fs');
const path = require('path');

const IMAGES_IPFS_HASH = 'YOUR_IMAGES_HASH_HERE'; // Replace with actual hash
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

function updateMetadataWithIPFS() {
    console.log('🔄 Updating metadata files with IPFS URLs...\n');
    
    for (let i = 0; i < 22; i++) {
        const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${i}.json`);
        
        try {
            // Read current metadata
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            // Update image URL to IPFS
            const newImageURL = `${IPFS_GATEWAY}/${IMAGES_IPFS_HASH}/${i}.png`;
            metadata.image = newImageURL;
            
            // Write updated metadata
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            
            console.log(`✅ Updated ${i}.json with IPFS image URL`);
            console.log(`   Image: ${newImageURL}`);
        } catch (error) {
            console.error(`❌ Error updating ${i}.json:`, error.message);
        }
    }
    
    console.log('\n🎉 All metadata files updated with IPFS URLs!');
}

// Usage instructions
if (process.argv.length < 3) {
    console.log('Usage: node update-metadata-ipfs.js <IMAGES_IPFS_HASH>');
    console.log('Example: node update-metadata-ipfs.js QmYourImagesHashHere');
    process.exit(1);
}

const imagesHash = process.argv[2];
console.log('Images IPFS Hash:', imagesHash);

// Update the script with the provided hash
const scriptContent = fs.readFileSync(__filename, 'utf8');
const updatedScript = scriptContent.replace(
    'YOUR_IMAGES_HASH_HERE', 
    imagesHash
);
fs.writeFileSync(__filename, updatedScript);

updateMetadataWithIPFS();
```

#### 3.2 Run Metadata Update
```bash
node scripts/update-metadata-ipfs.js QmYourImagesHashHere
```

### Step 4: Upload Metadata to IPFS

#### 4.1 Upload Metadata via Pinata Web Interface

**Method A: Web Upload**
1. Go to [Pinata Files](https://app.pinata.cloud/pinmanager)
2. Click "Upload" → "Folder"
3. Select your `public/metadata/` folder
4. Name it: `crystal-cave-artifacts-metadata`
5. Click "Upload"
6. **Copy the metadata IPFS hash**

**Method B: API Upload**
```javascript
// scripts/upload-metadata.js
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

const pinata = pinataSDK('YOUR_API_KEY', 'YOUR_SECRET_KEY');

async function uploadMetadata() {
    const metadataPath = path.join(__dirname, '..', 'public', 'metadata');
    
    const options = {
        pinataMetadata: {
            name: 'crystal-cave-artifacts-metadata',
            keyvalues: {
                project: 'crystal-cave-nft',
                version: '1.0',
                description: 'Crystal Cave NFT metadata with IPFS image URLs'
            }
        }
    };
    
    try {
        const result = await pinata.pinFromFS(metadataPath, options);
        console.log('Metadata uploaded to IPFS:');
        console.log('Hash:', result.IpfsHash);
        console.log('Size:', result.PinSize);
        
        // Test metadata accessibility
        console.log('\nTest URLs:');
        console.log(`0.json: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/0.json`);
        console.log(`21.json: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}/21.json`);
        
        return result.IpfsHash;
    } catch (error) {
        console.error('Error uploading metadata:', error);
    }
}

uploadMetadata();
```

#### 4.2 Verify Metadata Upload
Test your metadata is accessible:
```
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/0.json
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/21.json
```

### Step 5: Update Smart Contract Base URI

#### 5.1 Prepare New Base URI
```javascript
// Your new base URI should be:
const newBaseURI = "https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/";

// Note the trailing slash - this is important!
// Contract will append "0.json", "1.json", etc.
```

#### 5.2 Update Deployment Script
```solidity
// script/Deploy.s.sol
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // Use your IPFS metadata hash
        string memory baseURI = "https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/";
        CrystalCaveNFT nft = new CrystalCaveNFT(baseURI);
        
        console.log("Contract deployed to:", address(nft));
        console.log("Base URI set to:", baseURI);
        
        vm.stopBroadcast();
    }
}
```

#### 5.3 Update Existing Contract (If Already Deployed)
```bash
# If contract is already deployed, update base URI
cast send YOUR_CONTRACT_ADDRESS "updateBaseURI(string)" "https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/" --private-key YOUR_PRIVATE_KEY --rpc-url $ETH_RPC_URL
```

### Step 6: Verification and Testing

#### 6.1 Create IPFS Verification Script
```javascript
// scripts/verify-ipfs.js
const axios = require('axios');

const METADATA_HASH = 'YOUR_METADATA_HASH';
const IMAGES_HASH = 'YOUR_IMAGES_HASH';
const GATEWAY = 'https://gateway.pinata.cloud/ipfs';

async function verifyIPFS() {
    console.log('🔍 Verifying IPFS deployment...\n');
    
    // Test metadata files
    for (let i = 0; i < 22; i++) {
        try {
            const metadataUrl = `${GATEWAY}/${METADATA_HASH}/${i}.json`;
            const response = await axios.get(metadataUrl);
            const metadata = response.data;
            
            // Verify metadata structure
            if (!metadata.name || !metadata.image || !metadata.attributes) {
                throw new Error('Invalid metadata structure');
            }
            
            // Verify image URL points to IPFS
            if (!metadata.image.includes(IMAGES_HASH)) {
                throw new Error('Image URL does not point to IPFS');
            }
            
            console.log(`✅ ${i}.json verified`);
            console.log(`   Name: ${metadata.name}`);
            console.log(`   Image: ${metadata.image}`);
            
        } catch (error) {
            console.error(`❌ Error verifying ${i}.json:`, error.message);
        }
    }
    
    console.log('\n🎉 IPFS verification complete!');
}

verifyIPFS();
```

#### 6.2 Test Complete Flow
```bash
# Run verification
node scripts/verify-ipfs.js

# Test with deployment verification
npm run verify-deployment YOUR_CONTRACT_ADDRESS
```

## 📊 IPFS URLs Summary

After completion, your URLs will look like:

```
Images:
https://gateway.pinata.cloud/ipfs/QmYourImagesHash/0.png
https://gateway.pinata.cloud/ipfs/QmYourImagesHash/1.png
...
https://gateway.pinata.cloud/ipfs/QmYourImagesHash/21.png

Metadata:
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/0.json
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/1.json
...
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/21.json

Contract Base URI:
https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/
```

## 🔧 Troubleshooting

### Common Issues

**Images not loading:**
- Verify IPFS hash is correct
- Check file names match exactly (0.png, 1.png, etc.)
- Test gateway URL directly in browser

**Metadata validation fails:**
- Ensure JSON files are valid
- Check image URLs in metadata point to IPFS
- Verify all 22 files are present

**Contract deployment fails:**
- Ensure base URI ends with "/"
- Check gas limits and network connection
- Verify private key is properly imported

## 🔍 Contract Verification After IPFS Deployment

### Automated Verification
```bash
# Use the comprehensive verification script
node scripts/verify-contract.js 0xYourContractAddress

# This will attempt multiple verification methods:
# 1. Official Monad Sourcify
# 2. Standard Foundry with --verify flag  
# 3. Default Sourcify (fallback)
# 4. Check if already verified
```

### Manual Verification Steps
If automated verification fails:

1. **Monad Explorer Web Interface**
   - Visit: https://testnet.monadexplorer.com/verify-contract
   - Contract Address: `0xYourContractAddress`
   - Compiler: `v0.8.20+commit.a1b79de6`
   - Optimization: `true` (200 runs)

2. **Sourcify Direct Upload**
   - Visit: https://sourcify.dev/#/verifier
   - Upload: `src/contracts/CrystalCaveNFT.sol`
   - Chain ID: `10143` (Monad Testnet)

3. **Required Contract Information**
   ```
   Contract Path: src/contracts/CrystalCaveNFT.sol
   Contract Name: CrystalCaveNFT
   Solidity Version: 0.8.20
   Optimization: true (200 runs)
   License: MIT
   ```

### Verification Links
After successful verification:
- **Contract**: https://testnet.monadexplorer.com/address/0xYourContractAddress
- **Verification Status**: https://testnet.monadexplorer.com/contracts/full_match/10143/0xYourContractAddress/
- **Source Code**: Available directly on explorer

## 🎯 Final Checklist

- [ ] Images uploaded to IPFS via Pinata
- [ ] Metadata files updated with IPFS image URLs
- [ ] Metadata uploaded to IPFS via Pinata
- [ ] Contract deployed with IPFS base URI
- [ ] **Contract verified on Monad Explorer**
- [ ] All 22 artifacts accessible via IPFS
- [ ] Verification script confirms all URLs work
- [ ] Contract source code visible on explorer

## 🌟 Benefits of Complete IPFS + Verification Deployment

- **Decentralized**: No single point of failure
- **Immutable**: Content cannot be changed
- **Transparent**: Smart contract source code publicly verified
- **Trustworthy**: Users can verify contract behavior
- **Permanent**: Files persist as long as pinned
- **Fast**: Global CDN-like distribution
- **Cost-effective**: One-time upload cost

Your Crystal Cave NFT collection is now fully decentralized and verified! 🚀✨ 