# 🔍 Crystal Cave NFT - Contract Verification Guide

Complete guide for verifying your smart contract on Monad Testnet with multiple methods and platform-specific instructions.

## 📋 Prerequisites

### Environment Setup
1. **Deployed Contract**: Contract must be successfully deployed to Monad Testnet
2. **Environment Variables**: `.env` file configured with:
   ```
   ETH_RPC_URL=https://testnet-rpc.monad.xyz
   PRIVATE_KEY=your_private_key_here
   ```
3. **Foundry Installation**: Required for verification commands

### Platform-Specific Setup

#### Windows (Recommended: Use WSL)
```powershell
# Install WSL2 (if not already installed)
wsl --install

# Open WSL terminal
wsl

# In WSL, install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Navigate to project
cd /mnt/c/path/to/Crystal\ Cave
```

#### Linux/MacOS
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

## 🚀 Verification Methods

### Method 1: Automated Script (Recommended)

Our verification script attempts multiple methods automatically:

```bash
# Basic usage
node scripts/verify-contract.js 0xYourContractAddress

# Example with real address
node scripts/verify-contract.js 0x1234567890123456789012345678901234567890
```

**Script Features:**
- ✅ Validates contract address format
- ✅ Attempts 4 different verification methods
- ✅ Provides detailed error messages
- ✅ Shows verification status URLs
- ✅ Comprehensive troubleshooting guide

### Method 2: Direct Foundry Commands

#### Official Monad Sourcify (Primary)
```bash
forge verify-contract \
    0xYourContractAddress \
    src/CrystalCaveNFT.sol:CrystalCaveNFT \
    --chain 10143 \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

#### With --verify Flag
```bash
forge verify-contract \
    0xYourContractAddress \
    src/contracts/CrystalCaveNFT.sol:CrystalCaveNFT \
    --chain 10143 \
    --verify \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

#### Default Sourcify (Fallback)
```bash
forge verify-contract \
    0xYourContractAddress \
    src/contracts/CrystalCaveNFT.sol:CrystalCaveNFT \
    --chain 10143 \
    --verifier sourcify
```

### Method 3: Deploy + Verify Simultaneously

#### Using Foundry Create
```bash
forge create src/contracts/CrystalCaveNFT.sol:CrystalCaveNFT \
    --rpc-url $ETH_RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args "https://crystal-cave-nft.netlify.app/metadata/" \
    --verify \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

#### Using Deployment Script
```bash
forge script script/Deploy.s.sol \
    --rpc-url $ETH_RPC_URL \
    --broadcast \
    --verify \
    --verifier sourcify \
    --verifier-url https://sourcify-api-monad.blockvision.org
```

### Method 4: Manual Web Interface

#### Monad Explorer
1. Visit: https://testnet.monadexplorer.com/verify-contract
2. Fill in contract details:
   - **Contract Address**: `0xYourContractAddress`
   - **Compiler Type**: `Solidity (Single file)`
   - **Compiler Version**: `v0.8.20+commit.a1b79de6`
   - **Open Source License Type**: `MIT`

3. **Optimization Settings**:
   - Optimization: `Yes`
   - Runs: `200`

4. **Contract Source Code**: Copy entire content of `src/contracts/CrystalCaveNFT.sol`

5. **Constructor Arguments**: If your contract has constructor args, encode them:
   ```bash
   # Example for base URI
   cast abi-encode "constructor(string)" "https://crystal-cave-nft.netlify.app/metadata/"
   ```

#### Sourcify Direct
1. Visit: https://sourcify.dev/#/verifier
2. **Upload Method**: Choose "Files"
3. **Upload Files**:
   - Upload `src/contracts/CrystalCaveNFT.sol`
   - Upload any imported files (if not using OpenZeppelin URLs)
4. **Contract Details**:
   - Chain ID: `10143`
   - Contract Address: `0xYourContractAddress`
5. Click "Verify"

## 🔍 Verification Status Check

### Check if Already Verified
```bash
forge verify-check \
    0xYourContractAddress \
    --chain-id 10143 \
    --verifier sourcify
