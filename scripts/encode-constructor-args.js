#!/usr/bin/env node

const { ethers } = require('ethers');

function encodeConstructorArgs() {
    console.log('🔧 Crystal Cave NFT - Constructor Arguments Encoder');
    console.log('='.repeat(60));
    
    // The constructor argument used during deployment
    const baseURI = "https://gateway.pinata.cloud/ipfs/bafybeiexaxdly7tuz6u4hnbp6raoxwdhx6t666ghibm2khi2wu5nwyv5ae/";
    
    console.log('📋 Constructor Argument:');
    console.log(`   baseTokenURI: "${baseURI}"`);
    
    try {
        // Encode the constructor arguments
        const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
            ['string'], // types
            [baseURI]   // values
        );
        
        // Remove the '0x' prefix for manual verification
        const encodedWithoutPrefix = encoded.slice(2);
        
        console.log('\n🔗 ABI-Encoded Constructor Arguments:');
        console.log('   (Copy this for manual verification)');
        console.log(`   ${encodedWithoutPrefix}`);
        
        console.log('\n📝 Manual Verification Information:');
        console.log('   Contract Address: 0x17a8086D5760E6a2Ee0026866Cf986c02ce4dbD6');
        console.log('   Contract Name: CrystalCaveNFT');
        console.log('   Compiler Version: 0.8.20');
        console.log('   Optimization: Enabled (200 runs)');
        console.log('   Chain: Monad Testnet (10143)');
        
        console.log('\n🌐 Verification URLs:');
        console.log('   Monad Explorer: https://testnet.monadexplorer.com/verify-contract');
        console.log('   Contract Page: https://testnet.monadexplorer.com/address/0x17a8086D5760E6a2Ee0026866Cf986c02ce4dbD6');
        
    } catch (error) {
        console.error('❌ Error encoding constructor arguments:', error.message);
    }
}

encodeConstructorArgs(); 