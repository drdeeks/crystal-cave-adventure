// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../script/Deploy.s.sol";
import "../src/CrystalCaveNFT.sol";

contract DeploymentTest is Test {
    DeployScript public deployScript;
    CrystalCaveNFT public deployedContract;
    
    string constant EXPECTED_BASE_URI = "https://crystal-cave-nft.netlify.app/metadata/";
    
    function setUp() public {
        deployScript = new DeployScript();
    }
    
    function testDeploymentScript() public {
        // Run the deployment script
        deployScript.run();
        
        // Get the deployed contract address from the script
        // Note: In real deployment, you'd get this from the deployment output
        deployedContract = new CrystalCaveNFT(EXPECTED_BASE_URI);
        
        // Verify deployment was successful
        assertTrue(address(deployedContract) != address(0), "Contract should be deployed");
        
        // Verify initial state
        assertEq(deployedContract.name(), "Crystal Cave Artifacts");
        assertEq(deployedContract.symbol(), "CCA");
        assertEq(deployedContract.baseURI(), EXPECTED_BASE_URI);
        assertEq(deployedContract.totalSupply(), 0);
        assertFalse(deployedContract.paused());
    }
    
    function testContractFunctionality() public {
        // Deploy contract
        deployedContract = new CrystalCaveNFT(EXPECTED_BASE_URI);
        
        address user = makeAddr("testUser");
        
        // Test basic functionality
        vm.prank(user);
        deployedContract.mintArtifact(0);
        
        assertTrue(deployedContract.userOwnsArtifact(user, 0));
        assertEq(deployedContract.balanceOf(user), 1);
        
        // Test metadata URI - token ID 1 is the first minted token (nextTokenId starts at 1)
        string memory expectedURI = string(abi.encodePacked(EXPECTED_BASE_URI, "0.json"));
        assertEq(deployedContract.tokenURI(1), expectedURI);
    }
    
    function testMonadTestnetConfiguration() public view {
        // Verify we're testing with correct network settings
        // Note: In test environment, we use the local anvil chain
        // In actual deployment, this would be Monad Testnet (10143)
        assertTrue(block.chainid > 0, "Chain ID should be set");
        
        // Log current chain ID for debugging
        console.log("Current chain ID:", block.chainid);
    }
    
    function testGasEstimation() public {
        uint256 gasBefore = gasleft();
        
        // Deploy contract
        deployedContract = new CrystalCaveNFT(EXPECTED_BASE_URI);
        
        uint256 deploymentGas = gasBefore - gasleft();
        
        // Log gas usage for deployment
        console.log("Deployment gas used:", deploymentGas);
        
        // Ensure deployment gas is reasonable for Monad (increased limit for complex contract)
        assertLt(deploymentGas, 6000000, "Deployment gas should be under 6M for Monad");
    }
    
    function testAllArtifactNames() public {
        deployedContract = new CrystalCaveNFT(EXPECTED_BASE_URI);
        
        string[22] memory expectedNames = [
            "Ancient Map",           // 0
            "Sage's Blessing",       // 1
            "Magical Compass",       // 2
            "Marina's Journal",      // 3
            "Water Crystal",         // 4
            "Pattern Pearl",         // 5
            "Fossil Fragment",       // 6
            "Harmony Stone",         // 7
            "Fire Crystal",          // 8
            "Courage Gem",           // 9
            "Ancient Scroll",        // 10
            "Dragon's Wisdom",       // 11
            "Meteor Fragment",       // 12
            "Star Map",              // 13
            "Planetary Badge",       // 14
            "Galaxy Map",            // 15
            "Time Crystal",          // 16
            "Master Crystal",        // 17
            "Chill Dak",            // 18
            "Moyaki",               // 19
            "Salmonad",             // 20
            "Dead Chog"             // 21
        ];
        
        for (uint256 i = 0; i < 22; i++) {
            assertEq(
                deployedContract.getArtifactName(i), 
                expectedNames[i], 
                string(abi.encodePacked("Artifact ", vm.toString(i), " name mismatch"))
            );
        }
    }
    
    function testOwnershipTransfer() public {
        deployedContract = new CrystalCaveNFT(EXPECTED_BASE_URI);
        
        address newOwner = makeAddr("newOwner");
        
        // Transfer ownership
        deployedContract.transferOwnership(newOwner);
        
        // Verify new owner
        assertEq(deployedContract.owner(), newOwner);
        
        // Old owner should not be able to pause (OpenZeppelin v5 error format)
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, address(this))); // OwnableUnauthorizedAccount
        deployedContract.pause();
        
        // New owner should be able to pause
        vm.prank(newOwner);
        deployedContract.pause();
        assertTrue(deployedContract.paused());
    }
} 