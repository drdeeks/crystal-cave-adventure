#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Load environment variables
require('dotenv').config();

function executeCommand(command, description) {
    try {
        console.log(`\n🚀 ${description}...`);
        console.log(`Command: ${command}`);
        console.log('\nThis may take a few minutes...\n');
        
        const output = execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(output);
        return true;
    } catch (error) {
        console.log(`\n❌ ${description} failed.`);
        console.log('Error:', error.message);
        if (error.stdout) {
            console.log('Stdout:', error.stdout);
        }
        if (error.stderr) {
            console.log('Stderr:', error.stderr);
        }
        return false;
    }
}

function validateContractAddress(address) {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        console.log('❌ Invalid contract address format.');
        console.log('Expected format: 0x1234567890123456789012345678901234567890');
        return false;
    }
    return true;
}

function main() {
    console.log('🔍 Crystal Cave NFT - Contract Verification Tool');
    console.log('='.repeat(60));
    
    // Check if contract address is provided
    const contractAddress = process.argv[2];
    if (!contractAddress) {
        console.log('❌ Please provide the contract address as an argument.');
        console.log('Usage: node scripts/verify-contract.js <contract_address>');
        console.log('\nExample:');
        console.log('node scripts/verify-contract.js 0x1234567890123456789012345678901234567890');
        process.exit(1);
    }
    
    // Validate contract address format
    if (!validateContractAddress(contractAddress)) {
        process.exit(1);
    }
    
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: Monad Testnet (Chain ID: 10143)`);
    console.log(`🔗 Explorer: https://testnet.monadexplorer.com/address/${contractAddress}`);
    console.log(`📄 Contract Path: src/CrystalCaveNFT.sol:CrystalCaveNFT`);
    
    const contractPath = 'src/CrystalCaveNFT.sol:CrystalCaveNFT';
    
    // Method 1: Official Monad Sourcify verification with API endpoint (Recommended)
    console.log('\n📍 Method 1: Official Monad Sourcify verification with API endpoint (Recommended)...');
    const monadSourceifyCommand = [
        'forge verify-contract',
        contractAddress,
        contractPath,
        '--chain 10143',
        '--verifier sourcify',
        '--verifier-url https://sourcify-api-monad.blockvision.org/api'
    ].join(' ');
    
    if (executeCommand(monadSourceifyCommand, 'Official Monad Sourcify verification with API endpoint')) {
        console.log('\n✅ Contract verification completed successfully with Monad Sourcify API!');
        console.log(`🔗 View your verified contract: https://testnet.monadexplorer.com/address/${contractAddress}`);
        console.log(`📊 Check verification status: https://testnet.monadexplorer.com/contracts/full_match/10143/${contractAddress}/`);
        return;
    }
    
    // Method 2: Official Monad Sourcify verification without API endpoint
    console.log('\n📍 Method 2: Official Monad Sourcify verification (fallback)...');
    const monadSourceifyFallbackCommand = [
        'forge verify-contract',
        contractAddress,
        contractPath,
        '--chain 10143',
        '--verifier sourcify',
        '--verifier-url https://sourcify-api-monad.blockvision.org'
    ].join(' ');
    
    if (executeCommand(monadSourceifyFallbackCommand, 'Official Monad Sourcify verification')) {
        console.log('\n✅ Contract verification completed successfully with Monad Sourcify!');
        console.log(`🔗 View your verified contract: https://testnet.monadexplorer.com/address/${contractAddress}`);
        console.log(`📊 Check verification status: https://testnet.monadexplorer.com/contracts/full_match/10143/${contractAddress}/`);
        return;
    }
    
    // Method 3: Standard Foundry verification with --verify flag
    console.log('\n📍 Method 3: Standard Foundry verification with --verify flag...');
    const verifyFlagCommand = [
        'forge verify-contract',
        contractAddress,
        contractPath,
        '--chain 10143',
        '--verify',
        '--verifier sourcify',
        '--verifier-url https://sourcify-api-monad.blockvision.org/api'
    ].join(' ');
    
    if (executeCommand(verifyFlagCommand, 'Standard Foundry verification with --verify')) {
        console.log('\n✅ Contract verification completed successfully with --verify flag!');
        console.log(`🔗 View your verified contract: https://testnet.monadexplorer.com/address/${contractAddress}`);
        return;
    }
    
    // Method 4: Default Sourcify (fallback)
    console.log('\n📍 Method 4: Default Sourcify verification (fallback)...');
    const defaultSourceifyCommand = [
        'forge verify-contract',
        contractAddress,
        contractPath,
        '--chain 10143',
        '--verifier sourcify'
    ].join(' ');
    
    if (executeCommand(defaultSourceifyCommand, 'Default Sourcify verification')) {
        console.log('\n✅ Contract verification completed successfully with default Sourcify!');
        console.log(`🔗 View your verified contract: https://testnet.monadexplorer.com/address/${contractAddress}`);
        return;
    }
    
    // Method 5: Check if already verified
    console.log('\n📍 Method 5: Checking if contract is already verified...');
    const checkCommand = [
        'forge verify-check',
        contractAddress,
        '--chain-id 10143',
        '--verifier sourcify'
    ].join(' ');
    
    if (executeCommand(checkCommand, 'Checking verification status')) {
        console.log('\n✅ Contract verification status checked!');
        console.log(`🔗 View your contract: https://testnet.monadexplorer.com/address/${contractAddress}`);
        return;
    }
    
    // All methods failed
    console.log('\n❌ All verification methods failed.');
    console.log('\n🔧 Troubleshooting Guide:');
    console.log('━'.repeat(50));
    console.log('1. 📋 Verify contract address is correct and deployed');
    console.log('2. ⏱️  Wait 2-3 minutes after deployment before verifying');
    console.log('3. 🔍 Check if already verified on the explorer');
    console.log('4. 🌐 Monad testnet verification services might be experiencing issues');
    console.log('5. 📁 Ensure foundry.toml configuration is correct');
    console.log('6. 🔧 Try manual verification through web interface');
    
    console.log('\n🌐 Manual Verification Options:');
    console.log('━'.repeat(50));
    console.log('• Monad Explorer: https://testnet.monadexplorer.com/verify-contract');
    console.log('• Sourcify Direct: https://sourcify.dev/#/verifier');
    console.log('• Upload contract source code manually');
    
    console.log('\n📋 Required Information for Manual Verification:');
    console.log('━'.repeat(50));
    console.log(`• Contract Address: ${contractAddress}`);
    console.log('• Compiler Version: 0.8.20');
    console.log('• Optimization: true (200 runs)');
    console.log('• Contract Path: src/CrystalCaveNFT.sol');
    console.log('• Contract Name: CrystalCaveNFT');
    
    console.log('\n🔍 Debug Information:');
    console.log('━'.repeat(50));
    console.log('• Check foundry.toml configuration');
    console.log('• Verify all dependencies are installed');
    console.log('• Ensure contract is compiled successfully');
    console.log('• Check network connectivity');
    
    process.exit(1);
}

main(); 