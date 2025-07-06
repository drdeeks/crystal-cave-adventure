#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

function updateMetadataWithIPFS(imagesHash) {
    console.log('🔄 Updating Crystal Cave NFT metadata files with IPFS URLs...\n');
    console.log(`📁 Images IPFS Hash: ${imagesHash}`);
    console.log(`🌐 Gateway: ${IPFS_GATEWAY}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < 22; i++) {
        const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${i}.json`);
        
        try {
            // Check if file exists
            if (!fs.existsSync(metadataPath)) {
                throw new Error(`Metadata file ${i}.json does not exist`);
            }
            
            // Read current metadata
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            // Store original image URL for comparison
            const originalImage = metadata.image;
            
            // Update image URL to IPFS
            const newImageURL = `${IPFS_GATEWAY}/${imagesHash}/${i}.png`;
            metadata.image = newImageURL;
            
            // Add IPFS metadata for tracking
            metadata.ipfs = {
                images_hash: imagesHash,
                updated: new Date().toISOString(),
                gateway: IPFS_GATEWAY
            };
            
            // Write updated metadata with proper formatting
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            
            console.log(`✅ Updated ${i}.json`);
            console.log(`   Name: ${metadata.name}`);
            console.log(`   Old: ${originalImage}`);
            console.log(`   New: ${newImageURL}\n`);
            
            successCount++;
            
        } catch (error) {
            console.error(`❌ Error updating ${i}.json:`, error.message);
            errorCount++;
        }
    }
    
    console.log('📊 Update Summary:');
    console.log('==================');
    console.log(`✅ Successfully updated: ${successCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📁 Total artifacts: 22`);
    
    if (successCount === 22) {
        console.log('\n🎉 All metadata files successfully updated with IPFS URLs!');
        console.log('\nNext steps:');
        console.log('1. Upload metadata folder to Pinata');
        console.log('2. Get metadata IPFS hash');
        console.log('3. Update contract base URI');
        console.log('4. Run verification: npm run verify-deployment');
    } else {
        console.log('\n⚠️  Some files failed to update. Please check errors above.');
    }
}

function validateIPFSHash(hash) {
    // Basic IPFS hash validation
    if (!hash) {
        return false;
    }
    
    // Check for common IPFS hash patterns
    if (hash.startsWith('Qm') && hash.length === 46) {
        return true; // CIDv0
    }
    
    if (hash.startsWith('bafy') && hash.length === 59) {
        return true; // CIDv1
    }
    
    if (hash.startsWith('bafk') && hash.length === 59) {
        return true; // CIDv1 (different format)
    }
    
    return false;
}

// Main execution
function main() {
    console.log('🌐 Crystal Cave NFT - IPFS Metadata Updater');
    console.log('============================================\n');
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('❌ Usage: node update-metadata-ipfs.js <IMAGES_IPFS_HASH>');
        console.error('\nExample:');
        console.error('  node update-metadata-ipfs.js QmYourImagesHashHere');
        console.error('  node update-metadata-ipfs.js bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi');
        console.error('\nTo get your images hash:');
        console.error('1. Upload images folder to Pinata');
        console.error('2. Copy the IPFS hash from Pinata dashboard');
        console.error('3. Run this script with that hash');
        process.exit(1);
    }
    
    const imagesHash = args[0].trim();
    
    // Validate IPFS hash format
    if (!validateIPFSHash(imagesHash)) {
        console.error('❌ Invalid IPFS hash format!');
        console.error('\nValid formats:');
        console.error('- CIDv0: Qm... (46 characters)');
        console.error('- CIDv1: bafy... or bafk... (59 characters)');
        console.error(`\nProvided: ${imagesHash} (${imagesHash.length} characters)`);
        process.exit(1);
    }
    
    console.log('✅ IPFS hash format validated');
    
    // Check if metadata directory exists
    const metadataDir = path.join(__dirname, '..', 'public', 'metadata');
    if (!fs.existsSync(metadataDir)) {
        console.error('❌ Metadata directory not found:', metadataDir);
        console.error('Please ensure you are running this from the project root.');
        process.exit(1);
    }
    
    // Check if all 22 metadata files exist
    let missingFiles = [];
    for (let i = 0; i < 22; i++) {
        const filePath = path.join(metadataDir, `${i}.json`);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(`${i}.json`);
        }
    }
    
    if (missingFiles.length > 0) {
        console.error('❌ Missing metadata files:', missingFiles.join(', '));
        console.error('Please ensure all metadata files (0.json to 21.json) exist.');
        process.exit(1);
    }
    
    console.log('✅ All metadata files found\n');
    
    // Confirm before proceeding
    console.log('⚠️  This will update ALL metadata files with IPFS URLs.');
    console.log('Make sure you have a backup of your metadata files!\n');
    
    // For non-interactive environments, we'll proceed automatically
    // In interactive environments, you might want to add a confirmation prompt
    
    updateMetadataWithIPFS(imagesHash);
}

// Export for testing
module.exports = { updateMetadataWithIPFS, validateIPFSHash };

// Run if called directly
if (require.main === module) {
    main();
} 