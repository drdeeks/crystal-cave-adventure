# Crystal Cave NFT Artifact Metadata Mapping

This document provides a complete mapping of JSON metadata files to their corresponding artifacts in the Crystal Cave adventure game.

## Metadata File Structure
All metadata files are located in `public/metadata/` and follow the pattern `{tokenId}.json`

## Complete Artifact Mapping

### Original Cave Artifacts (0-17)

| Token ID | JSON File | Artifact Name | Type | Rarity | Discovery Location |
|----------|-----------|---------------|------|--------|-------------------|
| 0 | `0.json` | Ancient Map | Navigation Tool | Legendary | Cave Entrance |
| 1 | `1.json` | Sage's Blessing | Wisdom Artifact | Epic | Cave Entrance |
| 2 | `2.json` | Magical Compass | Navigation Tool | Rare | Cave Entrance |
| 3 | `3.json` | Marina's Journal | Knowledge Repository | Legendary | Cave Entrance |
| 4 | `4.json` | Water Crystal | Elemental Crystal | Common | Underground River |
| 5 | `5.json` | Pattern Pearl | Mathematical Artifact | Uncommon | Pool of Reflection |
| 6 | `6.json` | Fossil Fragment | Paleontological Artifact | Uncommon | Submerged Mystery Cave |
| 7 | `7.json` | Harmony Stone | Musical Artifact | Rare | Musical Waters |
| 8 | `8.json` | Fire Crystal | Elemental Crystal | Common | Warm Crystal Cavern |
| 9 | `9.json` | Courage Gem | Virtue Gem | Epic | Dragon's Domain |
| 10 | `10.json` | Ancient Scroll | Historical Document | Rare | Dragon's Domain |
| 11 | `11.json` | Dragon's Wisdom | Dragon Artifact | Legendary | Dragon's Domain |
| 12 | `12.json` | Meteor Fragment | Cosmic Artifact | Legendary | Dragon's Domain |
| 13 | `13.json` | Star Map | Astronomical Tool | Common | Celestial Observatory |
| 14 | `14.json` | Planetary Badge | Achievement Badge | Uncommon | Solar System Journey |
| 15 | `15.json` | Galaxy Map | Galactic Navigation | Rare | Galactic Journey |
| 16 | `16.json` | Time Crystal | Temporal Artifact | Mythic | Time Anomaly |
| 17 | `17.json` | Master Crystal | Master Artifact | Mythic | Heart of Crystal Cave |

### Monanimal Artifacts (18-21)

| Token ID | JSON File | Artifact Name | Type | Rarity | Element | Path |
|----------|-----------|---------------|------|--------|---------|------|
| 18 | `18.json` | Chill Dak | Monanimal | Epic | Tranquility | Tranquil Passage |
| 19 | `19.json` | Moyaki | Monanimal | Legendary | Deep Knowledge | Mysterious Depths |
| 20 | `20.json` | Salmonad | Monanimal | Mythic | Dimensional Flow | Upstream Current |
| 21 | `21.json` | Dead Chog | Monanimal | Legendary | Forgotten Knowledge | Forgotten Realm |

## Rarity Distribution

- **Common**: 3 artifacts (13.6%)
- **Uncommon**: 3 artifacts (13.6%)
- **Rare**: 4 artifacts (18.2%)
- **Epic**: 3 artifacts (13.6%)
- **Legendary**: 6 artifacts (27.3%)
- **Mythic**: 3 artifacts (13.6%)

## Challenge Type Distribution

- **Science**: 6 artifacts
- **Philosophy**: 4 artifacts
- **Wordplay**: 3 artifacts
- **Geography**: 2 artifacts
- **History**: 2 artifacts
- **Astronomy**: 2 artifacts
- **Mathematics**: 1 artifact

## Special Trait Notes

### Universal Traits (All Artifacts)
- `Cave Dweller: "Yes"`
- `Mission: "5"`

### Monanimal-Only Traits
- `Monanimal: "True"`
- `Utility: "True"`
- `Gay: "Ofc"`
- Each has a unique `Path` and `Element`

### Unique Individual Traits Examples
- **Chill Dak**: Meditation Master, Serenity Level: Maximum
- **Moyaki**: Tentacle Count: 8, Bioluminescence, Intelligence Level: Supreme
- **Salmonad**: Galaxy Scales, Migration Power: Interdimensional, Cosmic Swimmer
- **Dead Chog**: Ancient Wisdom, Lost Civilization Access, Memory Guardian

## Image URLs
All images follow the pattern: `https://crystal-cave-nft.netlify.app/images/{tokenId}.png`

Example: Token ID 18 (Chill Dak) → `https://crystal-cave-nft.netlify.app/images/18.png` 