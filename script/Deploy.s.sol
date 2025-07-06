// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CrystalCaveNFT.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // FINAL IPFS Configuration - Enhanced Metadata
        // Metadata Hash: bafybeiexaxdly7tuz6u4hnbp6raoxwdhx6t666ghibm2khi2wu5nwyv5ae
        // Images Hash: bafybeieihybcrktnj4lrtzqhxkcedpxzk5wvga3bcvr7mus4zpthqbs3zu
        string memory baseURI = "https://gateway.pinata.cloud/ipfs/bafybeihpu26nuz3zztksn5lfsbdzw744c5mxgbxzrx3shkecoiiwc7w2rq/";
        
        // Deploy contract (gas limit controlled via forge command options)
        CrystalCaveNFT nft = new CrystalCaveNFT(baseURI);
        
        console.log("Crystal Cave NFT Contract Deployed Successfully!");
        console.log("Contract Address:", address(nft));
        console.log("Base URI:", baseURI);
        console.log("Total Artifacts: 22");
        console.log("Monanimals: 4 (Chill Dak, Moyaki, Salmonad, Dead Chog)");
        console.log("Enhanced Traits: Activated");
        console.log("Network: Monad Testnet");
        
        // Test URLs for verification:
        console.log("Test URLs:");
        console.log("   Ancient Map:", string.concat(baseURI, "0.json"));
        console.log("   Chill Dak:", string.concat(baseURI, "18.json"));
        
        vm.stopBroadcast();
    }
} 