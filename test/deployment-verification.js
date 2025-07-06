/**
 * Deployment Verification Script for Crystal Cave NFT
 * Verifies contract deployment on Monad Testnet
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Monad Testnet Configuration
const MONAD_CHAIN_ID = 10143;
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://testnet-rpc.monad.xyz';

// Contract ABI (minimal for testing)
const CONTRACT_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function totalSupply() view returns (uint256)',
    'function baseURI() view returns (string)',
    'function getArtifactName(uint256) view returns (string)',
    'function userOwnsArtifact(address, uint256) view returns (bool)',
    'function owner() view returns (address)',
    'function paused() view returns (bool)'
];

class DeploymentVerifier {
    constructor(contractAddress) {
        this.contractAddress = contractAddress;
        this.provider = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
        this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.provider);
    }
    
    async verifyNetwork() {
        console.log('🌐 Verifying network connection...');
        
        try {
            const network = await this.provider.getNetwork();
            console.log(`✅ Connected to network: ${network.name || 'Unknown'}`);
            console.log(`   Chain ID: ${network.chainId}`);
            
            if (network.chainId !== MONAD_CHAIN_ID) {
                throw new Error(`Expected Chain ID ${MONAD_CHAIN_ID}, got ${network.chainId}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Network verification failed:', error.message);
            return false;
        }
    }
    
    async verifyContractDeployment() {
        console.log('📋 Verifying contract deployment...');
        
        try {
            const code = await this.provider.getCode(this.contractAddress);
            
            if (code === '0x') {
                throw new Error('No contract found at address');
            }
            
            console.log('✅ Contract code found at address');
            console.log(`   Contract address: ${this.contractAddress}`);
            console.log(`   Code size: ${(code.length - 2) / 2} bytes`);
            
            return true;
        } catch (error) {
            console.error('❌ Contract deployment verification failed:', error.message);
            return false;
        }
    }
    
    async verifyContractInterface() {
        console.log('🔍 Verifying contract interface...');
        
        try {
            const name = await this.contract.name();
            const symbol = await this.contract.symbol();
            const totalSupply = await this.contract.totalSupply();
            const baseURI = await this.contract.baseURI();
            const owner = await this.contract.owner();
            const paused = await this.contract.paused();
            
            console.log('✅ Contract interface verified:');
            console.log(`   Name: ${name}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Total Supply: ${totalSupply}`);
            console.log(`   Base URI: ${baseURI}`);
            console.log(`   Owner: ${owner}`);
            console.log(`   Paused: ${paused}`);
            
            // Verify expected values
            if (name !== 'Crystal Cave Artifacts') {
                throw new Error(`Expected name 'Crystal Cave Artifacts', got '${name}'`);
            }
            
            if (symbol !== 'CCA') {
                throw new Error(`Expected symbol 'CCA', got '${symbol}'`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Contract interface verification failed:', error.message);
            return false;
        }
    }
    
    async verifyArtifactNames() {
        console.log('🗿 Verifying artifact names...');
        
        const expectedNames = [
            'Ancient Map', 'Sage\'s Blessing', 'Magical Compass', 'Water Crystal',
            'Fire Crystal', 'Star Map', 'Pattern Pearl', 'Fossil Fragment',
            'Harmony Stone', 'Ancient Scroll', 'Galaxy Map', 'Planetary Badge',
            'Marina\'s Journal', 'Dragon\'s Wisdom', 'Courage Gem', 'Meteor Fragment',
            'Time Crystal', 'Master Crystal', 'Chill Dak', 'Moyaki', 'Salmonad', 'Dead Chog'
        ];
        
        try {
            for (let i = 0; i < expectedNames.length; i++) {
                const actualName = await this.contract.getArtifactName(i);
                
                if (actualName !== expectedNames[i]) {
                    throw new Error(`Artifact ${i}: expected '${expectedNames[i]}', got '${actualName}'`);
                }
            }
            
            console.log('✅ All 22 artifact names verified correctly');
            console.log('   Monanimals confirmed: Chill Dak, Moyaki, Salmonad, Dead Chog');
            
            return true;
        } catch (error) {
            console.error('❌ Artifact names verification failed:', error.message);
            return false;
        }
    }
    
    async verifyGasEstimation() {
        console.log('⛽ Estimating gas costs...');
        
        try {
            // Get current gas price
            const gasPrice = await this.provider.getGasPrice();
            console.log(`   Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
            
            // Estimate mint transaction gas
            const mintGasEstimate = await this.contract.estimateGas.mintArtifact(0, {
                from: '0x0000000000000000000000000000000000000001' // dummy address
            }).catch(() => {
                console.log('   (Gas estimation for mint requires valid from address)');
                return ethers.BigNumber.from('150000'); // reasonable estimate
            });
            
            const mintCostWei = gasPrice.mul(mintGasEstimate);
            const mintCostEth = ethers.utils.formatEther(mintCostWei);
            
            console.log(`   Estimated mint gas: ${mintGasEstimate} units`);
            console.log(`   Estimated mint cost: ${mintCostEth} MON`);
            
            return true;
        } catch (error) {
            console.error('❌ Gas estimation failed:', error.message);
            return false;
        }
    }
    
    async verifyMetadataURIs() {
        console.log('🔗 Verifying metadata URI structure...');
        
        try {
            const baseURI = await this.contract.baseURI();
            
            if (!baseURI.endsWith('/')) {
                throw new Error('Base URI should end with "/"');
            }
            
            console.log('✅ Base URI format verified');
            console.log(`   Base URI: ${baseURI}`);
            console.log(`   Expected token URIs: ${baseURI}0.json, ${baseURI}1.json, etc.`);
            
            return true;
        } catch (error) {
            console.error('❌ Metadata URI verification failed:', error.message);
            return false;
        }
    }
    
    async runFullVerification() {
        console.log('🚀 Starting Crystal Cave NFT Deployment Verification\n');
        
        const results = {
            network: await this.verifyNetwork(),
            deployment: await this.verifyContractDeployment(),
            interface: await this.verifyContractInterface(),
            artifacts: await this.verifyArtifactNames(),
            gas: await this.verifyGasEstimation(),
            metadata: await this.verifyMetadataURIs()
        };
        
        console.log('\n📊 Verification Summary:');
        console.log('========================');
        
        let allPassed = true;
        for (const [test, passed] of Object.entries(results)) {
            console.log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)}: ${passed ? 'PASSED' : 'FAILED'}`);
            if (!passed) allPassed = false;
        }
        
        console.log('\n' + '='.repeat(50));
        if (allPassed) {
            console.log('🎉 ALL VERIFICATIONS PASSED! Crystal Cave NFT is ready! 🧙‍♂️✨');
            console.log('\nNext steps:');
            console.log('1. Update .env with contract address');
            console.log('2. Deploy frontend to production');
            console.log('3. Add Monanimal artwork to images/');
        } else {
            console.log('⚠️  Some verifications failed. Please review and fix issues.');
        }
        
        return allPassed;
    }
}

// Main execution function
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node deployment-verification.js <contract_address>');
        console.error('Example: node deployment-verification.js 0x1234567890123456789012345678901234567890');
        process.exit(1);
    }
    
    const contractAddress = args[0];
    
    if (!ethers.utils.isAddress(contractAddress)) {
        console.error('❌ Invalid contract address format');
        process.exit(1);
    }
    
    const verifier = new DeploymentVerifier(contractAddress);
    const success = await verifier.runFullVerification();
    
    process.exit(success ? 0 : 1);
}

// Export for testing
module.exports = { DeploymentVerifier };

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Verification script failed:', error.message);
        process.exit(1);
    });
} 