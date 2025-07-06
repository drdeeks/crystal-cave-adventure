#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function removeDuplicateTraits() {
    console.log('🧹 Cleaning up duplicate traits in metadata...\n');
    
    let totalCleaned = 0;
    
    for (let i = 0; i < 22; i++) {
        const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${i}.json`);
        
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            const originalCount = metadata.attributes.length;
            
            // Remove duplicates by creating a Map with trait_type+value as key
            const uniqueTraits = new Map();
            
            metadata.attributes.forEach(trait => {
                const key = `${trait.trait_type}:${trait.value}`;
                uniqueTraits.set(key, trait);
            });
            
            // Convert back to array
            metadata.attributes = Array.from(uniqueTraits.values());
            
            const newCount = metadata.attributes.length;
            const duplicatesRemoved = originalCount - newCount;
            
            if (duplicatesRemoved > 0) {
                // Update timestamp
                if (metadata.ipfs) {
                    metadata.ipfs.cleaned = new Date().toISOString();
                }
                
                fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
                console.log(`✅ ${i}.json (${metadata.name}): Removed ${duplicatesRemoved} duplicates`);
                totalCleaned += duplicatesRemoved;
            } else {
                console.log(`✓ ${i}.json (${metadata.name}): No duplicates found`);
            }
            
        } catch (error) {
            console.error(`❌ Error cleaning ${i}.json:`, error.message);
        }
    }
    
    console.log(`\n🎯 Cleanup Summary: Removed ${totalCleaned} duplicate traits total`);
}

// Run the cleanup
removeDuplicateTraits(); 