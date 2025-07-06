#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Enhanced trait definitions for each non-Monanimal artifact (0-17)
const ARTIFACT_ENHANCEMENTS = {
    0: { // Ancient Map
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Navigation Power", value: "Supreme" },
            { trait_type: "Age", value: "Ancient" },
            { trait_type: "Material", value: "Enchanted Parchment" },
            { trait_type: "Compass Integration", value: "True" }
        ]
    },
    1: { // Sage's Blessing
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Blessing Type", value: "Divine Wisdom" },
            { trait_type: "Spiritual Power", value: "High" },
            { trait_type: "Source", value: "Ancient Sage" },
            { trait_type: "Aura", value: "Golden" }
        ]
    },
    2: { // Magical Compass
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Magic Level", value: "Enchanted" },
            { trait_type: "Direction Accuracy", value: "Perfect" },
            { trait_type: "Material", value: "Mystical Metal" },
            { trait_type: "Needle Type", value: "Floating Crystal" }
        ]
    },
    3: { // Water Crystal
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Crystal Type", value: "Aquamarine" },
            { trait_type: "Purity Level", value: "Pure" },
            { trait_type: "Flow State", value: "Active" },
            { trait_type: "Healing Properties", value: "True" }
        ]
    },
    4: { // Fire Crystal
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Crystal Type", value: "Ruby Flame" },
            { trait_type: "Heat Level", value: "Intense" },
            { trait_type: "Flame State", value: "Eternal" },
            { trait_type: "Energy Output", value: "High" }
        ]
    },
    5: { // Star Map
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Constellation Count", value: "88" },
            { trait_type: "Accuracy", value: "Stellar" },
            { trait_type: "Material", value: "Star Dust Paper" },
            { trait_type: "Luminescence", value: "Self-Glowing" }
        ]
    },
    6: { // Pattern Pearl
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Pearl Size", value: "Large" },
            { trait_type: "Pattern Complexity", value: "Intricate" },
            { trait_type: "Ocean Depth", value: "Abyssal" },
            { trait_type: "Luster", value: "Iridescent" }
        ]
    },
    7: { // Fossil Fragment
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Age Period", value: "Prehistoric" },
            { trait_type: "Species", value: "Unknown Ancient" },
            { trait_type: "Preservation", value: "Perfect" },
            { trait_type: "Historical Value", value: "Priceless" }
        ]
    },
    8: { // Harmony Stone
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Balance Level", value: "Perfect" },
            { trait_type: "Resonance", value: "Harmonic" },
            { trait_type: "Meditation Aid", value: "True" },
            { trait_type: "Emotional State", value: "Calming" }
        ]
    },
    9: { // Ancient Scroll
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Language", value: "Runic" },
            { trait_type: "Knowledge Type", value: "Forbidden" },
            { trait_type: "Scroll Length", value: "Extended" },
            { trait_type: "Preservation Magic", value: "Active" }
        ]
    },
    10: { // Galaxy Map
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Galaxy Count", value: "Billions" },
            { trait_type: "Scale", value: "Universal" },
            { trait_type: "Dimension", value: "3D Holographic" },
            { trait_type: "Update Frequency", value: "Real-time" }
        ]
    },
    11: { // Planetary Badge
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Planet Origin", value: "Unknown System" },
            { trait_type: "Achievement Level", value: "Cosmic Explorer" },
            { trait_type: "Material", value: "Meteorite Alloy" },
            { trait_type: "Rank", value: "Master Navigator" }
        ]
    },
    12: { // Marina's Journal
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Author", value: "Marina the Explorer" },
            { trait_type: "Expeditions Recorded", value: "47" },
            { trait_type: "Ocean Coverage", value: "Global" },
            { trait_type: "Secret Locations", value: "Many" }
        ]
    },
    13: { // Dragon's Wisdom
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Dragon Age", value: "Millennial" },
            { trait_type: "Wisdom Level", value: "Ancient" },
            { trait_type: "Power Source", value: "Draconic" },
            { trait_type: "Knowledge Domain", value: "Universal" }
        ]
    },
    14: { // Courage Gem
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Bravery Boost", value: "Maximum" },
            { trait_type: "Fear Resistance", value: "Complete" },
            { trait_type: "Gem Cut", value: "Heart-shaped" },
            { trait_type: "Inner Light", value: "Brilliant" }
        ]
    },
    15: { // Meteor Fragment
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Origin", value: "Distant Galaxy" },
            { trait_type: "Composition", value: "Rare Minerals" },
            { trait_type: "Impact Energy", value: "Tremendous" },
            { trait_type: "Cosmic Radiation", value: "Beneficial" }
        ]
    },
    16: { // Time Crystal
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Temporal Power", value: "Chronokinetic" },
            { trait_type: "Time Flow", value: "Controllable" },
            { trait_type: "Paradox Protection", value: "Built-in" },
            { trait_type: "Era Access", value: "All" }
        ]
    },
    17: { // Master Crystal
        removeTraits: ['Monanimal Type'],
        addTraits: [
            { trait_type: "Mastery Level", value: "Ultimate" },
            { trait_type: "Power Amplification", value: "1000x" },
            { trait_type: "Crystal Network", value: "Central Hub" },
            { trait_type: "Enlightenment", value: "True" }
        ]
    }
};

