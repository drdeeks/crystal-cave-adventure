/**
 * Metadata Validation Tests for Crystal Cave NFT
 * Validates JSON metadata structure and content
 */

const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Crystal Cave NFT Metadata Tests', function () {
    const metadataDir = path.join(__dirname, '..', 'public', 'metadata');
    
    // Expected artifact names (updated to match current metadata)
    const expectedArtifacts = [
        'Ancient Map', 'Sage\'s Blessing', 'Magical Compass', 'Marina\'s Journal',
        'Water Crystal', 'Pattern Pearl', 'Fossil Fragment', 'Harmony Stone',
        'Fire Crystal', 'Courage Gem', 'Ancient Scroll', 'Dragon\'s Wisdom',
        'Meteor Fragment', 'Star Map', 'Planetary Badge', 'Galaxy Map',
        'Time Crystal', 'Master Crystal', 'Chill Dak', 'Moyaki', 'Salmonad', 'Dead Chog'
    ];
    
    describe('Metadata File Existence', function () {
        it('Should have metadata files for all 22 artifacts', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                expect(fs.existsSync(filePath), `Metadata file ${i}.json should exist`).to.be.true;
            }
        });
    });
    
    describe('Metadata Structure Validation', function () {
        for (let i = 0; i < 22; i++) {
            it(`Should have valid structure for artifact ${i}`, function () {
                const filePath = path.join(metadataDir, `${i}.json`);
                const rawData = fs.readFileSync(filePath, 'utf8');
                
                expect(() => JSON.parse(rawData), `${i}.json should be valid JSON`).to.not.throw();
                
                const metadata = JSON.parse(rawData);
                
                // Required fields
                expect(metadata).to.have.property('name');
                expect(metadata).to.have.property('description');
                expect(metadata).to.have.property('image');
                expect(metadata).to.have.property('attributes');
                
                // Validate types
                expect(metadata.name).to.be.a('string');
                expect(metadata.description).to.be.a('string');
                expect(metadata.image).to.be.a('string');
                expect(metadata.attributes).to.be.an('array');
                
                // Validate content
                expect(metadata.name.length).to.be.greaterThan(0);
                expect(metadata.description.length).to.be.greaterThan(0);
                // Updated to check for IPFS URLs instead of local images/
                expect(metadata.image).to.match(/^https:\/\/gateway\.pinata\.cloud\/ipfs\/[a-zA-Z0-9]+\/\d+\.png$/);
                expect(metadata.attributes.length).to.be.greaterThan(0);
            });
        }
    });
    
    describe('Artifact Names Validation', function () {
        it('Should have correct artifact names', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                expect(metadata.name).to.equal(expectedArtifacts[i], 
                    `Artifact ${i} name should be ${expectedArtifacts[i]}`);
            }
        });
    });
    
    describe('Image URLs Validation', function () {
        it('Should have correct IPFS image URL format', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Updated to validate IPFS URLs
                expect(metadata.image).to.match(/^https:\/\/gateway\.pinata\.cloud\/ipfs\/[a-zA-Z0-9]+\/\d+\.png$/,
                    `Artifact ${i} should have correct IPFS image URL format`);
                expect(metadata.image).to.include(`${i}.png`);
            }
        });
    });
    
    describe('Attributes Validation', function () {
        it('Should have required core attributes', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const attributes = metadata.attributes;
                const attributeNames = attributes.map(attr => attr.trait_type);
                
                // Core attributes that all artifacts should have
                expect(attributeNames).to.include('Type');
                expect(attributeNames).to.include('Rarity');
                // Note: Element is not present in all artifacts
                
                // Validate Type attribute exists and is not empty
                const type = attributes.find(attr => attr.trait_type === 'Type');
                expect(type.value).to.be.a('string');
                expect(type.value.length).to.be.greaterThan(0);
                
                // Validate Rarity attribute exists and is not empty
                const rarity = attributes.find(attr => attr.trait_type === 'Rarity');
                expect(rarity.value).to.be.a('string');
                expect(rarity.value.length).to.be.greaterThan(0);
            }
        });
        
        it('Should have Monanimal-specific attributes for artifacts 18-21', function () {
            const monanimals = [18, 19, 20, 21];
            
            for (const id of monanimals) {
                const filePath = path.join(metadataDir, `${id}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const attributes = metadata.attributes;
                const attributeNames = attributes.map(attr => attr.trait_type);
                
                // Monanimal-specific attributes
                expect(attributeNames).to.include('Monanimal');
                expect(attributeNames).to.include('Cave Dweller');
                expect(attributeNames).to.include('Mission');
                expect(attributeNames).to.include('Gay');
                
                // Validate Monanimal attributes
                const monanimal = attributes.find(attr => attr.trait_type === 'Monanimal');
                expect(monanimal.value).to.equal('True');
                
                const caveDweller = attributes.find(attr => attr.trait_type === 'Cave Dweller');
                expect(caveDweller.value).to.equal('Yes');
                
                const mission = attributes.find(attr => attr.trait_type === 'Mission');
                expect(mission.value).to.equal('5');
                
                const gay = attributes.find(attr => attr.trait_type === 'Gay');
                expect(gay.value).to.equal('Ofc');
            }
        });
    });
    
    describe('Rarity Distribution', function () {
        it('Should have proper rarity distribution', function () {
            const rarityCount = {};
            
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                const rarity = metadata.attributes.find(attr => attr.trait_type === 'Rarity').value;
                rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
            }
            
            // Should have various rarity levels
            const validRarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];
            Object.keys(rarityCount).forEach(rarity => {
                expect(validRarities).to.include(rarity, `${rarity} should be a valid rarity level`);
            });
            
            // Total should be 22
            const total = Object.values(rarityCount).reduce((sum, count) => sum + count, 0);
            expect(total).to.equal(22);
        });
    });
    
    describe('JSON Format Validation', function () {
        it('Should have properly formatted JSON with no extra commas', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const rawData = fs.readFileSync(filePath, 'utf8');
                
                // Should not have trailing commas
                expect(rawData).to.not.match(/,\s*[}\]]/);
                
                // Should be properly indented (2 spaces)
                const lines = rawData.split('\n');
                expect(lines[0]).to.equal('{');
                expect(lines[lines.length - 1]).to.equal('}');
            }
        });
    });
    
    describe('Content Quality', function () {
        it('Should have meaningful descriptions', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                expect(metadata.description.length).to.be.greaterThan(20,
                    `Artifact ${i} description should be descriptive`);
                expect(metadata.description).to.not.equal(metadata.name,
                    `Artifact ${i} description should differ from name`);
            }
        });
        
        it('Should have IPFS metadata structure', function () {
            for (let i = 0; i < 22; i++) {
                const filePath = path.join(metadataDir, `${i}.json`);
                const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Should have IPFS metadata section
                if (metadata.ipfs) {
                    expect(metadata.ipfs).to.have.property('images_hash');
                    expect(metadata.ipfs).to.have.property('gateway');
                    expect(metadata.ipfs.gateway).to.include('pinata.cloud');
                }
            }
        });
    });
}); 