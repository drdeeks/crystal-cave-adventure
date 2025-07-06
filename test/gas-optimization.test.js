const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Gas Optimization Tests', function () {
    let nftContract;
    let user1;
    
    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();
        const CrystalCaveNFT = await ethers.getContractFactory('CrystalCaveNFT');
        nftContract = await CrystalCaveNFT.deploy("https://test.com/");
    });
    
    it('Should mint within Monad gas targets', async function () {
        const tx = await nftContract.connect(user1).mintArtifact(0, {
            gasLimit: 180000,
            maxFeePerGas: ethers.parseUnits('100', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('50', 'gwei')
        });
        
        const receipt = await tx.wait();
        console.log(`Minting gas used: ${receipt.gasUsed}`);
        console.log(`Gas charged (limit): ${receipt.gasLimit}`);
        
        // Monad charges gas limit, not gas used
        expect(receipt.gasLimit).to.equal(180000);
        expect(receipt.gasUsed).to.be.lessThan(180000);
    });
    
    it('Should batch operations efficiently', async function () {
        // Test multiple mints by same user for different artifacts
        const artifactIds = [0, 1, 2];
        let totalGasUsed = 0n;
        
        for (const id of artifactIds) {
            const tx = await nftContract.connect(user1).mintArtifact(id, {
                gasLimit: 180000
            });
            const receipt = await tx.wait();
            totalGasUsed += receipt.gasUsed;
        }
        
        console.log(`Total gas for 3 mints: ${totalGasUsed}`);
        expect(totalGasUsed).to.be.lessThan(500000n); // Should be efficient
    });
}); 