function enhanceArtifactMetadata() {
    console.log('🔮 Enhancing Crystal Cave Artifact Metadata...\n');
    console.log('📋 Removing "Monanimal Type: N/A" and adding unique traits\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process artifacts 0-17 (non-Monanimals)
    for (let i = 0; i < 18; i++) {
        const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${i}.json`);
        
        try {
            // Read current metadata
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            const enhancement = ARTIFACT_ENHANCEMENTS[i];
            
            if (!enhancement) {
                console.log(`⚠️  No enhancement defined for artifact ${i}, skipping...`);
                continue;
            }
            
            console.log(`🔧 Enhancing ${i}.json - ${metadata.name}`);
            
            // Remove unwanted traits
            metadata.attributes = metadata.attributes.filter(attr => 
                !enhancement.removeTraits.includes(attr.trait_type)
            );
            
            // Add new unique traits
            enhancement.addTraits.forEach(newTrait => {
                metadata.attributes.push(newTrait);
            });
            
            // Update the IPFS tracking info
            if (metadata.ipfs) {
                metadata.ipfs.enhanced = new Date().toISOString();
                metadata.ipfs.version = "enhanced";
            }
            
            // Write updated metadata
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            
            console.log(`   ✅ Added ${enhancement.addTraits.length} unique traits`);
            console.log(`   🗑️  Removed ${enhancement.removeTraits.length} generic traits`);
            console.log(`   📊 Total traits: ${metadata.attributes.length}\n`);
            
            successCount++;
            
        } catch (error) {
            console.error(`❌ Error enhancing ${i}.json:`, error.message);
            errorCount++;
        }
    }
    
    console.log('📊 Enhancement Summary:');
    console.log('=======================');
    console.log(`✅ Successfully enhanced: ${successCount}/18 artifacts`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`🦆 Monanimals (18-21): Preserved unchanged`);
    
    if (successCount === 18) {
        console.log('\n🎉 All artifacts successfully enhanced!');
        console.log('\nNext steps:');
        console.log('1. Re-upload metadata folder to Pinata');
        console.log('2. Get new metadata IPFS hash');
        console.log('3. Update contract base URI');
        console.log('4. Run verification script');
    } else {
        console.log('\n⚠️  Some files failed to enhance. Please check errors above.');
    }
}

function validateEnhancements() {
    console.log('🔍 Validating enhanced metadata...\n');
    
    for (let i = 0; i < 18; i++) {
        const metadataPath = path.join(__dirname, '..', 'public', 'metadata', `${i}.json`);
        
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            
            // Check that Monanimal Type is removed
            const hasMonanimalType = metadata.attributes.some(attr => 
                attr.trait_type === 'Monanimal Type'
            );
            
            if (hasMonanimalType) {
                console.log(`❌ ${i}.json still has Monanimal Type trait`);
            } else {
                console.log(`✅ ${i}.json - Monanimal Type removed`);
            }
            
            // Check trait count
            console.log(`   📊 Total traits: ${metadata.attributes.length}`);
            
        } catch (error) {
            console.error(`❌ Error validating ${i}.json:`, error.message);
        }
    }
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--validate')) {
        validateEnhancements();
        return;
    }
    
    console.log('🌟 Crystal Cave NFT - Artifact Enhancement Tool');
    console.log('================================================\n');
    console.log('This will enhance artifacts 0-17 with unique traits');
    console.log('and remove the generic "Monanimal Type: N/A" trait.\n');
    console.log('Monanimals (18-21) will remain unchanged.\n');
    
    enhanceArtifactMetadata();
}

// Export for testing
module.exports = { enhanceArtifactMetadata, ARTIFACT_ENHANCEMENTS };

// Run if called directly
if (require.main === module) {
    main();
} 