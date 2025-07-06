// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CrystalCaveNFT
 * @dev NFT contract for Crystal Cave Adventure artifacts
 * Features:
 * - Unlimited total supply
 * - Max 1 NFT per artifact type per user
 * - Free minting (users only pay gas)
 * - Monad Testnet deployment
 */
contract CrystalCaveNFT is ERC721, Ownable, ReentrancyGuard, Pausable {
    uint256 private _nextTokenId = 1;
    
    // Mapping from user address to artifact ID to whether they own it
    mapping(address => mapping(uint256 => bool)) public userArtifacts;
    
    // Mapping from token ID to artifact ID
    mapping(uint256 => uint256) public tokenToArtifact;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Artifact definitions
    struct Artifact {
        uint256 id;
        string name;
        string description;
        bool isActive;
    }
    
    // Array of all artifacts
    Artifact[] public artifacts;
    
    // Events
    event ArtifactMinted(address indexed to, uint256 indexed tokenId, uint256 indexed artifactId, string artifactName);
    event ArtifactAdded(uint256 indexed artifactId, string name);
    event BaseURIUpdated(string newBaseURI);
    
    constructor(string memory baseTokenURI) ERC721("Crystal Cave Artifacts", "CCA") Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
        
        // Initialize with existing artifacts
        _addArtifact("Ancient Map", "A mystical map revealing hidden cave passages");
        _addArtifact("Sage's Blessing", "Wisdom granted by the cave's guardian sage");
        _addArtifact("Magical Compass", "A compass that points to magical discoveries");
        _addArtifact("Marina's Journal", "Ancient explorer's notes and secrets");
        _addArtifact("Water Crystal", "Crystal imbued with the power of flowing water");
        _addArtifact("Pattern Pearl", "Pearl containing mathematical mysteries");
        _addArtifact("Fossil Fragment", "Ancient remnant from prehistoric times");
        _addArtifact("Harmony Stone", "Stone that resonates with musical frequencies");
        _addArtifact("Fire Crystal", "Crystal burning with eternal warmth");
        _addArtifact("Courage Gem", "Gem that strengthens the heart of brave explorers");
        _addArtifact("Ancient Scroll", "Scroll containing knowledge of ancient civilizations");
        _addArtifact("Dragon's Wisdom", "Wisdom shared by the cave's dragon guardian");
        _addArtifact("Meteor Fragment", "Fragment from the meteor that created the cave");
        _addArtifact("Star Map", "Celestial map revealing cosmic secrets");
        _addArtifact("Planetary Badge", "Badge earned through cosmic exploration");
        _addArtifact("Galaxy Map", "Map of distant galaxies and their mysteries");
        _addArtifact("Time Crystal", "Crystal that manipulates the flow of time");
        _addArtifact("Master Crystal", "The ultimate crystal containing all cave secrets");
        
        // Add new Monanimals artifacts
        _addArtifact("Chill Dak", "A serene duck-like Monanimal that brings tranquility");
        _addArtifact("Moyaki", "A mystical octopus Monanimal with ancient wisdom");
        _addArtifact("Salmonad", "A noble salmon Monanimal swimming upstream through dimensions");
        _addArtifact("Dead Chog", "A legendary pig Monanimal from the forgotten realms");
    }
    
    /**
     * @dev Mint an artifact NFT to the caller
     * @param artifactId The ID of the artifact to mint
     */
    function mintArtifact(uint256 artifactId) external nonReentrant whenNotPaused {
        require(artifactId < artifacts.length, "Artifact does not exist");
        require(artifacts[artifactId].isActive, "Artifact is not active");
        require(!userArtifacts[msg.sender][artifactId], "User already owns this artifact type");
        
        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;
        
        // Record that user owns this artifact type
        userArtifacts[msg.sender][artifactId] = true;
        
        // Map token to artifact
        tokenToArtifact[newTokenId] = artifactId;
        
        // Mint the NFT
        _safeMint(msg.sender, newTokenId);
        
        emit ArtifactMinted(msg.sender, newTokenId, artifactId, artifacts[artifactId].name);
    }
    
    /**
     * @dev Check if user owns a specific artifact
     * @param user The address to check
     * @param artifactId The artifact ID to check
     * @return Whether the user owns the artifact
     */
    function userOwnsArtifact(address user, uint256 artifactId) external view returns (bool) {
        return userArtifacts[user][artifactId];
    }
    
    /**
     * @dev Get all artifacts owned by a user
     * @param user The address to check
     * @return Array of artifact IDs owned by the user
     */
    function getUserArtifacts(address user) external view returns (uint256[] memory) {
        // Pre-allocate with maximum possible size to avoid dynamic resizing
        uint256[] memory temp = new uint256[](artifacts.length);
        uint256 count = 0;
        
        // Single loop instead of double loop
        for (uint256 i = 0; i < artifacts.length; i++) {
            if (userArtifacts[user][i]) {
                temp[count] = i;
                count++;
            }
        }
        
        // Create right-sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get artifact name by ID
     * @param artifactId The artifact ID
     * @return The artifact name
     */
    function getArtifactName(uint256 artifactId) external view returns (string memory) {
        require(artifactId < artifacts.length, "Artifact does not exist");
        return artifacts[artifactId].name;
    }
    
    /**
     * @dev Get artifact information by ID
     * @param artifactId The artifact ID
     * @return Artifact struct
     */
    function getArtifact(uint256 artifactId) external view returns (Artifact memory) {
        require(artifactId < artifacts.length, "Artifact does not exist");
        return artifacts[artifactId];
    }
    
    /**
     * @dev Get total number of artifacts
     * @return Total artifact count
     */
    function getArtifactCount() external view returns (uint256) {
        return artifacts.length;
    }
    
    /**
     * @dev Get all artifacts
     * @return Array of all artifacts
     */
    function getAllArtifacts() external view returns (Artifact[] memory) {
        return artifacts;
    }
    
    /**
     * @dev Add a new artifact (only owner)
     * @param name The artifact name
     * @param description The artifact description
     */
    function addArtifact(string memory name, string memory description) external onlyOwner {
        _addArtifact(name, description);
    }
    
    /**
     * @dev Internal function to add an artifact
     * @param name The artifact name
     * @param description The artifact description
     */
    function _addArtifact(string memory name, string memory description) internal {
        uint256 artifactId = artifacts.length;
        artifacts.push(Artifact({
            id: artifactId,
            name: name,
            description: description,
            isActive: true
        }));
        
        emit ArtifactAdded(artifactId, name);
    }
    
    /**
     * @dev Toggle artifact active status (only owner)
     * @param artifactId The artifact ID
     */
    function toggleArtifactActive(uint256 artifactId) external onlyOwner {
        require(artifactId < artifacts.length, "Artifact does not exist");
        artifacts[artifactId].isActive = !artifacts[artifactId].isActive;
    }
    
    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update base URI (only owner)
     * @param newBaseURI The new base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @dev Get base URI (public function for testing)
     * @return The base URI
     */
    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get base URI
     * @return The base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get token URI
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        
        string memory baseTokenURI = _baseURI();
        uint256 artifactId = tokenToArtifact[tokenId];
        
        return bytes(baseTokenURI).length > 0 
            ? string(abi.encodePacked(baseTokenURI, Strings.toString(artifactId), ".json"))
            : "";
    }
    
    /**
     * @dev Get total supply of minted tokens
     * @return Total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
} 