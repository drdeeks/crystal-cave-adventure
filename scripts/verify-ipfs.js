#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';
const TIMEOUT = 10000; // 10 seconds per request

class IPFSVerifier {
    constructor(metadataHash, imagesHash) {
        this.metadataHash = metadataHash;
        this.imagesHash = imagesHash;
        this.results = {
            metadata: [],
            images: [],
            errors: []
        };
    }
    
    async verifyMetadataFile(tokenId) {
        const metadataUrl = `${IPFS_GATEWAY}/${this.metadataHash}/${tokenId}.json`;
        
        try {
            console.log(`🔍 Verifying metadata ${tokenId}.json...`);
            
            const response = await axios.get(metadataUrl, { 
                timeout: TIMEOUT,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const metadata = response.data;
            
            // Validate metadata structure
            const requiredFields = ['name', 'description', 'image', 'attributes'];
            for (const field of requiredFields) {
                if (!metadata[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            
            // Validate image URL points to correct IPFS hash
            if (!metadata.image.includes(this.imagesHash)) {
                throw new Error(`Image URL does not point to expected IPFS hash`);
            }
            
            // Validate attributes structure
            if (!Array.isArray(metadata.attributes) || metadata.attributes.length === 0) {
                throw new Error('Attributes should be a non-empty array');
            }
            
            // Check for required attributes
            const attributeNames = metadata.attributes.map(attr => attr.trait_type);
            const requiredAttributes = ['Cave Dweller', 'Mission', 'Rarity'];
            
            for (const reqAttr of requiredAttributes) {
                if (!attributeNames.includes(reqAttr)) {
                    throw new Error(`Missing required attribute: ${reqAttr}`);
                }
            }
            
            console.log(`✅ ${tokenId}.json verified successfully`);
            console.log(`   Name: ${metadata.name}`);
            console.log(`   Image: ${metadata.image}`);
            console.log(`   Attributes: ${metadata.attributes.length}`);
            
            this.results.metadata.push({
                tokenId,
                status: 'success',
                url: metadataUrl,
                name: metadata.name,
                imageUrl: metadata.image,
                attributeCount: metadata.attributes.length
            });
            
            return true;
            
        } catch (error) {
            const errorMsg = `Failed to verify ${tokenId}.json: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            
            this.results.errors.push({
                type: 'metadata',
                tokenId,
                url: metadataUrl,
                error: error.message
            });
            
            return false;
        }
    }
    
    async verifyImageFile(tokenId) {
        const imageUrl = `${IPFS_GATEWAY}/${this.imagesHash}/${tokenId}.png`;
        
        try {
            console.log(`🖼️  Verifying image ${tokenId}.png...`);
            
            const response = await axios.head(imageUrl, { 
                timeout: TIMEOUT 
            });
            
            // Check if it's actually an image
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`Invalid content type: ${contentType}`);
            }
            
            const contentLength = response.headers['content-length'];
            if (!contentLength || parseInt(contentLength) === 0) {
                throw new Error('Image file appears to be empty');
            }
            
            console.log(`✅ ${tokenId}.png verified successfully`);
            console.log(`   Size: ${Math.round(parseInt(contentLength) / 1024)}KB`);
            console.log(`   Type: ${contentType}`);
            
            this.results.images.push({
                tokenId,
                status: 'success',
                url: imageUrl,
                size: parseInt(contentLength),
                contentType
            });
            
            return true;
            
        } catch (error) {
            const errorMsg = `Failed to verify ${tokenId}.png: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            
            this.results.errors.push({
                type: 'image',
                tokenId,
                url: imageUrl,
                error: error.message
            });
            
            return false;
        }
    }
    
    async verifyAll() {
        console.log('🌐 Crystal Cave NFT - IPFS Verification');
        console.log('========================================\n');
        console.log(`📁 Metadata Hash: ${this.metadataHash}`);
        console.log(`🖼️  Images Hash: ${this.imagesHash}`);
        console.log(`🌐 Gateway: ${IPFS_GATEWAY}\n`);
        
        console.log('Starting verification of all 22 artifacts...\n');
        
        // Verify all metadata files
        console.log('📋 Verifying Metadata Files:');
        console.log('============================');
        for (let i = 0; i < 22; i++) {
            await this.verifyMetadataFile(i);
            console.log(''); // Add spacing
        }
        
        // Verify all image files
        console.log('🖼️  Verifying Image Files:');
        console.log('==========================');
        for (let i = 0; i < 22; i++) {
            await this.verifyImageFile(i);
            console.log(''); // Add spacing
        }
        
        this.printSummary();
    }
    
    printSummary() {
        console.log('📊 Verification Summary:');
        console.log('========================');
        console.log(`✅ Metadata files verified: ${this.results.metadata.length}/22`);
        console.log(`✅ Image files verified: ${this.results.images.length}/22`);
        console.log(`❌ Total errors: ${this.results.errors.length}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors Details:');
            console.log('==================');
            this.results.errors.forEach(error => {
                console.log(`${error.type} ${error.tokenId}: ${error.error}`);
                console.log(`URL: ${error.url}`);
                console.log('');
            });
        }
        
        const totalSuccess = this.results.metadata.length + this.results.images.length;
        const totalExpected = 44; // 22 metadata + 22 images
        
        console.log('\n' + '='.repeat(50));
        if (totalSuccess === totalExpected && this.results.errors.length === 0) {
            console.log('🎉 ALL VERIFICATIONS PASSED!');
            console.log('Your Crystal Cave NFT collection is fully deployed on IPFS! 🚀✨');
            console.log('\nNext steps:');
            console.log('1. Update contract base URI if needed');
            console.log('2. Test minting with updated contract');
            console.log('3. Deploy frontend with IPFS URLs');
        } else {
            console.log('⚠️  Some verifications failed. Please review and fix issues.');
            console.log('Check network connectivity and IPFS hashes.');
        }
        
        // Save detailed results
        this.saveResults();
    }
    
    saveResults() {
        const resultsPath = path.join(__dirname, '..', 'ipfs-verification-results.json');
        const detailedResults = {
            timestamp: new Date().toISOString(),
            metadataHash: this.metadataHash,
            imagesHash: this.imagesHash,
            gateway: IPFS_GATEWAY,
            results: this.results,
            summary: {
                metadataSuccess: this.results.metadata.length,
                imagesSuccess: this.results.images.length,
                totalErrors: this.results.errors.length,
                successRate: `${Math.round(((this.results.metadata.length + this.results.images.length) / 44) * 100)}%`
            }
        };
        
        fs.writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));
        console.log(`📄 Detailed results saved to: ${resultsPath}`);
    }
}

// Expected artifact names for validation
const EXPECTED_ARTIFACTS = [
    'Ancient Map', 'Sage\'s Blessing', 'Magical Compass', 'Water Crystal',
    'Fire Crystal', 'Star Map', 'Pattern Pearl', 'Fossil Fragment',
    'Harmony Stone', 'Ancient Scroll', 'Galaxy Map', 'Planetary Badge',
    'Marina\'s Journal', 'Dragon\'s Wisdom', 'Courage Gem', 'Meteor Fragment',
    'Time Crystal', 'Master Crystal', 'Chill Dak', 'Moyaki', 'Salmonad', 'Dead Chog'
];

async function quickVerification(metadataHash) {
    console.log('⚡ Quick Verification (first 3 artifacts)...\n');
    
    for (let i = 0; i < 3; i++) {
        try {
            const url = `${IPFS_GATEWAY}/${metadataHash}/${i}.json`;
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`✅ ${i}.json: ${response.data.name}`);
        } catch (error) {
            console.log(`❌ ${i}.json: ${error.message}`);
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Usage: node verify-ipfs.js <METADATA_HASH> <IMAGES_HASH> [--quick]');
        console.error('\nExample:');
        console.error('  node verify-ipfs.js QmMetadataHash QmImagesHash');
        console.error('  node verify-ipfs.js QmMetadataHash QmImagesHash --quick');
        console.error('\nTo get your hashes:');
        console.error('1. Check your Pinata dashboard');
        console.error('2. Find the uploaded folders');
        console.error('3. Copy the IPFS hashes');
        process.exit(1);
    }
    
    const metadataHash = args[0].trim();
    const imagesHash = args[1].trim();
    const quickMode = args.includes('--quick');
    
    if (quickMode) {
        await quickVerification(metadataHash);
        return;
    }
    
    const verifier = new IPFSVerifier(metadataHash, imagesHash);
    await verifier.verifyAll();
}

// Export for testing
module.exports = { IPFSVerifier };

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    });
} 