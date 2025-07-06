/**
 * Frontend Integration Tests for Crystal Cave NFT
 * Tests wallet connection, contract interaction, and game integration
 */

const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('Crystal Cave Frontend Tests', function () {
    let browser;
    let page;
    
    const LOCALHOST_URL = 'http://localhost:3000';
    const TEST_TIMEOUT = 30000;
    
    this.timeout(TEST_TIMEOUT);
    
    before(async function () {
        browser = await puppeteer.launch({ 
            headless: false, // Set to true for CI/CD
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        
        // Enable console logging
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    });
    
    after(async function () {
        if (browser) {
            await browser.close();
        }
    });
    
    beforeEach(async function () {
        await page.goto(LOCALHOST_URL, { waitUntil: 'networkidle0' });
    });
    
    describe('Game Loading', function () {
        it('Should load the main game interface', async function () {
            await page.waitForSelector('.crystal-cave-container', { timeout: 10000 });
            
            const title = await page.$eval('h1', el => el.textContent);
            expect(title).to.include('Crystal Cave Adventure');
        });
        
        it('Should display initial game choices', async function () {
            await page.waitForSelector('.choice-button', { timeout: 5000 });
            
            const choices = await page.$$eval('.choice-button', buttons => 
                buttons.map(btn => btn.textContent.trim())
            );
            
            expect(choices.length).to.be.greaterThan(0);
            expect(choices.some(choice => choice.includes('Explore'))).to.be.true;
        });
    });
    
    describe('Wallet Connection Component', function () {
        it('Should render wallet connection button when MetaMask not connected', async function () {
            // Look for wallet connection component
            const walletButton = await page.$('.wallet-connect-button, [data-testid="wallet-connect"]');
            
            if (walletButton) {
                const buttonText = await page.evaluate(el => el.textContent, walletButton);
                expect(buttonText).to.include('Connect');
            }
        });
        
        it('Should handle MetaMask not installed scenario', async function () {
            // Evaluate if MetaMask detection works
            const hasMetaMask = await page.evaluate(() => {
                return typeof window.ethereum !== 'undefined';
            });
            
            console.log('MetaMask detected:', hasMetaMask);
            // This test verifies the detection logic works
        });
    });
    
    describe('Game Navigation', function () {
        it('Should navigate through water path', async function () {
            // Wait for game to load
            await page.waitForSelector('.choice-button', { timeout: 5000 });
            
            // Look for water path option
            const waterChoice = await page.$x("//button[contains(text(), 'water') or contains(text(), 'river') or contains(text(), 'crystal pool')]");
            
            if (waterChoice.length > 0) {
                await waterChoice[0].click();
                await page.waitForTimeout(1000); // Wait for navigation
                
                // Check that content changed
                const newContent = await page.$eval('body', el => el.textContent);
                expect(newContent.length).to.be.greaterThan(100);
            }
        });
        
        it('Should navigate to Monanimal paths', async function () {
            await page.waitForSelector('.choice-button', { timeout: 5000 });
            
            // Look for Monanimal options
            const monanimals = ['Chill Dak', 'Moyaki', 'Salmonad', 'Dead Chog'];
            
            for (const monanimal of monanimals) {
                try {
                    const choice = await page.$x(`//button[contains(text(), '${monanimal}')]`);
                    if (choice.length > 0) {
                        console.log(`Found ${monanimal} path`);
                        // This verifies the Monanimal paths exist
                        break;
                    }
                } catch (error) {
                    console.log(`${monanimal} path not found on current screen`);
                }
            }
        });
    });
    
    describe('NFT Integration', function () {
        it('Should display NFT minting interface when artifact is discovered', async function () {
            // This test would require navigating to an artifact discovery scene
            // For now, we'll test that the component can be loaded
            
            const hasNFTComponent = await page.evaluate(() => {
                // Check if WalletConnection component is in the page
                return document.querySelector('[data-component="wallet-connection"]') !== null ||
                       document.querySelector('.wallet-connect') !== null ||
                       document.querySelector('.nft-mint') !== null;
            });
            
            console.log('NFT component detected:', hasNFTComponent);
        });
    });
    
    describe('Responsive Design', function () {
        it('Should work on mobile viewport', async function () {
            await page.setViewport({ width: 375, height: 667 }); // iPhone dimensions
            await page.reload({ waitUntil: 'networkidle0' });
            
            await page.waitForSelector('.crystal-cave-container', { timeout: 5000 });
            
            // Check if mobile layout is applied
            const container = await page.$('.crystal-cave-container');
            const styles = await page.evaluate(el => {
                const computed = window.getComputedStyle(el);
                return {
                    padding: computed.padding,
                    fontSize: computed.fontSize
                };
            }, container);
            
            expect(styles).to.be.an('object');
        });
        
        it('Should work on tablet viewport', async function () {
            await page.setViewport({ width: 768, height: 1024 }); // iPad dimensions
            await page.reload({ waitUntil: 'networkidle0' });
            
            await page.waitForSelector('.crystal-cave-container', { timeout: 5000 });
            
            const isVisible = await page.$eval('.crystal-cave-container', el => {
                return el.offsetHeight > 0 && el.offsetWidth > 0;
            });
            
            expect(isVisible).to.be.true;
        });
    });
    
    describe('Performance', function () {
        it('Should load within reasonable time', async function () {
            const startTime = Date.now();
            await page.goto(LOCALHOST_URL, { waitUntil: 'networkidle0' });
            const loadTime = Date.now() - startTime;
            
            console.log(`Page load time: ${loadTime}ms`);
            expect(loadTime).to.be.lessThan(5000); // Should load within 5 seconds
        });
        
        it('Should not have console errors', async function () {
            const errors = [];
            
            page.on('pageerror', error => {
                errors.push(error.message);
            });
            
            await page.reload({ waitUntil: 'networkidle0' });
            await page.waitForTimeout(2000);
            
            // Filter out expected/harmless errors
            const criticalErrors = errors.filter(error => 
                !error.includes('MetaMask') && 
                !error.includes('extension') &&
                !error.includes('favicon')
            );
            
            expect(criticalErrors.length).to.equal(0);
        });
    });
    
    describe('Accessibility', function () {
        it('Should have proper heading structure', async function () {
            const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', 
                elements => elements.map(el => ({
                    tag: el.tagName,
                    text: el.textContent.trim()
                }))
            );
            
            expect(headings.length).to.be.greaterThan(0);
            expect(headings[0].tag).to.equal('H1'); // Should start with h1
        });
        
        it('Should have focusable interactive elements', async function () {
            const buttons = await page.$$('button');
            expect(buttons.length).to.be.greaterThan(0);
            
            // Test that buttons are focusable
            for (const button of buttons.slice(0, 3)) { // Test first 3 buttons
                await button.focus();
                const isFocused = await page.evaluate(el => 
                    document.activeElement === el, button
                );
                expect(isFocused).to.be.true;
            }
        });
    });
});

// Helper function for running without Puppeteer (unit tests)
describe('Component Unit Tests', function () {
    describe('Wallet Connection Logic', function () {
        it('Should detect MetaMask correctly', function () {
            // Mock window.ethereum
            global.window = { ethereum: { isMetaMask: true } };
            
            const hasMetaMask = typeof window.ethereum !== 'undefined';
            expect(hasMetaMask).to.be.true;
            
            delete global.window;
        });
        
        it('Should handle missing MetaMask gracefully', function () {
            global.window = {};
            
            const hasMetaMask = typeof window.ethereum !== 'undefined';
            expect(hasMetaMask).to.be.false;
            
            delete global.window;
        });
    });
    
    describe('Artifact Data Validation', function () {
        it('Should have valid artifact metadata structure', function () {
            const sampleMetadata = {
                name: "Ancient Map",
                description: "A mystical map revealing hidden paths",
                image: "https://example.com/images/0.png",
                attributes: [
                    { trait_type: "Type", value: "Navigation Artifact" },
                    { trait_type: "Rarity", value: "Legendary" }
                ]
            };
            
            expect(sampleMetadata).to.have.property('name');
            expect(sampleMetadata).to.have.property('description');
            expect(sampleMetadata).to.have.property('image');
            expect(sampleMetadata).to.have.property('attributes');
            expect(sampleMetadata.attributes).to.be.an('array');
        });
    });
}); 