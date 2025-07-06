// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CrystalCaveNFT.sol";

contract CrystalCaveNFTTest is Test {
    CrystalCaveNFT public nftContract;
    address public owner;
    address public user1;
    address public user2;
    
    string constant BASE_URI = "https://crystal-cave-nft.netlify.app/metadata/";
    
    // Define the event to match the contract
    event ArtifactMinted(address indexed to, uint256 indexed tokenId, uint256 indexed artifactId, string artifactName);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy the contract
        nftContract = new CrystalCaveNFT(BASE_URI);
    }
    
    function testInitialState() public view {
        assertEq(nftContract.name(), "Crystal Cave Artifacts");
        assertEq(nftContract.symbol(), "CCA");
        assertEq(nftContract.owner(), owner);
        assertEq(nftContract.baseURI(), BASE_URI);
        assertEq(nftContract.totalSupply(), 0);
    }
    
    function testArtifactNames() public view {
        // Test first few artifacts
        assertEq(nftContract.getArtifactName(0), "Ancient Map");
        assertEq(nftContract.getArtifactName(1), "Sage's Blessing");
        assertEq(nftContract.getArtifactName(18), "Chill Dak");
        assertEq(nftContract.getArtifactName(19), "Moyaki");
        assertEq(nftContract.getArtifactName(20), "Salmonad");
        assertEq(nftContract.getArtifactName(21), "Dead Chog");
    }
    
    function testInvalidArtifactName() public {
        vm.expectRevert("Artifact does not exist");
        nftContract.getArtifactName(22);
    }
    
    function testMintArtifact() public {
        uint256 artifactId = 0;
        
        // Mint artifact to user1
        vm.prank(user1);
        nftContract.mintArtifact(artifactId);
        
        // Check ownership
        assertTrue(nftContract.userOwnsArtifact(user1, artifactId));
        assertEq(nftContract.balanceOf(user1), 1);
        assertEq(nftContract.totalSupply(), 1);
        
        // Check token URI - token ID 1 is the first minted token (nextTokenId starts at 1)
        string memory expectedURI = string(abi.encodePacked(BASE_URI, "0.json"));
        assertEq(nftContract.tokenURI(1), expectedURI);
    }
    
    function testCannotMintSameArtifactTwice() public {
        uint256 artifactId = 0;
        
        // First mint should succeed
        vm.prank(user1);
        nftContract.mintArtifact(artifactId);
        
        // Second mint should fail
        vm.prank(user1);
        vm.expectRevert("User already owns this artifact type");
        nftContract.mintArtifact(artifactId);
    }
    
    function testDifferentUsersCanMintSameArtifact() public {
        uint256 artifactId = 0;
        
        // User1 mints artifact
        vm.prank(user1);
        nftContract.mintArtifact(artifactId);
        
        // User2 can also mint the same artifact
        vm.prank(user2);
        nftContract.mintArtifact(artifactId);
        
        // Both should own the artifact
        assertTrue(nftContract.userOwnsArtifact(user1, artifactId));
        assertTrue(nftContract.userOwnsArtifact(user2, artifactId));
        assertEq(nftContract.totalSupply(), 2);
    }
    
    function testUserCanMintDifferentArtifacts() public {
        // User1 mints multiple different artifacts
        vm.startPrank(user1);
        
        nftContract.mintArtifact(0);  // Ancient Map
        nftContract.mintArtifact(1);  // Sage's Blessing
        nftContract.mintArtifact(18); // Chill Dak
        nftContract.mintArtifact(21); // Dead Chog
        
        vm.stopPrank();
        
        // Check all artifacts are owned
        assertTrue(nftContract.userOwnsArtifact(user1, 0));
        assertTrue(nftContract.userOwnsArtifact(user1, 1));
        assertTrue(nftContract.userOwnsArtifact(user1, 18));
        assertTrue(nftContract.userOwnsArtifact(user1, 21));
        
        assertEq(nftContract.balanceOf(user1), 4);
        assertEq(nftContract.totalSupply(), 4);
    }
    
    function testInvalidArtifactId() public {
        vm.prank(user1);
        vm.expectRevert("Artifact does not exist");
        nftContract.mintArtifact(22);
    }
    
    function testGetUserArtifacts() public {
        vm.startPrank(user1);
        
        // Mint some artifacts
        nftContract.mintArtifact(0);
        nftContract.mintArtifact(5);
        nftContract.mintArtifact(18);
        
        vm.stopPrank();
        
        uint256[] memory userArtifacts = nftContract.getUserArtifacts(user1);
        assertEq(userArtifacts.length, 3);
        
        // Check the artifacts are correct
        bool hasArtifact0 = false;
        bool hasArtifact5 = false;
        bool hasArtifact18 = false;
        
        for (uint i = 0; i < userArtifacts.length; i++) {
            if (userArtifacts[i] == 0) hasArtifact0 = true;
            if (userArtifacts[i] == 5) hasArtifact5 = true;
            if (userArtifacts[i] == 18) hasArtifact18 = true;
        }
        
        assertTrue(hasArtifact0);
        assertTrue(hasArtifact5);
        assertTrue(hasArtifact18);
    }
    
    function testUpdateBaseURI() public {
        string memory newBaseURI = "https://new-domain.com/metadata/";
        
        // Only owner can update
        nftContract.setBaseURI(newBaseURI);
        assertEq(nftContract.baseURI(), newBaseURI);
        
        // Non-owner cannot update (OpenZeppelin v5 error format)
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, user1)); // OwnableUnauthorizedAccount
        nftContract.setBaseURI("https://malicious.com/");
    }
    
    function testPauseUnpause() public {
        // Only owner can pause
        nftContract.pause();
        assertTrue(nftContract.paused());
        
        // Cannot mint when paused (OpenZeppelin v5 error format)
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(0xd93c0665)); // EnforcedPause
        nftContract.mintArtifact(0);
        
        // Owner can unpause
        nftContract.unpause();
        assertFalse(nftContract.paused());
        
        // Can mint again after unpause
        vm.prank(user1);
        nftContract.mintArtifact(0);
        assertTrue(nftContract.userOwnsArtifact(user1, 0));
    }
    
    function testNonOwnerCannotPause() public {
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, user1)); // OwnableUnauthorizedAccount
        nftContract.pause();
    }
    
    function testSupportsInterface() public view {
        // ERC721
        assertTrue(nftContract.supportsInterface(0x80ac58cd));
        // ERC721Metadata
        assertTrue(nftContract.supportsInterface(0x5b5e139f));
        // ERC165
        assertTrue(nftContract.supportsInterface(0x01ffc9a7));
    }
    
    function testTokenURIForAllArtifacts() public {
        // Test all 22 artifacts
        for (uint256 i = 0; i < 22; i++) {
            vm.prank(user1);
            nftContract.mintArtifact(i);
            
            // Token IDs start from 1, not 0
            uint256 tokenId = i + 1;
            string memory expectedURI = string(abi.encodePacked(BASE_URI, vm.toString(i), ".json"));
            assertEq(nftContract.tokenURI(tokenId), expectedURI);
        }
    }
    
    function testMintingEvents() public {
        uint256 artifactId = 0;
        
        // Expect the ArtifactMinted event from our contract
        vm.expectEmit(true, true, true, true);
        emit ArtifactMinted(user1, 1, artifactId, "Ancient Map");
        
        vm.prank(user1);
        nftContract.mintArtifact(artifactId);
    }
    
    function testGasUsage() public {
        uint256 gasBefore = gasleft();
        
        vm.prank(user1);
        nftContract.mintArtifact(0);
        
        uint256 gasUsed = gasBefore - gasleft();
        
        // Ensure gas usage is reasonable (adjust threshold as needed)
        assertLt(gasUsed, 200000, "Minting uses too much gas");
    }
    
    function testBatchMinting() public {
        vm.startPrank(user1);
        
        // Test minting all 22 artifacts
        for (uint256 i = 0; i < 22; i++) {
            nftContract.mintArtifact(i);
        }
        
        vm.stopPrank();
        
        // Verify all artifacts are owned
        for (uint256 i = 0; i < 22; i++) {
            assertTrue(nftContract.userOwnsArtifact(user1, i));
        }
        
        assertEq(nftContract.balanceOf(user1), 22);
        assertEq(nftContract.totalSupply(), 22);
    }
    
    function testMonadTestnetConfiguration() public view {
        // Verify we're testing with correct network settings
        // Note: In test environment, we use the local anvil chain
        // In actual deployment, this would be Monad Testnet (10143)
        assertTrue(block.chainid > 0, "Chain ID should be set");
        
        // Log current chain ID for debugging
        console.log("Current chain ID:", block.chainid);
    }

    function testOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Transfer ownership
        nftContract.transferOwnership(newOwner);
        
        // Verify new owner
        assertEq(nftContract.owner(), newOwner);
        
        // Old owner should not be able to pause (OpenZeppelin v5 error format)
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, address(this))); // OwnableUnauthorizedAccount
        nftContract.pause();
        
        // New owner should be able to pause
        vm.prank(newOwner);
        nftContract.pause();
        assertTrue(nftContract.paused());
    }
} 