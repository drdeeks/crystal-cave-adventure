const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Crystal Cave NFT Integration Tests', function () {
    let nftContract;
    let owner;
    let user1;
    let user2;
    
    const BASE_URI = "https://crystal-cave-nft.netlify.app/metadata/";
    
    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const CrystalCaveNFT = await ethers.getContractFactory('CrystalCaveNFT');
        nftContract = await CrystalCaveNFT.deploy(BASE_URI);
        await nftContract.deployed();
    });
    
    describe('Contract Deployment', function () {
        it('Should deploy with correct initial values', async function () {
            expect(await nftContract.name()).to.equal('Crystal Cave Artifacts');
            expect(await nftContract.symbol()).to.equal('CCA');
            expect(await nftContract.baseURI()).to.equal(BASE_URI);
            expect(await nftContract.totalSupply()).to.equal(0);
            expect(await nftContract.owner()).to.equal(owner.address);
        });
    });
    
    describe('Artifact Minting', function () {
        it('Should mint artifact successfully', async function () {
            await nftContract.connect(user1).mintArtifact(0);
            
            expect(await nftContract.userOwnsArtifact(user1.address, 0)).to.be.true;
            expect(await nftContract.balanceOf(user1.address)).to.equal(1);
            expect(await nftContract.totalSupply()).to.equal(1);
        });
        
        it('Should prevent duplicate minting by same user', async function () {
            await nftContract.connect(user1).mintArtifact(0);
            
            await expect(
                nftContract.connect(user1).mintArtifact(0)
            ).to.be.revertedWith('User already owns this artifact type');
        });
        
        it('Should allow different users to mint same artifact', async function () {
            await nftContract.connect(user1).mintArtifact(0);
            await nftContract.connect(user2).mintArtifact(0);
            
            expect(await nftContract.userOwnsArtifact(user1.address, 0)).to.be.true;
            expect(await nftContract.userOwnsArtifact(user2.address, 0)).to.be.true;
            expect(await nftContract.totalSupply()).to.equal(2);
        });
        
        it('Should allow user to mint multiple different artifacts', async function () {
            await nftContract.connect(user1).mintArtifact(0);
            await nftContract.connect(user1).mintArtifact(1);
            await nftContract.connect(user1).mintArtifact(18);
            
            expect(await nftContract.balanceOf(user1.address)).to.equal(3);
            expect(await nftContract.userOwnsArtifact(user1.address, 0)).to.be.true;
            expect(await nftContract.userOwnsArtifact(user1.address, 1)).to.be.true;
            expect(await nftContract.userOwnsArtifact(user1.address, 18)).to.be.true;
        });
    });
    
    describe('Monanimal Artifacts', function () {
        it('Should mint Monanimal artifacts correctly', async function () {
            const monanimals = [18, 19, 20, 21]; // Chill Dak, Moyaki, Salmonad, Dead Chog
            
            for (const artifactId of monanimals) {
                await nftContract.connect(user1).mintArtifact(artifactId);
                expect(await nftContract.userOwnsArtifact(user1.address, artifactId)).to.be.true;
            }
            
            expect(await nftContract.balanceOf(user1.address)).to.equal(4);
        });
        
        it('Should have correct Monanimal names', async function () {
            expect(await nftContract.getArtifactName(18)).to.equal('Chill Dak');
            expect(await nftContract.getArtifactName(19)).to.equal('Moyaki');
            expect(await nftContract.getArtifactName(20)).to.equal('Salmonad');
            expect(await nftContract.getArtifactName(21)).to.equal('Dead Chog');
        });
    });
    
    describe('Metadata and URIs', function () {
        it('Should return correct token URI', async function () {
            await nftContract.connect(user1).mintArtifact(5);
            
            const expectedURI = BASE_URI + '5.json';
            expect(await nftContract.tokenURI(0)).to.equal(expectedURI);
        });
        
        it('Should update base URI correctly', async function () {
            const newBaseURI = 'https://new-domain.com/metadata/';
            await nftContract.updateBaseURI(newBaseURI);
            
            expect(await nftContract.baseURI()).to.equal(newBaseURI);
            
            await nftContract.connect(user1).mintArtifact(0);
            expect(await nftContract.tokenURI(0)).to.equal(newBaseURI + '0.json');
        });
    });
    
    describe('Gas Optimization', function () {
        it('Should have reasonable gas costs for minting', async function () {
            const tx = await nftContract.connect(user1).mintArtifact(0);
            const receipt = await tx.wait();
            
            console.log('Minting gas used:', receipt.gasUsed.toString());
            expect(receipt.gasUsed.toNumber()).to.be.lessThan(200000);
        });
    });
    
    describe('Pause Functionality', function () {
        it('Should prevent minting when paused', async function () {
            await nftContract.pause();
            
            await expect(
                nftContract.connect(user1).mintArtifact(0)
            ).to.be.revertedWith('Pausable: paused');
        });
        
        it('Should allow minting after unpause', async function () {
            await nftContract.pause();
            await nftContract.unpause();
            
            await nftContract.connect(user1).mintArtifact(0);
            expect(await nftContract.userOwnsArtifact(user1.address, 0)).to.be.true;
        });
    });
    
    describe('User Artifacts Retrieval', function () {
        it('Should return correct user artifacts', async function () {
            await nftContract.connect(user1).mintArtifact(0);
            await nftContract.connect(user1).mintArtifact(5);
            await nftContract.connect(user1).mintArtifact(18);
            
            const userArtifacts = await nftContract.getUserArtifacts(user1.address);
            expect(userArtifacts.length).to.equal(3);
            
            const artifactIds = userArtifacts.map(id => id.toNumber());
            expect(artifactIds).to.include.members([0, 5, 18]);
        });
    });
    
    describe('Error Handling', function () {
        it('Should revert for invalid artifact ID', async function () {
            await expect(
                nftContract.connect(user1).mintArtifact(22)
            ).to.be.revertedWith('Artifact does not exist');
        });
        
        it('Should revert when getting name for invalid artifact', async function () {
            await expect(
                nftContract.getArtifactName(25)
            ).to.be.revertedWith('Artifact does not exist');
        });
    });
    
    describe('Events', function () {
        it('Should emit Transfer event on mint', async function () {
            await expect(nftContract.connect(user1).mintArtifact(0))
                .to.emit(nftContract, 'Transfer')
                .withArgs(ethers.constants.AddressZero, user1.address, 0);
        });
    });
    
    describe('Interface Support', function () {
        it('Should support ERC721 interfaces', async function () {
            // ERC721
            expect(await nftContract.supportsInterface('0x80ac58cd')).to.be.true;
            // ERC721Metadata
            expect(await nftContract.supportsInterface('0x5b5e139f')).to.be.true;
            // ERC165
            expect(await nftContract.supportsInterface('0x01ffc9a7')).to.be.true;
        });
    });
}); 