```

### Explorer Links
After successful verification, access your contract at:

- **Main Contract Page**: 
  ```
  https://testnet.monadexplorer.com/address/0xYourContractAddress
  ```

- **Verification Status**:
  ```
  https://testnet.monadexplorer.com/contracts/full_match/10143/0xYourContractAddress/
  ```

- **Source Code Tab**: Available on the main contract page

## ⚙️ Configuration Verification

### Check foundry.toml
Ensure your `foundry.toml` matches:

```toml
[profile.default]
src = "src/contracts"
out = "out"
libs = ["lib"]
metadata = true
metadata_hash = "none"  # disable ipfs
use_literal_content = true # use source code

# Monad Testnet Configuration
eth-rpc-url = "https://testnet-rpc.monad.xyz"
chain_id = 10143

# Compiler settings
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

# Contract size limits (Monad allows larger contracts)
bytecode_hash = "none"
cbor_metadata = false

# Verification settings
[profile.default.etherscan]
monad-testnet = { key = "no-key-required", url = "https://testnet.monadexplorer.com/api" }
```

### Test Contract Compilation
```bash
# Should compile successfully
forge build

# Check for compilation errors
forge compile --force
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. "Contract not found" Error
```bash
# Check if contract is actually deployed
cast code 0xYourContractAddress --rpc-url $ETH_RPC_URL

# Should return bytecode, not "0x"
```

#### 2. "Already verified" Message
```bash
# Check verification status
forge verify-check 0xYourContractAddress --chain-id 10143 --verifier sourcify

# View on explorer
open https://testnet.monadexplorer.com/address/0xYourContractAddress
```

#### 3. "Verification failed" Error
- Wait 2-3 minutes after deployment
- Ensure contract is fully deployed and confirmed
- Check that foundry.toml configuration is correct
- Try different verification methods in order

#### 4. "Invalid constructor arguments" Error
```bash
# Get constructor args from deployment transaction
cast receipt 0xYourDeploymentTxHash --rpc-url $ETH_RPC_URL

# Decode constructor arguments if needed
cast abi-decode "constructor(string)" 0xYourEncodedArgs
```

#### 5. Foundry Not Found (Windows)
```powershell
# Use WSL instead
wsl

# Or install using alternative method
# See: https://book.getfoundry.sh/getting-started/installation
```

### Debug Commands

#### Check Network Connection
```bash
# Test RPC connection
cast chain-id --rpc-url $ETH_RPC_URL

# Should return: 10143
```

#### Verify Environment Variables
```bash
# Check .env configuration
cat .env | grep -E "(ETH_RPC_URL|PRIVATE_KEY)"

# Test private key (be careful!)
cast wallet address --private-key $PRIVATE_KEY
```

#### Check Contract State
```bash
# Get contract info
cast call 0xYourContractAddress "name()" --rpc-url $ETH_RPC_URL
cast call 0xYourContractAddress "owner()" --rpc-url $ETH_RPC_URL
```

## 📊 Verification Success Indicators

### ✅ Successful Verification Shows:

1. **Explorer Integration**:
   - "Contract" tab appears on explorer
   - Source code is readable
   - "Write Contract" and "Read Contract" functions available

2. **Sourcify Integration**:
   - Full match status on Sourcify
   - Contract metadata available
   - Source files downloadable

3. **Developer Tools**:
   - Function signatures visible
   - ABI automatically available
   - Proxy detection (if applicable)

### 🔍 Verification Levels

- **Perfect Match**: Exact bytecode match with provided source
- **Partial Match**: Source compiles to similar bytecode
- **Not Verified**: No matching source found

## 🎯 Quick Reference

### Essential Commands
```bash
# 1. Verify existing contract
node scripts/verify-contract.js 0xYourAddress

# 2. Check verification status  
forge verify-check 0xYourAddress --chain-id 10143

# 3. Manual verification
forge verify-contract 0xYourAddress src/contracts/CrystalCaveNFT.sol:CrystalCaveNFT --chain 10143 --verifier sourcify

# 4. Deploy + verify
forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast --verify
```

### Key Information
- **Chain ID**: 10143 (Monad Testnet)
- **Explorer**: https://testnet.monadexplorer.com
- **Sourcify URL**: https://sourcify-api-monad.blockvision.org
- **Compiler**: Solidity 0.8.20
- **Optimization**: 200 runs

---

**Need Help?** 
- Check our [README.md](README.md) for general setup
- See [IPFS_DEPLOYMENT_GUIDE.md](IPFS_DEPLOYMENT_GUIDE.md) for metadata hosting
- Review contract source in `src/contracts/CrystalCaveNFT.sol`

Your contract verification on Monad Testnet should now be successful! 🚀✨ 