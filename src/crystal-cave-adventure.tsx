import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Home, Star, Moon, Sun, List } from 'lucide-react';
import ReactConfetti from 'react-confetti';

const CONTRACT_CONFIG = {
  address: process.env.REACT_APP_CONTRACT_ADDRESS || "0x17a8086D5760E6a2Ee0026866Cf986c02ce4dbD6",
  abi: [
    "function getAllArtifacts() external view returns (tuple(uint256 id, string name, string description, bool isActive)[])",
    "function getUserArtifacts(address user) external view returns (uint256[] memory)"
  ]
};

// Canonical artifact list (id, name, image) - All 22 artifacts verified ✓
// Each artifact has corresponding game scenes and minting integration
const CANONICAL_ARTIFACTS = [
  { id: 0, name: 'Ancient Map', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/0.png' },
  { id: 1, name: "Sage's Blessing", image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/1.png' },
  { id: 2, name: 'Magical Compass', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/2.png' },
  { id: 3, name: "Marina's Journal", image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/3.png' },
  { id: 4, name: 'Water Crystal', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/4.png' },
  { id: 5, name: 'Pattern Pearl', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/5.png' },
  { id: 6, name: 'Fossil Fragment', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/6.png' },
  { id: 7, name: 'Harmony Stone', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/7.png' },
  { id: 8, name: 'Fire Crystal', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/8.png' },
  { id: 9, name: 'Courage Gem', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/9.png' },
  { id: 10, name: 'Ancient Scroll', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/10.png' },
  { id: 11, name: "Dragon's Wisdom", image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/11.png' },
  { id: 12, name: 'Meteor Fragment', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/12.png' },
  { id: 13, name: 'Star Map', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/13.png' },
  { id: 14, name: 'Planetary Badge', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/14.png' },
  { id: 15, name: 'Galaxy Map', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/15.png' },
  { id: 16, name: 'Time Crystal', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/16.png' },
  { id: 17, name: 'Master Crystal', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/17.png' },
  { id: 18, name: 'Chill Dak', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/18.png' },
  { id: 19, name: 'Moyaki', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/19.png' },
  { id: 20, name: 'Salmonad', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/20.png' },
  { id: 21, name: 'Dead Chog', image: 'https://gateway.pinata.cloud/ipfs/bafybeiauxiyv4f3qbusorpwqgaw7jw7mbqbunbueraohw6ea64aodhhwpe/21.png' },
];

// Draft rarity labels for quick UI display – values follow RARITY_SYSTEM.md
const ARTIFACT_RANKS: Record<number, string> = {
  0: 'Uncommon', 1: 'Epic', 2: 'Rare', 3: 'Legendary', 4: 'Common', 5: 'Rare',
  6: 'Uncommon', 7: 'Rare', 8: 'Common', 9: 'Epic', 10: 'Rare', 11: 'Legendary',
  12: 'Legendary', 13: 'Common', 14: 'Uncommon', 15: 'Rare', 16: 'Legendary', 17: 'Legendary',
  18: 'Epic', 19: 'Legendary', 20: 'Mythic', 21: 'Legendary'
};

// Utility: Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[an][bn];
}

const AdventureLearningGame = () => {
  const [currentScene, setCurrentScene] = useState<string>('start');
  const [score, setScore] = useState<number>(0);
  const [playerName, setPlayerName] = useState<string>('');
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<'path' | 'quiz' | 'continue' | 'reward'>('path');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [collectedArtifacts, setCollectedArtifacts] = useState<number[]>([]);
  const [lastPathScene, setLastPathScene] = useState<string>('start');
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  // Add visitedSanctums state
  const [visitedSanctums, setVisitedSanctums] = useState({ wisdom: false, courage: false, kindness: false });
  // Animation state for artifact collection
  const [recentlyCollected, setRecentlyCollected] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recentlyIncreasedStat, setRecentlyIncreasedStat] = useState<keyof typeof playerStats | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sceneTransition, setSceneTransition] = useState<'enter' | 'exit' | ''>('');
  const prevSceneRef = useRef<string>(currentScene);
  // ... after useState hooks ...
  const [playerStats, setPlayerStats] = useState<{ wisdom: number; courage: number; kindness: number; discovery: number }>({
    wisdom: 0,
    courage: 0,
    kindness: 0,
    discovery: 0
  });
  // ... ensure all references to playerStats and setPlayerStats are in scope ...
  // ... move handleReplay above its first use ...
  const handleReplay = () => {
    setVisitedSanctums({ wisdom: false, courage: false, kindness: false });
    // Preserve artifact inventory on death – players keep collected and minted items
    // setCollectedArtifacts([]);
    // setOwnedArtifactIds([]);
    setPlayerStats({ wisdom: 0, courage: 0, kindness: 0, discovery: 0 });
    setCurrentScene('start');
    setGameMode('path');
    setPlayerName('');
  };
  // ... remove unused variables: gameStarted, setGameStarted, handleLoadProgress, allCollected ...
  // ... existing code ...

  const [ownedArtifactIds, setOwnedArtifactIds] = useState<number[]>([]);
  const [showArtifactReward, setShowArtifactReward] = useState<null | { id: number, name: string }>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [viewsHistory, setViewsHistory] = useState<{ scene: string; mode: 'path' | 'quiz' | 'continue' | 'reward' }[]>([]);
  // Modal: artifact being inspected
  // const [activeArtifact, setActiveArtifact] = useState<any>(null);

  const addScore = (points: number) => {
    setScore(prev => prev + points);
  };

  const addStat = (stat: keyof typeof playerStats, value: number) => {
    setPlayerStats((prev: { wisdom: number; courage: number; kindness: number; discovery: number }) => {
      const newValue = prev[stat] + value;
      setRecentlyIncreasedStat(stat);
      setTimeout(() => setRecentlyIncreasedStat(null), 1000);
      return { ...prev, [stat]: newValue };
    });
  };

  // Quiz completion handler
  const handleQuizSuccess = (artifactReward: { id: number, name: string }) => {
    addScore(10);
    setShowArtifactReward(artifactReward);
    setGameMode('continue');
  };

  // Continue after quiz success
  const handleContinue = () => {
    setGameMode('reward');
  };

  // Mint NFT and return to path selection
  const handleMintAndContinue = async () => {
    if (showArtifactReward && !isMinting) {
      setIsMinting(true);
      try {
        // Direct minting implementation with proper null checks
        if (typeof window.ethereum !== 'undefined' && window.ethereum && isWalletConnected) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          // Complete ABI for minting
          const contractABI = [
            "function mintArtifact(uint256 artifactId) external",
            "function userOwnsArtifact(address user, uint256 artifactId) external view returns (bool)",
            "function getUserArtifacts(address user) external view returns (uint256[] memory)",
            "event ArtifactMinted(address indexed to, uint256 indexed tokenId, uint256 indexed artifactId, string artifactName)"
          ];
          
          const contract = new ethers.Contract(CONTRACT_CONFIG.address, contractABI, signer);

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const account = accounts[0];

          // Check if user already owns this artifact
          const alreadyOwns = await contract.userOwnsArtifact(account, showArtifactReward.id);
          if (!alreadyOwns) {
            console.log(`Attempting to mint artifact ${showArtifactReward.id}: ${showArtifactReward.name}`);
            
            // Send transaction with proper gas estimation
            const gasEstimate = await contract.mintArtifact.estimateGas(showArtifactReward.id);
            const tx = await contract.mintArtifact(showArtifactReward.id, { 
              gasLimit: gasEstimate * 120n / 100n // 20% buffer
            });
            
            console.log('Transaction sent:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            // Update owned artifacts list (avoid duplicates)
            setOwnedArtifactIds(prev => 
              prev.includes(showArtifactReward.id) ? prev : [...prev, showArtifactReward.id]
            );
            
            // Remove from collected artifacts so minting option doesn't reappear
            setCollectedArtifacts(prev => prev.filter(id => id !== showArtifactReward.id));
            
            console.log(`Successfully minted ${showArtifactReward.name}!`);
          } else {
            console.log('User already owns this artifact');
          }
        }
      } catch (error) {
        console.error('Minting failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Minting failed: ${errorMessage}`);
      } finally {
        setIsMinting(false);
        setShowArtifactReward(null);
        setGameMode('path');
      }
    }
  };

  // Skip minting and return to path selection
  const handleSkipMint = () => {
    // Remove from collected artifacts so minting option doesn't reappear
    if (showArtifactReward) {
      setCollectedArtifacts(prev => prev.filter(id => id !== showArtifactReward.id));
      console.log(`Skipped minting ${showArtifactReward.name} - removed from collection queue`);
    }
    setShowArtifactReward(null);
    setGameMode('path');
  };

  // Helper function to change scenes and track last path scene
  const changeToScene = (sceneName: string, mode: 'path' | 'quiz' | 'continue' | 'reward' = 'path') => {
    // Record current view before navigating, so we can return later
    setViewsHistory(prev => [...prev, { scene: currentScene, mode: gameMode }]);
    if (mode === 'path') {
      setLastPathScene(sceneName);
    }
    setCurrentScene(sceneName);
    setGameMode(mode);
  };

  // Navigate back to the previous view (if any)
  const handleGoBack = () => {
    setViewsHistory(prev => {
      if (prev.length === 0) {
        // Nothing to go back to – return to the last path scene the player visited
        setCurrentScene(lastPathScene || 'start');
        setGameMode('path');
        return prev;
      }
      const historyCopy = [...prev];
      const last = historyCopy.pop()!;
      setCurrentScene(last.scene);
      setGameMode(last.mode);
      return historyCopy;
    });
  };

  // Animate artifact collection
  const collectArtifact = (artifactId: number, artifactName: string) => {
    if (!collectedArtifacts.includes(artifactId)) {
      setCollectedArtifacts(prev => [...prev, artifactId]);
      setRecentlyCollected(artifactId);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
      console.log(`🎯 Artifact Collected: [${artifactId}] ${artifactName}`);
    }
    // Removed automatic addition to ownedArtifactIds here – minting will now control ownership state
  };

  // Show mint option for collected artifact
  const showMintOption = (artifactId: number, artifactName: string) => {
    handleQuizSuccess({ id: artifactId, name: artifactName });
  };

  // Helper function to filter choices based on owned artifacts
  const filterChoicesForOwnedArtifacts = (choices: any[]) => {
    return choices.filter(choice => {
      // Check if this choice is a minting option by looking for specific keywords
      const choiceText = choice.text.toLowerCase();
      const isMintingChoice = choiceText.includes('preserve') || 
                            choiceText.includes('crystallize') || 
                            choiceText.includes('forge') ||
                            choiceText.includes('crystal form') ||
                            choiceText.includes('eternity') ||
                            choiceText.includes('forever') ||
                            choiceText.includes('merge') ||
                            choiceText.includes('channel') ||
                            choiceText.includes('eternal') ||
                            (choiceText.includes('crystal') && (choiceText.includes('form') || choiceText.includes('cave') || choiceText.includes('forever') || choiceText.includes('eternity')));
      
      if (isMintingChoice) {
        // Extract artifact ID from the action if possible
        const actionString = choice.action.toString();
        const artifactIdMatch = actionString.match(/showMintOption\((\d+)/);
        
        if (artifactIdMatch) {
          const artifactId = parseInt(artifactIdMatch[1]);
          // Only show minting option if the artifact was collected in this session and not already minted
          const wasCollected = collectedArtifacts.includes(artifactId);
          const alreadyMinted = ownedArtifactIds.includes(artifactId);
          if (!wasCollected || alreadyMinted) {
            return false;
          }
          return true;
        }
      }
      
      // Keep all non-minting choices
      return true;
    });
  };

  // Choose Your Own Adventure - Mysterious paths with wordplay
  const scenes: Record<string, any> = {
    start: {
      title: "The Crystal Cave Beckons",
      text: `Welcome, You stand before the glowing entrance of an ancient crystal cave. Strange symbols pulse with ethereal light, and multiple passages disappear into the depths. The air hums with mysterious energy. Which path calls to your soul?`,
      image: "🏔️✨",
      choices: [
        { text: "Follow the path where numbers dance in the shadows", action: () => { setCurrentScene('study'); setGameMode('quiz'); } },
        { text: "Seek the chamber where ancient wisdom whispers", action: () => { setCurrentScene('adviceQuest'); setGameMode('quiz'); } },
        { text: "Venture toward the sound of flowing water", action: () => { setCurrentScene('waterPath'); setGameMode('quiz'); } },
        { text: "Walk toward the warm glow in the distance", action: () => { setCurrentScene('firePath'); setGameMode('quiz'); } }
      ]
    },
     
     // The Chamber of Dancing Numbers
     study: {
       title: "The Chamber of Dancing Numbers",
       text: "You enter a dimly lit chamber where ancient symbols glow on the crystalline walls. The numbers seem to pulse with life, forming patterns that tease your mind. A voice echoes: 'Only through understanding the eternal dance of calculation may you proceed.'",
       image: "🧮✨",
       activity: {
         type: "math",
         question: "The symbols show a pattern: 3 × 4 + 8 ÷ 2 = ?\n(Remember order of operations!)",
         answer: "16",
         explanation: "Order of operations: 3×4=12, 8÷2=4, then 12+4=16"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         collectArtifact(0, "Ancient Map");
         setCurrentScene('study_success');
         setGameMode('path');
       }
     },
     
     study_success: {
       title: "The Path Illuminated",
       text: "The ancient symbols glow brighter, and a hidden compartment reveals itself. You've earned an ancient map! New passages have opened before you.",
       image: "🗺️✨",
       choices: [
         { text: "Preserve this map forever in crystal form", action: () => showMintOption(0, "Ancient Map") },
         { text: "Follow the map to a place where wisdom flows like water", action: () => { setCurrentScene('adviceQuest'); setGameMode('quiz'); } },
         { text: "Seek the elder who tests direction and purpose", action: () => { setCurrentScene('helpElder'); setGameMode('quiz'); } },
         { text: "Return to explore other mysteries", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },
     
     // The Sage's Sanctuary  
     adviceQuest: {
       title: "The Sage's Sanctuary",
       text: "You discover a peaceful chamber filled with floating orbs of light. An ancient sage materializes, their eyes twinkling with centuries of wisdom. 'Young seeker,' they whisper, 'answer this riddle of the heart and mind.'",
       image: "🧙‍♂️💫",
       activity: {
         type: "philosophy",
         question: "What grows stronger when shared, becomes clearer when questioned, and is most valuable when it helps others?",
         answer: "knowledge",
         explanation: "Knowledge (or wisdom/learning/understanding) grows when shared and helps others!"
       },
       onSuccess: () => {
         addStat('wisdom', 4);
         addStat('kindness', 2);
         collectArtifact(1, "Sage's Blessing");
         setCurrentScene('sage_blessing');
         setGameMode('path');
       }
     },
     
     sage_blessing: {
       title: "Blessed with Wisdom",
       text: "The sage nods approvingly and bestows upon you their blessing. You feel enlightened! More paths reveal themselves in the crystal formations.",
       image: "🙏✨",
       choices: [
         { text: "Crystallize this blessing for eternity", action: () => showMintOption(1, "Sage's Blessing") },
         { text: "Follow whispers toward flowing waters", action: () => { setCurrentScene('waterPath'); setGameMode('quiz'); } },
         { text: "Venture toward ancient mysteries of direction", action: () => { setCurrentScene('helpElder'); setGameMode('quiz'); } },
         { text: "Seek the chamber where riddles dance", action: () => { setCurrentScene('teamUp'); setGameMode('quiz'); } }
       ]
     },
     
     // The Navigator's Trial
     helpElder: {
       title: "The Navigator's Trial", 
       text: "You encounter an elderly explorer studying a mystical compass that spins wildly. 'Lost souls often lose their way,' they mutter. 'Prove you understand the ancient art of navigation.'",
       image: "🧭🗻",
       activity: {
         type: "geography",
         question: "If you're facing north and turn 90 degrees clockwise, then 180 degrees counterclockwise, which direction are you facing?\nA) North\nB) South\nC) East\nD) West",
         answer: "D",
         explanation: "North → 90° clockwise = East → 180° counterclockwise = West"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('discovery', 3);
         collectArtifact(2, "Magical Compass");
         setCurrentScene('compass_gained');
         setGameMode('path');
       }
     },
     
     compass_gained: {
       title: "The True Path Revealed",
       text: "The elder smiles and hands you a magical compass. Its needle points not north, but toward knowledge! New chambers appear in your awareness.",
       image: "🧭💫",
       choices: [
         { text: "Forge this compass into eternal crystal", action: () => showMintOption(2, "Magical Compass") },
         { text: "Follow the compass toward crystalline waters", action: () => { setCurrentScene('crystalPool'); setGameMode('quiz'); } },
         { text: "Explore the passage of ancient secrets", action: () => { setCurrentScene('secretPath'); setGameMode('quiz'); } },
         { text: "Venture where the starlight calls", action: () => { setCurrentScene('starPath'); setGameMode('quiz'); } }
       ]
     },
     
     // The Riddle Keeper's Domain
     teamUp: {
       title: "The Riddle Keeper's Domain",
       text: "A ghostly figure materializes—Marina, an ancient explorer. 'I have guarded this riddle for centuries,' she whispers. 'Solve it, and my knowledge becomes yours.'",
       image: "🗺️👻",
       activity: {
         type: "wordplay",
         question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
         answer: "map",
         explanation: "A map shows cities, mountains, and water, but not the living things within them!"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         addStat('discovery', 2);
         collectArtifact(3, "Marina's Journal");
         setCurrentScene('marina_gift');
         setGameMode('path');
       }
     },
     
     marina_gift: {
       title: "Marina's Legacy",
       text: "Marina nods approvingly and fades away, leaving behind her ancient journal. You feel her spirit guiding you toward deeper mysteries.",
       image: "📖✨",
       choices: [
         { text: "Preserve Marina's journal in crystal forever", action: () => showMintOption(3, "Marina's Journal") },
         { text: "Follow Marina's notes toward flowing depths", action: () => { setCurrentScene('waterPath'); setGameMode('quiz'); } },
         { text: "Seek the chamber where time itself bends", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Explore passages unknown", action: () => { setCurrentScene('underwaterCave'); setGameMode('quiz'); } }
       ]
     },
     
     // The River Spirit's Challenge
     waterPath: {
       title: "The River Spirit's Challenge",
       text: "You stand before a rushing underground river. A majestic water spirit rises from the depths, its voice like flowing rapids. 'Answer my question about the great rivers of the world, brave explorer.'",
       image: "🌊🌍",
       activity: {
         type: "geography",
         question: "I am the longest river system in South America, flowing through multiple countries and supporting incredible biodiversity. What am I called?\nA) Amazon River\nB) Paraná River\nC) Orinoco River\nD) Magdalena River",
         answer: "A",
         explanation: "The Amazon River is about 4,000 miles long, flowing through Peru, Colombia, and Brazil!"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('discovery', 1);
         collectArtifact(4, "Water Crystal");
         setCurrentScene('water_blessing');
         setGameMode('path');
       }
     },
     
     water_blessing: {
       title: "Blessed by Water",
       text: "The river spirit nods and gifts you a shimmering water crystal. The cavern resonates with aquatic energy, revealing hidden water passages.",
       image: "💧💎",
       choices: [
         { text: "Merge this crystal with eternal crystal cave", action: () => showMintOption(4, "Water Crystal") },
         { text: "Visit Salmonad's dimensional bakery", action: () => { setCurrentScene('salmonadBakery'); setGameMode('path'); } },
         { text: "Ride Chog's banana boat", action: () => { setCurrentScene('chogBananaBoat'); setGameMode('path'); } },
         { text: "Dive into the passage of ancient sequences", action: () => { setCurrentScene('crystalPool'); setGameMode('quiz'); } },
         { text: "Listen for the whispers of the hidden stream", action: () => { setCurrentScene('hiddenStream'); setGameMode('quiz'); } },
         { text: "Attemp a stunt with Raptor(cast) dive team", action: () => { setCurrentScene('raptorCastDeath'); setGameMode('path'); } },
         { text: "Reach Aquatic Harmony", action: () => { setCurrentScene('aquaticHarmony'); setGameMode('path'); } }
       ]
     },
     
     // The Dragon's Lair
     firePath: {
       title: "The Dragon's Lair",
       text: "You follow the warm glow into a vast chamber where ancient flames dance without fuel. A magnificent dragon materializes from the flames, its eyes gleaming with ancient wisdom. 'Mortal,' it rumbles, 'answer my riddle of the eternal flame.'",
       image: "🐲🔥",
       activity: {
         type: "wordplay",
         question: "I am not alive, but I grow; I don't have lungs, but I need air; I don't have a mouth, but water kills me. What am I?",
         answer: "fire",
         explanation: "Fire grows, needs oxygen to survive, and is extinguished by water!"
       },
       onSuccess: () => {
         addStat('courage', 3);
         collectArtifact(8, "Fire Crystal");
         setCurrentScene('dragon_blessing');
         setGameMode('path');
       }
     },
     
     dragon_blessing: {
       title: "The Dragon's Gift",
       text: "The dragon roars approvingly and breathes upon a crystal, transforming it into a fire crystal that burns with eternal warmth. 'You have proven yourself worthy,' it says. 'The deeper chambers of my domain are now open to you.',",
       image: "🔥💎",
       choices: [
         { text: "Forge this fire crystal for all eternity", action: () => showMintOption(8, "Fire Crystal") },
         { text: "Enter the trial of inner courage", action: () => { setCurrentScene('courageTrial'); setGameMode('quiz'); } },
         { text: "Sneak into the Dragon Treasure Vault", action: () => { setCurrentScene('dragonTreasureVault'); setGameMode('path'); } },
         { text: "Surf the molten lava streams", action: () => { setCurrentScene('lavaSurfDeath'); setGameMode('path'); } },
         { text: "Take a fry-cook side-gig for John W. RichKid", action: () => { setCurrentScene('fryCookMishap'); setGameMode('path'); } }
       ]
     },
     
          // The Pool of Infinite Patterns
     crystalPool: {
       title: "The Pool of Infinite Patterns",
       text: "You discover a perfectly circular pool where numbers float and dance on the surface like living entities. A voice whispers from the depths: 'Complete the eternal sequence, and claim the treasure within.'",
       image: "💧🔢",
       activity: {
         type: "math",
         question: "The water shows a sequence: 2, 6, 12, 20, 30, ? What number comes next?",
         answer: "42",
         explanation: "Each number is n(n+1): 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         collectArtifact(5, "Pattern Pearl");
         setCurrentScene('pearl_revealed');
         setGameMode('path');
       }
     },
     
     pearl_revealed: {
       title: "The Pearl of Patterns",
       text: "The pool glows brilliantly and rises, revealing a lustrous pearl that contains the mathematical secrets of the universe. You sense its power connecting all patterns in existence.",
       image: "🔮💫",
       choices: [
         { text: "Crystallize this pearl's infinite wisdom", action: () => showMintOption(5, "Pattern Pearl") },
         { text: "Follow the patterns toward prehistoric mysteries", action: () => { setCurrentScene('underwaterCave'); setGameMode('quiz'); } },
         { text: "Let the patterns guide you to hidden streams", action: () => { setCurrentScene('hiddenStream'); setGameMode('quiz'); } },
         { text: "Return to flowing waters", action: () => { setCurrentScene('water_blessing'); setGameMode('path'); } }
       ]
     },
     
     // The Trial of Inner Courage
     courageTrial: {
       title: "The Trial of Inner Courage",
       text: "The dragon leads you to a chamber filled with mirrors that reflect not your appearance, but your fears and doubts. 'True courage,' the dragon intones, 'is not about fearlessness, but about action despite fear.'",
       image: "🛡️💭",
       activity: {
         type: "philosophy",
         question: "True courage is not the absence of fear, but taking action despite fear. Can you tell me about a time when courage helped someone make a difference?\n(Any thoughtful response about courage, heroes, or standing up for what's right)",
         answer: "courage",
         explanation: "Courage means facing our fears to help others and do what's right!"
       },
       onSuccess: () => {
         addStat('courage', 4);
         addStat('kindness', 1);
         collectArtifact(9, "Courage Gem");
         setCurrentScene('courage_earned');
         setGameMode('path');
       }
     },
     
     courage_earned: {
       title: "The Heart of Courage",
       text: "The mirrors transform into windows showing acts of courage throughout history. A radiant gem materializes, pulsing with the collective bravery of all who have stood up for what's right.",
       image: "💎❤️",
       choices: [
         { text: "Preserve this courage for all who need it", action: () => showMintOption(9, "Courage Gem") },
         { text: "Channel courage toward ancient wisdom", action: () => { setCurrentScene('explorationWisdom'); setGameMode('quiz'); } },
         { text: "Brave the cosmic mystery chamber", action: () => { setCurrentScene('caveHistory'); setGameMode('quiz'); } },
         { text: "Return to the dragon's domain", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },
     
     // Missing additional scenes to complete the full adventure
     underwaterCave: {
       title: "The Prehistoric Depths",
       text: "You discover a submerged chamber where ancient marine fossils glow with ethereal light. Spirits of prehistoric creatures whisper forgotten secrets.",
       image: "🦈🏛️",
       activity: {
         type: "science",
         question: "Which of these was NOT a real prehistoric marine animal?\nA) Megalodon\nB) Dunkleosteus\nC) Leedsichthys\nD) Aquasaurus",
         answer: "D",
         explanation: "Aquasaurus is fictional! Others were real: Megalodon (giant shark), Dunkleosteus (armored fish), Leedsichthys (massive bony fish)"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('discovery', 2);
         collectArtifact(6, "Fossil Fragment");
         setCurrentScene('fossil_discovery');
         setGameMode('path');
       }
     },
     
     fossil_discovery: {
       title: "Echoes of Ancient Life",
       text: "The fossil speaks to you across millions of years, sharing its ancient memories. You've gained insight into the deep history of life itself.",
       image: "🦴✨",
       choices: [
         { text: "Preserve this fossil's memory in crystal form", action: () => showMintOption(6, "Fossil Fragment") },
         { text: "Follow the fossil's guidance to harmonic waters", action: () => { setCurrentScene('hiddenStream'); setGameMode('quiz'); } },
         { text: "Explore deeper prehistoric chambers", action: () => { setCurrentScene('caveHistory'); setGameMode('quiz'); } },
         { text: "Return to the flowing passages", action: () => { setCurrentScene('water_blessing'); setGameMode('path'); } }
       ]
     },
     
     hiddenStream: {
       title: "The Harmony of Waters",
       text: "A hidden stream flows through crystalline channels, its gentle voice speaking in riddles about the eternal flow of water through all existence.",
       image: "🌊👻",
       activity: {
         type: "wordplay",
         question: "I flow but have no legs, I roar but have no voice, I carve mountains but have no tools. What am I?",
         answer: "river",
         explanation: "Rivers flow, roar when they rush, and carve through mountains over time!"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('kindness', 2);
         collectArtifact(7, "Harmony Stone");
         setCurrentScene('harmony_achieved');
         setGameMode('path');
       }
     },
     
     harmony_achieved: {
       title: "The Balance Within",
       text: "The stream gifts you a stone that hums with perfect harmony. You feel connected to the balance of all things in nature.",
       image: "🪨🎵",
       choices: [
         { text: "Crystallize this harmony for eternity", action: () => showMintOption(7, "Harmony Stone") },
         { text: "Let harmony guide you to star passages", action: () => { setCurrentScene('starPath'); setGameMode('quiz'); } },
         { text: "Seek the ancient wisdom keepers", action: () => { setCurrentScene('ancientTest'); setGameMode('quiz'); } },
         { text: "Return to explore other mysteries", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },
     
     // Additional adventure scenes to complete the mysterious experience
     ancientTest: {
       title: "The Guardians of Lost Civilizations",
       text: "Ancient spirits of long-lost civilizations test your knowledge of their legacy. Their whispers echo with the wisdom of ages.",
       image: "📜🏛️",
       activity: {
         type: "history",
         question: "Which ancient civilization built Machu Picchu high in the Andes Mountains?\nA) Maya\nB) Aztec\nC) Inca\nD) Olmec",
         answer: "C",
         explanation: "The Inca built Machu Picchu around 1450 CE as a royal estate in the Peruvian Andes!"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         addStat('discovery', 1);
         collectArtifact(10, "Ancient Scroll");
         setCurrentScene('ancient_wisdom');
         setGameMode('path');
       }
     },
     
     ancient_wisdom: {
       title: "Legacy of the Ancients",
       text: "The spirits nod approvingly and materialize an ancient scroll containing the accumulated wisdom of lost civilizations.",
       image: "📜✨",
       choices: [
         { text: "Preserve this ancient knowledge forever", action: () => showMintOption(10, "Ancient Scroll") },
         { text: "Follow ancient paths to cosmic mysteries", action: () => { setCurrentScene('caveHistory'); setGameMode('quiz'); } },
         { text: "Seek the dragon's ultimate wisdom", action: () => { setCurrentScene('explorationWisdom'); setGameMode('quiz'); } },
         { text: "Venture toward stellar observations", action: () => { setCurrentScene('starPath'); setGameMode('quiz'); } }
       ]
     },
     
     caveHistory: {
       title: "The Cosmic Impact Chamber",
       text: "You discover the true origin of the crystal cave - a chamber formed by ancient cosmic forces. Meteoric fragments still pulse with starlight.",
       image: "☄️🌍",
       activity: {
         type: "science",
         question: "What do we call the bowl-shaped depression left by a meteor impact?\nA) Crater\nB) Canyon\nC) Cavern\nD) Crevice",
         answer: "A",
         explanation: "Craters are circular depressions formed when meteors/asteroids impact Earth's surface!"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('discovery', 3);
         collectArtifact(12, "Meteor Fragment");
         setCurrentScene('cosmic_revelation');
         setGameMode('path');
       }
     },
     
     cosmic_revelation: {
       title: "Fragment of the Stars",
       text: "A glowing meteor fragment rises from the chamber floor, still warm with cosmic energy from its journey across the universe.",
       image: "🌠💎",
       choices: [
         { text: "Crystallize this cosmic fragment", action: () => showMintOption(12, "Meteor Fragment") },
         { text: "Follow cosmic currents to stellar chambers", action: () => { setCurrentScene('starPath'); setGameMode('quiz'); } },
         { text: "Seek time's deeper mysteries", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Explore the final dragon wisdom", action: () => { setCurrentScene('explorationWisdom'); setGameMode('quiz'); } }
       ]
     },
     
     explorationWisdom: {
       title: "The Dragon's Ultimate Teaching",
       text: "The ancient dragon shares the deepest wisdom about exploration and discovery, revealing the true spirit that drives all seekers of knowledge.",
       image: "🐲🧭",
       activity: {
         type: "philosophy",
         question: "What is the most important quality an explorer must have?\nA) Physical strength\nB) Expensive equipment\nC) Curiosity and respect for learning\nD) Being fearless",
         answer: "C",
         explanation: "True exploration is driven by curiosity, respect for knowledge, and desire to understand our world!"
       },
       onSuccess: () => {
         addStat('wisdom', 5);
         addStat('discovery', 2);
         collectArtifact(11, "Dragon's Wisdom");
         setCurrentScene('dragon_wisdom');
         setGameMode('path');
       }
     },
     
     dragon_wisdom: {
       title: "The Sacred Knowledge",
       text: "The dragon bestows upon you its greatest treasure - the wisdom accumulated over millennia of watching explorers seek truth and knowledge.",
       image: "🐉📚",
       choices: [
         { text: "Crystallize this sacred wisdom", action: () => showMintOption(11, "Dragon's Wisdom") },
         { text: "Ascend to the stellar observatory", action: () => { setCurrentScene('starPath'); setGameMode('quiz'); } },
         { text: "Venture to secret knowledge chambers", action: () => { setCurrentScene('secretPath'); setGameMode('quiz'); } },
         { text: "Journey to the final cosmic mysteries", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } }
       ]
     },
     
          starPath: {
       title: "The Celestial Observatory",
       text: "You ascend to a chamber that opens to the cosmos itself. Ancient star charts float in the air, revealing the mysteries of distant worlds.",
       image: "🪐🌙",
       activity: {
         type: "astronomy",
         question: "Which planet in our solar system has the most moons?\nA) Jupiter\nB) Saturn\nC) Neptune\nD) Uranus",
         answer: "B",
         explanation: "Saturn has over 80 confirmed moons, more than any other planet!"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         addStat('discovery', 2);
         collectArtifact(13, "Star Map");
         setCurrentScene('star_map_earned');
         setGameMode('path');
       }
     },
     
     star_map_earned: {
       title: "The Stellar Cartographer's Gift",
       text: "The cosmos reveals its secrets as a luminous star map materializes, showing pathways between distant worlds and dimensions.",
       image: "🗺️⭐",
       choices: [
         { text: "Crystallize this cosmic map forever", action: () => showMintOption(13, "Star Map") },
         { text: "Follow stellar paths to planetary mysteries", action: () => { setCurrentScene('solarSystem'); setGameMode('quiz'); } },
         { text: "Venture toward galactic knowledge", action: () => { setCurrentScene('galaxyQuest'); setGameMode('quiz'); } },
         { text: "Seek the deepest cosmic truths", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Attempt to surf a super-nova shockwave", action: () => { setCurrentScene('supernovaSurfDeath'); setGameMode('path'); } }
       ]
     },
     
     solarSystem: {
       title: "The Planetary Dance",
       text: "You witness the celestial dance of planets, each spinning with unique properties that tell stories of cosmic formation.",
       image: "🌍🔄",
       activity: {
         type: "astronomy",
         question: "Which planet rotates on its side, making it unique in our solar system?\nA) Mars\nB) Venus\nC) Uranus\nD) Neptune",
         answer: "C",
         explanation: "Uranus rotates at a 98-degree angle, possibly due to an ancient collision!"
       },
       onSuccess: () => {
         addStat('wisdom', 2);
         addStat('discovery', 3);
         collectArtifact(14, "Planetary Badge");
         setCurrentScene('planetary_wisdom');
         setGameMode('path');
       }
     },
     
     planetary_wisdom: {
       title: "Badge of Celestial Understanding",
       text: "A badge materializes, inscribed with the orbital patterns of all planets. You now carry the wisdom of planetary motion.",
       image: "🏅🪐",
       choices: [
         { text: "Preserve this planetary knowledge", action: () => showMintOption(14, "Planetary Badge") },
         { text: "Expand vision to galactic scales", action: () => { setCurrentScene('galaxyQuest'); setGameMode('quiz'); } },
         { text: "Journey through the corridors of time", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Discover the ultimate cosmic secret", action: () => { setCurrentScene('secretPath'); setGameMode('quiz'); } },
         { text: "Enter the Cosmic Harmony Sanctum", action: () => { setCurrentScene('cosmicHarmonySanctum'); setGameMode('path'); } }
       ]
     },
     
     galaxyQuest: {
       title: "The Galactic Revelation",
       text: "The chamber expands to reveal the Milky Way in all its glory. Billions of stars swirl around you as cosmic wisdom fills your consciousness.",
       image: "🌌⭐",
       activity: {
         type: "astronomy",
         question: "What do we call our home galaxy?\nA) Andromeda Galaxy\nB) Milky Way Galaxy\nC) Whirlpool Galaxy\nD) Sombrero Galaxy",
         answer: "B",
         explanation: "The Milky Way Galaxy contains over 100 billion stars!"
       },
       onSuccess: () => {
         addStat('wisdom', 3);
         addStat('discovery', 4);
         collectArtifact(15, "Galaxy Map");
         setCurrentScene('galactic_map');
         setGameMode('path');
       }
     },
     
     galactic_map: {
       title: "Navigator of the Infinite",
       text: "A complete map of the galaxy forms before you, showing the spiral arms and the location of countless worlds waiting to be explored.",
       image: "🗺️🌌",
       choices: [
         { text: "Crystallize this galactic knowledge", action: () => showMintOption(15, "Galaxy Map") },
         { text: "Explore the mysteries of time itself", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Seek the ultimate repository of knowledge", action: () => { setCurrentScene('secretPath'); setGameMode('quiz'); } },
         { text: "Journey to tranquil dimensional passages", action: () => { setCurrentScene('tranquilPassage'); setGameMode('quiz'); } },
         { text: "Attempt a Raptor(cast) meteor ride", action: () => { setCurrentScene('raptorMeteorDeath'); setGameMode('path'); } }
       ]
     },
     
     timeQuest: {
       title: "The Temporal Observatory",
       text: "Time itself becomes visible in this chamber. You witness the flow of cosmic events as light streams across the universe.",
       image: "⚡🌟",
       activity: {
         type: "science",
         question: "How long does it take light from the Sun to reach Earth?\nA) 8 seconds\nB) 8 minutes\nC) 8 hours\nD) 8 days",
         answer: "B",
         explanation: "Light takes about 8 minutes and 20 seconds to travel from the Sun to Earth!"
       },
       onSuccess: () => {
         addStat('wisdom', 4);
         addStat('discovery', 3);
         collectArtifact(16, "Time Crystal");
         setCurrentScene('time_crystal_earned');
         setGameMode('path');
       }
     },
     
     time_crystal_earned: {
       title: "Master of Temporal Wisdom",
       text: "A crystal forms that contains the very essence of time - past, present, and future swirl within its faceted depths.",
       image: "💎⏰",
       choices: [
         { text: "Preserve this temporal essence forever", action: () => showMintOption(16, "Time Crystal") },
         { text: "Use time's wisdom to find ultimate knowledge", action: () => { setCurrentScene('secretPath'); setGameMode('quiz'); } },
         { text: "Journey to the deepest dimensional realms", action: () => { setCurrentScene('tranquilPassage'); setGameMode('quiz'); } },
         { text: "Return to explore remaining mysteries", action: () => { setCurrentScene('start'); setGameMode('path'); } },
         { text: "Volunteer for a Monanimal space launch", action: () => { setCurrentScene('failedMonanimalLaunch'); setGameMode('path'); } }
       ]
     },
     
     secretPath: {
       title: "The Ultimate Repository",
       text: "You discover the greatest secret - a hidden chamber containing the crystallized knowledge of all civilizations, guarded by ancient wisdom.",
       image: "📚🏛️",
       activity: {
         type: "history",
         question: "Which ancient wonder of the world was located in Alexandria and contained countless scrolls of knowledge?\nA) The Colossus of Rhodes\nB) The Library of Alexandria\nC) The Lighthouse of Alexandria\nD) The Hanging Gardens",
         answer: "B",
         explanation: "The Library of Alexandria was one of the largest and most significant libraries of the ancient world!"
       },
       onSuccess: () => {
         addStat('wisdom', 5);
         addStat('discovery', 2);
         collectArtifact(17, "Master Crystal");
         setCurrentScene('master_crystal');
         setGameMode('path');
       }
     },
     
     master_crystal: {
       title: "The Crown of Wisdom",
       text: "The ultimate crystal materializes - the Master Crystal that contains the essence of all knowledge ever discovered. You have proven yourself a true seeker of wisdom.",
       image: "👑💎",
       choices: [
         { text: "Crystallize this ultimate achievement", action: () => showMintOption(17, "Master Crystal") },
         { text: "Explore the peaceful dimensional passages", action: () => { setCurrentScene('tranquilPassage'); setGameMode('quiz'); } },
         { text: "Journey to mysterious depths", action: () => { setCurrentScene('mysteriousDepths'); setGameMode('quiz'); } },
         { text: "Seek the interdimensional currents", action: () => { setCurrentScene('upstreamCurrent'); setGameMode('quiz'); } }
       ]
     },
     
     // Monanimal Paths - Dimensional Beings
     tranquilPassage: {
       title: "The Serenity Dimension",
       text: "You enter a peaceful dimension where a serene Monanimal floats in eternal tranquility, radiating calm and mindfulness.",
       image: "🦆💙",
       activity: {
         type: "philosophy",
         question: "In the chaos of adventure, what brings the deepest peace?\nA) Victory over enemies\nB) Finding treasure\nC) Inner tranquility and mindfulness\nD) Being the strongest",
         answer: "C",
         explanation: "True peace comes from within, through mindfulness and tranquility!"
       },
       onSuccess: () => {
         addStat('kindness', 4);
         addStat('wisdom', 1);
         collectArtifact(18, "Chill Dak");
         setCurrentScene('chill_dak_blessing');
         setGameMode('path');
       }
     },
     
     chill_dak_blessing: {
       title: "The Gift of Tranquility",
       text: "The Chill Dak shares its essence of peace, teaching you that true strength comes from inner calm and serenity.",
       image: "🦆✨",
       choices: [
         { text: "Crystallize this peaceful wisdom", action: () => showMintOption(18, "Chill Dak") },
         { text: "Dive into the mysterious oceanic depths", action: () => { setCurrentScene('mysteriousDepths'); setGameMode('quiz'); } },
         { text: "Journey through dimensional currents", action: () => { setCurrentScene('upstreamCurrent'); setGameMode('quiz'); } },
         { text: "Seek the final realm of forgotten memories", action: () => { setCurrentScene('forgottenRealm'); setGameMode('quiz'); } }
       ]
     },
     
     mysteriousDepths: {
       title: "The Oceanic Intelligence",
       text: "In the deepest dimensional waters, you encounter an ancient Monanimal of profound intelligence, its tentacles glowing with accumulated wisdom.",
       image: "🐙✨",
       activity: {
         type: "science",
         question: "Octopi are incredibly intelligent creatures. How many hearts does an octopus have?\nA) 1\nB) 2\nC) 3\nD) 4",
         answer: "C",
         explanation: "Octopi have 3 hearts - two pump blood to the gills, one pumps to the rest of the body!"
       },
       onSuccess: () => {
         addStat('wisdom', 4);
         addStat('discovery', 2);
         collectArtifact(19, "Moyaki");
         setCurrentScene('moyaki_wisdom');
         setGameMode('path');
       }
     },
     
     moyaki_wisdom: {
       title: "The Deep Intelligence",
       text: "The Moyaki shares its vast oceanic intelligence, revealing the interconnected nature of all knowledge and the importance of multiple perspectives.",
       image: "🐙🧠",
       choices: [
         { text: "Preserve this deep wisdom", action: () => showMintOption(19, "Moyaki") },
         { text: "Follow the currents of determination", action: () => { setCurrentScene('upstreamCurrent'); setGameMode('quiz'); } },
         { text: "Explore the realm of ancient memories", action: () => { setCurrentScene('forgottenRealm'); setGameMode('quiz'); } },
         { text: "Return to the tranquil passages", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },
     
     upstreamCurrent: {
       title: "The Dimensional Navigator",
       text: "A magnificent salmon-like Monanimal swims through streams of starlight, embodying the determination to reach any destination.",
       image: "🐟🌌",
       activity: {
         type: "science",
         question: "Salmon are famous for swimming upstream. What guides them back to their birthplace?\nA) Following other fish\nB) Magnetic fields and scent memory\nC) Pure luck\nD) Human guidance",
         answer: "B",
         explanation: "Salmon use Earth's magnetic fields and their incredible sense of smell to navigate home!"
       },
       onSuccess: () => {
         addStat('discovery', 5);
         addStat('courage', 2);
         collectArtifact(20, "Salmonad");
         setCurrentScene('salmonad_journey');
         setGameMode('path');
       }
     },
     
     salmonad_journey: {
       title: "The Spirit of Determination",
       text: "The Salmonad imparts the wisdom of navigation and determination, teaching you that any goal can be reached with persistence and the right guidance.",
       image: "🐟💫",
       choices: [
         { text: "Crystallize this navigational wisdom", action: () => showMintOption(20, "Salmonad") },
         { text: "Journey to the final realm of memories", action: () => { setCurrentScene('forgottenRealm'); setGameMode('quiz'); } },
         { text: "Return to peaceful tranquil waters", action: () => { setCurrentScene('tranquilPassage'); setGameMode('quiz'); } },
         { text: "Explore the final mysteries of the forgotten realm", action: () => { setCurrentScene('forgottenRealm'); setGameMode('quiz'); } }
       ]
     },
     
     forgottenRealm: {
       title: "The Keeper of Lost Memories",
       text: "In the deepest forgotten realm, you meet an ancient Monanimal that holds the memories of all civilizations that have been lost to time.",
       image: "🐷💀",
       activity: {
         type: "philosophy",
         question: "What is the most important thing we can learn from civilizations that have been forgotten by time?\nA) How to avoid their mistakes\nB) Their technological secrets\nC) That all knowledge and wisdom should be preserved and shared\nD) How to find their treasures",
         answer: "C",
         explanation: "The greatest lesson is that knowledge and wisdom must be preserved and shared to benefit all!"
       },
       onSuccess: () => {
         addStat('wisdom', 6);
         addStat('kindness', 1);
         collectArtifact(21, "Dead Chog");
         setCurrentScene('final_wisdom');
         setGameMode('path');
       }
     },
     
     final_wisdom: {
       title: "The Ultimate Memory Keeper",
       text: "The Dead Chog bestows upon you the final wisdom - the understanding that all knowledge and all memories matter, and must be preserved for future generations. You have completed your journey through all realms of the Crystal Cave.",
       image: "🐷👑",
       choices: [
         { text: "Crystallize this ultimate memory", action: () => showMintOption(21, "Dead Chog") },
         { text: "Return to the beginning with new wisdom", action: () => { setCurrentScene('start'); setGameMode('path'); } },
         { text: "Explore any remaining mysteries", action: () => { setCurrentScene('start'); setGameMode('path'); } },
         // Legendary unlocks: Only show if all Monanimal artifacts (18-21) are collected and legendary not yet collected
         ...(collectedArtifacts.includes(18) && collectedArtifacts.includes(19) && collectedArtifacts.includes(20) && collectedArtifacts.includes(21) && !collectedArtifacts.includes(22) ? [
           { text: "Unlock the Ancient Tomb of Puzzles (Legendary)", action: () => { setCurrentScene('ancientTomb'); setGameMode('quiz'); } }
         ] : []),
         ...(collectedArtifacts.includes(18) && collectedArtifacts.includes(19) && collectedArtifacts.includes(20) && collectedArtifacts.includes(21) && !collectedArtifacts.includes(23) ? [
           { text: "Venture into the Mind Cavern of Overthinking (Legendary)", action: () => { setCurrentScene('mindCavern'); setGameMode('quiz'); } }
         ] : [])
       ]
     },
     trueEnding: {
       title: "The Crystal Convergence",
       text: "As you gather the final artifact, the cave erupts in a symphony of light. All 22 crystals resonate in harmony, revealing the ultimate secret: true wisdom, courage, and kindness are found in the journey, not just the destination. You are now the Keeper of the Crystal Cave!",
       image: "🌌💎👑",
       renderSummary: true, // Custom flag to trigger summary rendering in JSX
       choices: [
         { text: "Replay the adventure and discover new secrets!", action: handleReplay }
       ]
     },
     wisdomSanctum: {
       title: "Sanctum of Infinite Thought",
       text: "You enter a chamber where thoughts swirl like galaxies. Here, the greatest minds of all ages share their secrets. Your wisdom is celebrated among legends.",
       image: "🌠💎",
       choices: [
         { text: "Return to the adventure", action: () => { setCurrentScene('sage_blessing'); setGameMode('path'); } }
       ]
     },
     courageSanctum: {
       title: "Hall of Unyielding Hearts",
       text: "A grand hall filled with the echoes of heroes past. Statues of legendary figures line the walls, and your name is etched among them for your unmatched courage.",
       image: "🦁🏛️",
       choices: [
         { text: "Return to the adventure", action: () => { setCurrentScene('courage_earned'); setGameMode('path'); } }
       ]
     },
     kindnessSanctum: {
       title: "Sanctuary of Gentle Souls",
       text: "A peaceful garden where kindness flows like a gentle stream. The spirits of those you've helped gather to thank you, and flowers bloom in your honor.",
       image: "🌸💖",
       choices: [
         { text: "Return to the adventure", action: () => { setCurrentScene('harmony_achieved'); setGameMode('path'); } }
       ]
     },
     // Comedic death – grease fire
     fryCookMishap: {
       title: "Grease Fire Gourmet",
       text: "John W. RichKid, flamboyant investor extraordinaire, offers you a quick fortune if you can run his cave-side fry station. Unfortunately, the combination of dragon fire oil and unregulated parallel execution of fryers turns the kitchen into a literal firestorm. You slip on molten grease and the last thing you see is RichKid counting insurance payouts.\n\n💀 You have perished in a spectacular culinary catastrophe!",
       image: "🍟��💸",
       choices: [
         { text: "Return to Cave Entrance", action: () => { handleReplay(); } }
       ]
     },
     // === Numbers Dance additional endings ===
     sequenceShrine: {
       title: "Shrine of Perfect Sequences",
       text: "The chamber walls shimmer with numeric sigils forming an endless cascade of perfect sequences. Completing the final pattern earns you the revered Pattern Pearl!",
       image: "��🛕",
       choices: [
         { text: "Embrace the Pattern Pearl", action: () => showMintOption(5, "Pattern Pearl") },
         { text: "Consult the Council of Claire", action: () => { setCurrentScene('councilClaire'); setGameMode('path'); } },
         { text: "Return to the entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     councilClaire: {
       title: "Council of Claire",
       text: "You find Claire (renowned in Monad lore) debating algorithmic complexity with holographic scholars. After a rigorous exchange you gain +2 wisdom and a clearer path forward.",
       image: "👩‍��📚",
       choices: [
         { text: "Seek Fibonacci Spiral with Molandak", action: () => { setCurrentScene('fibonacciShrine'); setGameMode('path'); } },
         { text: "Attempt risky optimisation with Professor Loopwell", action: () => { setCurrentScene('infiniteLoopDeath'); setGameMode('path'); } }
       ]
     },

     infiniteLoopDeath: {
       title: "Infinite Loop of RichKid™",
       text: "Professor Loopwell convinces you to squeeze infinite profit from an infinite loop. Unfortunately the cave's Parallel Execution court declares you a shit-poster, sentencing you to eternal spin.",
       image: "🔄💀",
       choices: [ { text: "Start Over", action: () => { handleReplay(); } } ]
     },

     sharkTankDeath: {
       title: "Shark Tank Smack-down",
       text: "You pitch your 'Calc-Coin' on Shark Tank to Benads & Port. Moments later the floor gives way to an actual shark pool. At least RayJ got good footage.",
       image: "🦈📉",
       choices: [ { text: "Respawn at Cave Entrance", action: () => { handleReplay(); } } ]
     },

     fibonacciShrine: {
       title: "Fibonacci Spiral with Molandak",
       text: "Molandak demonstrates cosmic patterns in a glowing spiral. Insight floods your mind; you earn +1 discovery and feel the cave beckon you deeper.",
       image: "🌀✨",
       choices: [
         { text: "Face failed Monanimal flask", action: () => { setCurrentScene('failedFlaskDeath'); setGameMode('path'); } },
         { text: "Proceed to Ascension", action: () => { setCurrentScene('ascensionSage'); setGameMode('path'); } }
       ]
     },

     failedFlaskDeath: {
       title: "Failed Monanimal Flask",
       text: "A cryptic Mokadel offers you a drink labelled 'kadal ksksksks'. You morph into an Unnamed Furry Animal in Hat and promptly explode in purple confetti.",
       image: "🧪💜💀",
       choices: [ { text: "Back to Start", action: () => { handleReplay(); } } ]
     },

     ascensionSage: {
       title: "Ascension to Sage",
       text: "Having mastered the numbers, the cave crowns you Sage of Calculation. A secret door opens toward the Wisdom Sanctum and the true ending.",
       image: "👑🔢",
       choices: [
         { text: "Enter Wisdom Sanctum", action: () => { setCurrentScene('wisdomSanctum'); setGameMode('path'); } },
         { text: "Return to Entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     salmonadBakery: {
       title: "Salmonad's Dimensional Bakery",
       text: "You help Salmonad bake streams of starlight-infused bread, learning the power of persistence upstream. The fish-like Monanimal gifts you a scale of determination (+1 courage).",
       image: "🐟🥖✨",
       choices: [
         { text: "Ride the bakery raft downstream", action: () => { setCurrentScene('chogBananaBoat'); setGameMode('path'); } },
         { text: "Return to water passages", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     chogBananaBoat: {
       title: "Chog's Banana Boat",
       text: "Chog appears in a banana costume, offering you a ride. Mid-journey he drops cryptic lore about Monald and vanishes, leaving you wiser (+1 discovery).",
       image: "🍌🐱",
       choices: [
         { text: "Dock at hidden stream", action: () => { setCurrentScene('hiddenStream'); setGameMode('quiz'); } },
         { text: "Attempt dangerous fry-cook gig for John W. RichKid", action: () => { setCurrentScene('waterFryCookDeath'); setGameMode('path'); } }
       ]
     },

     waterFryCookDeath: {
       title: "Grease Fire Tsunami",
       text: "John W. RichKid installs a floating fry station. Hot oil meets river rapids; a fiery tsunami engulfs you. 💀",
       image: "🔥��💀",
       choices: [ { text: "Restart at Entrance", action: () => { handleReplay(); } } ]
     },

     raptorCastDeath: {
       title: "Raptor(cast) Dive Show",
       text: "You volunteer for the famous Raptor(cast) aquatics stunt team. Mid-flip, a hungry raptor barrel-rolls into your lane. Snap! 💀",
       image: "🦖💦💀",
       choices: [ { text: "Respawn at Cave Entrance", action: () => { handleReplay(); } } ]
     },

     aquaticHarmony: {
       title: "Aquatic Harmony",
       text: "Having balanced the flows of courage, kindness, and wisdom within the waters, you are welcomed into the Sanctuary of Gentle Souls.",
       image: "💧🕊️",
       choices: [
         { text: "Enter Kindness Sanctum", action: () => { setCurrentScene('kindnessSanctum'); setGameMode('path'); } },
         { text: "Return to entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     sharkTankRoast: {
       title: "Shark Tank Roast",
       text: "Benads, Port, and John W. RichKid sit upon crystal thrones. Your Calc-Coin pitch is so abysmal that actual sharks are summoned from molten lava to deliver feedback. 💀",
       image: "🦈🔥💀",
       choices: [ { text: "Restart Adventure", action: () => { handleReplay(); } } ]
     },

     parallelExecutionDeath: {
       title: "Parallel Execution Tribunal",
       text: "A dragon jury finds you guilty of excessive shit-posting. Sentence: Parallel Execution. Twelve fiery clones of you are incinerated simultaneously. 💀",
       image: "🐲⚖️💀",
       choices: [ { text: "Return to Cave Entrance", action: () => { handleReplay(); } } ]
     },

     /* === New Dragon-Flame additional scenes === */
     lavaSurfDeath: {
       title: "Lava Surf Wipe-out",
       text: "You grab a crystal surfboard and ride molten lava waves. One mistimed carve and you're swallowed by a geyser of magma. 💀",
       image: "🌋🏄‍♂️💀",
       choices: [ { text: "Respawn at Cave Entrance", action: () => { handleReplay(); } } ]
     },

     dragonTreasureVault: {
       title: "Dragon Treasure Vault",
       text: "Glittering gems tower around you. With the dragon distracted, you pocket a courage-infused ruby (+1 courage) before alarms flare!",
       image: "💰🐲",
       choices: [
         { text: "Escape with the ruby (+1 courage)", action: () => { addStat('courage',1); setCurrentScene('courage_earned'); setGameMode('path'); } },
         { text: "Pitch Calc-Coin on Shark Tank anyway", action: () => { setCurrentScene('sharkTankRoast'); setGameMode('path'); } },
         { text: "Return to Entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     /* === New Star-Voyage additional scenes === */
     supernovaSurfDeath: {
       title: "Super-Nova Surfing Mishap",
       text: "You attempt to ride the shock-wave of an exploding star. The board disintegrates… so do you. 💀",
       image: "☄️🏄‍♀️💀",
       choices: [ { text: "Start Over", action: () => { handleReplay(); } } ]
     },

     cosmicHarmonySanctum: {
       title: "Cosmic Harmony Sanctum",
       text: "A celestial choir resonates through your soul. You feel an overwhelming kindness flood the universe (+1 kindness).",
       image: "🎶🌠",
       choices: [
         { text: "Bask a moment then continue", action: () => { addStat('kindness',1); setCurrentScene('galactic_map'); setGameMode('path'); } },
         { text: "Return to Entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },

     // === Star-Voyage comedic endings ===
     raptorMeteorDeath: {
       title: "Raptor(cast) Meteor Show",
       text: "You hitch a ride on a meteor only to collide with the airborne Raptor(cast) troop. The last thing you hear is a screeching aria before darkness. 💀",
       image: "🦖☄️💀",
       choices: [ { text: "Respawn at Entrance", action: () => { handleReplay(); } } ]
     },

     failedMonanimalLaunch: {
       title: "Failed Monanimal Space Launch",
       text: "Monrilla insists on launching his phone to orbit. You volunteer to help; the rocket explodes in a glitter of purple gorilla memes. 💀",
       image: "🚀💜💀",
       choices: [ { text: "Start Over", action: () => { handleReplay(); } } ]
     },

     astralConvergence: {
       title: "Astral Convergence",
       text: "The stars align and you feel the universe breathe. A portal to the Time Crystal chamber opens.",
       image: "🌌✨",
       choices: [
         { text: "Enter the Temporal Observatory", action: () => { setCurrentScene('timeQuest'); setGameMode('quiz'); } },
         { text: "Return to Entrance", action: () => { setCurrentScene('start'); setGameMode('path'); } }
       ]
     },
  };

  /* =====================================================================
     Utility Components & Handlers added after scenes definition
  ====================================================================== */

  // Simple quiz/activity renderer to replace the removed standalone component
  interface Activity {
    type: string;
    question: string;
    answer: string;
    explanation?: string;
  }
  interface ActivityProps {
    activity: Activity;
    onSuccess: () => void;
  }
  const ActivityComponent: React.FC<ActivityProps> = ({ activity, onSuccess }) => {
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const normalizedCorrect = activity.answer.trim().toLowerCase();
      const normalizedUser = userAnswer.trim().toLowerCase();
      if (normalizedUser === normalizedCorrect || levenshtein(normalizedUser, normalizedCorrect) <= 1) {
        setFeedback('✅ Correct!');
        onSuccess();
      } else {
        setFeedback('❌ Try again!');
      }
    };
    return (
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 max-w-xl mx-auto">
        <label className="text-lg font-medium text-center whitespace-pre-line" htmlFor="activity-input">
          {activity.question}
        </label>
        <input
          id="activity-input"
          type="text"
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          className="border rounded p-2 w-full text-gray-800"
          placeholder="Type your answer here"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
          Submit
        </button>
        {feedback && <p className="text-center mt-2">{feedback}</p>}
        {feedback && feedback.startsWith('✅') && activity.explanation && (
          <p className="text-sm text-gray-600 mt-1">{activity.explanation}</p>
        )}
      </form>
    );
  };

  // Basic swipe navigation helpers (left = next choice, right = previous screen)
  const goToNextScene = () => {
    const current = scenes[currentScene];
    if (!current || !current.choices || current.choices.length === 0) return;
    const filtered = filterChoicesForOwnedArtifacts(current.choices);
    if (filtered.length > 0 && typeof filtered[0].action === 'function') {
      filtered[0].action();
    }
  };
  const goToPrevScene = () => {
    handleGoBack();
  };

  // ---------------------------------------------------------------------

  // Touch event handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchEndX.current - touchStartX.current;
      if (Math.abs(dx) > 60) { // Only trigger if swipe is significant
        if (dx < 0) {
          goToNextScene(); // Swipe left
        } else {
          goToPrevScene(); // Swipe right
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Wallet/account detection and artifact fetching on load and account change
  useEffect(() => {
    const detectAndFetch = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setIsWalletConnected(true);
            // Fetch artifacts for the connected account
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_CONFIG.address, [
              'function getUserArtifacts(address user) external view returns (uint256[] memory)'
            ], provider);
            const ids = await contract.getUserArtifacts(accounts[0]);
            setOwnedArtifactIds(ids.map(Number));
          } else {
            setIsWalletConnected(false);
            setOwnedArtifactIds([]);
          }
        } catch (err) {
          setIsWalletConnected(false);
          setOwnedArtifactIds([]);
        }
      } else {
        setIsWalletConnected(false);
        setOwnedArtifactIds([]);
      }
    };
    detectAndFetch();
    // Listen for wallet/account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', detectAndFetch);
      window.ethereum.on('chainChanged', detectAndFetch);
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', detectAndFetch);
          window.ethereum.removeListener('chainChanged', detectAndFetch);
        }
      };
    }
  }, []);

  // In the main component, useEffect to track sanctum visits
  useEffect(() => {
    if (currentScene === 'wisdomSanctum' && !visitedSanctums.wisdom) {
      setVisitedSanctums(prev => ({ ...prev, wisdom: true }));
    }
    if (currentScene === 'courageSanctum' && !visitedSanctums.courage) {
      setVisitedSanctums(prev => ({ ...prev, courage: true }));
    }
    if (currentScene === 'kindnessSanctum' && !visitedSanctums.kindness) {
      setVisitedSanctums(prev => ({ ...prev, kindness: true }));
    }
  }, [currentScene, visitedSanctums.wisdom, visitedSanctums.courage, visitedSanctums.kindness]);

  // Animate scene transitions
  useEffect(() => {
    if (prevSceneRef.current !== currentScene) {
      setSceneTransition('exit');
      setTimeout(() => {
        setSceneTransition('enter');
        setTimeout(() => setSceneTransition(''), 500);
      }, 500);
      prevSceneRef.current = currentScene;
    }
  }, [currentScene]);

  // Save progress on relevant state changes
  useEffect(() => {
    saveProgress({
      collectedArtifacts,
      ownedArtifactIds,
      playerStats,
      currentScene,
      gameMode,
      visitedSanctums,
      playerName
    });
  }, [collectedArtifacts, ownedArtifactIds, playerStats, currentScene, gameMode, visitedSanctums, playerName]);

  // Reset progress handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleResetProgress = () => {
    clearProgress();
    setCollectedArtifacts([]);
    setOwnedArtifactIds([]);
    setPlayerStats({ wisdom: 0, courage: 0, kindness: 0, discovery: 0 });
    setCurrentScene('start');
    setGameMode('path');
    setVisitedSanctums({ wisdom: false, courage: false, kindness: false });
    setPlayerName('');
  };

  const currentSceneData = scenes[currentScene];

  // ... after useState hooks ...
  const saveKey = 'crystalCaveProgress';
  const saveProgress = (state: any) => {
    localStorage.setItem(saveKey, JSON.stringify(state));
  };
  const clearProgress = () => {
    localStorage.removeItem(saveKey);
  };
  // ... existing code ...

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Modern toggle switch component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const DarkModeToggle = () => (
    <button
      className={`dark-toggle${darkMode ? ' active' : ''}`}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setDarkMode(dm => !dm)}
    >
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="sr-only">Toggle dark mode</span>
    </button>
  );

  // Sticky bottom nav for mobile
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const StickyBottomNav = () => (
    <nav className="sticky-bottom-nav" aria-label="Quick navigation">
      <button className="nav-btn" aria-label="Go to main menu" onClick={() => setCurrentScene('start')}><Home /></button>
      <button className="nav-btn" aria-label="Scroll to stats" onClick={() => document.querySelector('.elongated-stats-bar')?.scrollIntoView({ behavior: 'smooth' })}><Star /></button>
      <button className="nav-btn" aria-label="Scroll to inventory" onClick={() => document.querySelector('.stats-artifact-cards')?.scrollIntoView({ behavior: 'smooth' })}><List /></button>
      <button className="nav-btn" aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setDarkMode(dm => !dm)}>{darkMode ? <Sun /> : <Moon />}</button>
    </nav>
  );

  const [showWelcome, setShowWelcome] = useState(true);
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem('walletAddress') || '');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handleSaveUsername = () => {
    if (username.trim()) {
      localStorage.setItem('username', username.trim());
      setPlayerName(username.trim());
    }
    if (walletAddress) setShowWelcome(false);
  };
  const handleConnectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        localStorage.setItem('walletAddress', accounts[0]);
        if (username) setShowWelcome(false);
      } catch (err) { /* handle error */ }
    }
  }, [username]);
  const handleDisconnectWallet = () => {
    setWalletAddress('');
    localStorage.removeItem('walletAddress');
    setShowWelcome(true);
  };

  // ... after detectAndFetch useEffect ...
  // Re-verify ownership when reward screen appears to avoid duplicate mint offers
  useEffect(() => {
    const recheckOwnership = async () => {
      if (!showArtifactReward || !isWalletConnected) return;
      if (typeof window.ethereum === 'undefined') return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_CONFIG.address, [
          'function userOwnsArtifact(address user, uint256 artifactId) external view returns (bool)'
        ], provider);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        const owns = await contract.userOwnsArtifact(account, showArtifactReward.id);
        if (owns && !ownedArtifactIds.includes(showArtifactReward.id)) {
          setOwnedArtifactIds(prev => [...prev, showArtifactReward.id]);
        }
      } catch (err) {
        console.warn('Ownership recheck failed', err);
      }
    };
    recheckOwnership();
  }, [showArtifactReward, isWalletConnected, ownedArtifactIds]);
  // ... existing code ...

  if (showWelcome) {
    return (
      <div className="welcome-modal universal-bg">
        <h1>Welcome to the Crystal Cave Adventure!</h1>
        <p>Please enter your username and connect your wallet to start the exploring extravaganza!</p>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Enter your username"
          className="welcome-input"
          aria-label="Username"
        />
        <button onClick={handleSaveUsername} disabled={!username.trim()} className="welcome-btn">
          {localStorage.getItem('username') ? 'Continue' : 'Save Name'}
        </button>
        {walletAddress ? (
          <div className="wallet-info">
            <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <button onClick={handleDisconnectWallet} className="welcome-btn">Disconnect Wallet</button>
          </div>
        ) : (
          <button onClick={handleConnectWallet} className="welcome-btn">Connect Wallet</button>
        )}
      </div>
    );
  }

  return (
    <>
    <main
      className="main-bg flex flex-col min-h-screen"
      ref={mainContainerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={-1}
      aria-label="Crystal Cave Adventure Main Area"
    >
      {/* Main Game Card */}
      <div className="main-game-card mx-auto mt-8 mb-0 universal-bg">
        {/* Main game content restored here */}
        {/* Display Mode 1: Path Selection Options */}
        {gameMode === 'path' && currentSceneData && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentSceneData.image}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentSceneData.title}</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {currentSceneData.text}
              </p>
            </div>
            {currentSceneData.choices && (
              <div className="flex flex-col gap-3 max-w-4xl mx-auto items-center justify-center" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex', width: '100%', flexDirection: 'column' }}>
                {filterChoicesForOwnedArtifacts(currentSceneData.choices)
                  .slice(0, 5) // enforce a maximum of 5 choices per screen
                  .map((choice: any, index: number) => (
                    <button
                      key={index}
                      className="choice-btn"
                      aria-label={`Choose: ${choice.text}`}
                      onClick={choice.action}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && choice.action()}
                      /* Styles now in App.css for mobile responsiveness */
                    >
                      {choice.text}
                    </button>
                  ))}
              </div>
            )}
          </>
        )}
        {/* Display Mode 2: Quiz Interface */}
        {gameMode === 'quiz' && currentSceneData && currentSceneData.activity && (
          <>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{currentSceneData.image}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentSceneData.title}</h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                {currentSceneData.text}
              </p>
            </div>
            <ActivityComponent 
              activity={currentSceneData.activity} 
              onSuccess={currentSceneData.onSuccess}
            />
            <div className="text-center mt-4">
              <button
                onClick={handleGoBack}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm"
              >
                ← Previous Screen
              </button>
            </div>
          </>
        )}
        {/* Display Mode 3: Continue Prompt */}
        {gameMode === 'continue' && showArtifactReward && (
          <div className="text-center">
            <div className="text-6xl mb-4">🔥🧠</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">The Forge of Elemental Wisdom</h2>
            <p className="text-lg text-gray-600 mb-6">
              Fire and knowledge combine in this sacred space. The phoenix has blessed you with a powerful artifact.
            </p>
            <button
              onClick={handleContinue}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              → Forge the {showArtifactReward.name}
            </button>
          </div>
        )}
        {/* Display Mode 4: Artifact Reward + Mint Option */}
        {gameMode === 'reward' && showArtifactReward && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏆✨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ancient Artifact Discovered!</h2>
            <p className="text-lg text-gray-600 mb-6">
              You've earned the <strong>{showArtifactReward.name}</strong> artifact! ({ARTIFACT_RANKS[showArtifactReward.id] || 'Unknown'} Rank)
              <br/>This powerful relic holds ancient wisdom and mystical properties.
            </p>
            <div className="flex flex-row gap-4 justify-center items-center flex-wrap">
              {ownedArtifactIds.includes(showArtifactReward.id) ? null : (
                <button
                  onClick={handleMintAndContinue}
                  disabled={isMinting}
                  className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 min-w-[200px] ${
                    isMinting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isMinting ? '⏳ Forging...' : `🔮 Forge this artifact and preserve its power for eternity`}
                </button>
              )}
              <button
                onClick={handleSkipMint}
                disabled={isMinting}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 min-w-[200px]"
              >
                Continue Your Journey
              </button>
            </div>
          </div>
        )}
        {/* Fallback: If path or quiz mode but no valid scene data */}
        {(gameMode === 'path' && !currentSceneData) && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏔️✨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Crystal Cave Adventure!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Hello {playerName}! You're a young explorer who has discovered a mysterious glowing cave system. Choose your path wisely!
            </p>
            <button
              onClick={() => setCurrentScene('start')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Enter the Cave System
            </button>
          </div>
        )}
        {(gameMode === 'quiz' && (!currentSceneData || !currentSceneData.activity)) && (
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Scene Not Found</h2>
            <p className="text-lg text-gray-600 mb-6">
              Oops! It seems like we've lost our way. Let's return to the main path selection.
            </p>
            <button
              onClick={() => changeToScene(lastPathScene, 'path')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Return to Path Selection
            </button>
          </div>
        )}
        {/* ...rest of the main content, e.g. helper text, confetti, etc... */}
        {showConfetti && <ReactConfetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={120} recycle={false} />}
      </div>
      {/* Stats Bar - below main card, same width */}
      <div className="stats-bar-card mx-auto mb-0 universal-bg">
        <div className="stats-bar-inner flex flex-row items-center justify-between">
          {/* Score and Traits - left, stacked, plain text - reduced width */}
          <div className="stats-traits-plain flex flex-col items-start" style={{ minWidth: 80, maxWidth: 90 }}>
            <div className="score-label" style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.6rem' }}>SCORE: {score}</div>
            <div className="trait-plain" style={{ fontSize: '0.7rem', fontWeight: 'normal', marginBottom: '0.3rem' }}>WISDOM: <span>{playerStats.wisdom}</span></div>
            <div className="trait-plain" style={{ fontSize: '0.7rem', fontWeight: 'normal', marginBottom: '0.3rem' }}>COURAGE: <span>{playerStats.courage}</span></div>
            <div className="trait-plain" style={{ fontSize: '0.7rem', fontWeight: 'normal', marginBottom: '0.3rem' }}>KINDNESS: <span>{playerStats.kindness}</span></div>
            <div className="trait-plain" style={{ fontSize: '0.7rem', fontWeight: 'normal', marginBottom: '0.3rem' }}>DISCOVERY: <span>{playerStats.discovery}</span></div>
          </div>
          {/* Artifact Mini-Cards - expanded to fill yellow outlined area */}
          <div className="stats-artifact-scroll flex-1 mx-1" style={{ minWidth: 0, paddingBottom: '0.75rem', height: '180px', overflow: 'hidden', flex: '1 1 auto' }}>
            <div className="artifact-mini-cards flex flex-row gap-2 overflow-x-auto overflow-y-hidden" style={{ flexWrap: 'nowrap', height: '160px', alignItems: 'center', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
              {CANONICAL_ARTIFACTS.filter(artifact => collectedArtifacts.includes(artifact.id) || ownedArtifactIds.includes(artifact.id)).map((artifact) => {
                const isOwned = ownedArtifactIds.includes(artifact.id);
                return (
                  <div
                    key={artifact.id}
                    className={`artifact-mini-card ${isOwned ? 'owned' : 'collected'}${recentlyCollected === artifact.id ? ' collected' : ''}`}
                    title={artifact.name}
                    tabIndex={0}
                    aria-label={`Artifact: ${artifact.name}`}
                    style={{ height: '150px', width: '105px', flexShrink: 0, position: 'relative', background: '#fff', borderRadius: '6px', display: 'flex', flexDirection: 'column' }}
                  >
                    <img
                      src={artifact.image}
                      alt={artifact.name}
                      style={{ width: '100%', height: '124px', objectFit: 'cover', borderRadius: '6px 6px 0 0' }}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        el.onerror = null;
                        el.src = `${process.env.PUBLIC_URL}/images/${artifact.id}.png`;
                        el.onerror = () => {
                          el.onerror = null;
                          el.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA1IiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDEwNSAxNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwNSIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMxZTI5M2IiIHJ4PSI2Ii8+PHRleHQgeD0iNTIuNSIgeT0iNzUuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIzMHB4IiBmaWxsPSIjZmZmIj8+PzwvdGV4dD48L3N2Zz4=';
                        };
                      }}
                    />
                    <div className="artifact-mini-name" style={{ fontSize: '0.68rem', textAlign: 'center', padding: '2px 4px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{artifact.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Minted Count - right, small font - reduced width */}
          <div className="stats-artifact-count-small flex flex-col items-end justify-center ml-1" style={{ minWidth: 50, maxWidth: 55 }}>
            <div className="stats-label-small" style={{ fontSize: '0.7rem', fontWeight: 'normal', marginBottom: '0.2rem' }}>MINTED</div>
            <div className="stats-value-small" style={{ fontSize: '0.85rem', fontWeight: 'normal', marginBottom: '0.4rem' }}>{ownedArtifactIds.length} / {CANONICAL_ARTIFACTS.length}</div>
            <div className="placeholder-image" style={{ width: '60px', height: '45px', backgroundColor: '#2d1a4a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'white' }}>
              IMG
            </div>
          </div>
        </div>
        {/* Quote at the bottom of the frame */}
        <div className="stats-quote text-center mt-4 mb-0">
          <span>💜 Made with love by DrDeek 💜</span>
        </div>
      </div>
      {/* Artifact Detail Modal removed */}
    </main>
    {/* Sticky mobile navigation */}
    <StickyBottomNav />
    </>
  );
};

export default AdventureLearningGame;
          