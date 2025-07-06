# Crystal Cave Artifact Rarity System

This document explains **how artifact rarity is calculated** so future game-play tweaks and new artifacts remain consistent.

---

## 1. Input Signals
Rarity is derived from four equally-weighted dimensions:

1. **Path Popularity** – How likely an average player is to encounter the branch that leads to the artifact.
   * Measured from analytics or play-test click counts.
2. **Challenge Difficulty** – Cognitive complexity, number of steps and failure rate of the activity that rewards the artifact.
3. **Utility / Narrative Benefit** – How powerful or story-critical the artifact is once owned.
4. **Depth in Cave** – Number of scene transitions required from the game start to reach the reward.

Each dimension is scored **1 → 5** (1 = very common/easy/superficial, 5 = very rare/hard/deep).

---

## 2. Scoring Formula
```
rarityScore = (popularityScore + difficultyScore + benefitScore + depthScore)
```
*Minimum score*: 4   *Maximum score*: 20.

The score maps to the on-chain **`Rarity` trait** as follows:

| Score Range | Rarity Label |
|-------------|--------------|
| 4 – 6       | **Common**   |
| 7 – 9       | **Uncommon** |
| 10 – 12     | **Rare**     |
| 13 – 15     | **Epic**     |
| 16 – 17     | **Legendary**|
| 18 – 20     | **Mythic**   |

---

## 3. Metadata Guidelines
For every artifact JSON (`public/metadata/{id}.json`):

* Keep **total trait count between 3 and 7**.
* Mandatory traits:
  * `Type`        (eg. *Elemental Crystal*)
  * `Rarity`      – computed from the table above
  * `Discovery Location` or `Path` (where it's found)
* Optional supporting traits (pick 0-4):
  * Unique power flavour (eg. *Navigation Power: Supreme*)
  * Element alignment, age, material, etc.
* Do **not** include analytics numbers or spoilers in metadata.

---

## 4. Example
Artifact **"Ancient Map"** (id 0)
* Popularity 3 (many players pick the first math path)
* Difficulty 2 (simple arithmetic)
* Benefit 3 (useful for story navigation)
* Depth 1 (first chamber)

```
score = 3 + 2 + 3 + 1 = 9 → Uncommon
```

Suggested metadata traits:
```
{
  "trait_type": "Type", "value": "Navigation Tool" },
  { "trait_type": "Rarity", "value": "Uncommon" },
  { "trait_type": "Discovery Location", "value": "Cave Entrance" },
  { "trait_type": "Navigation Power", "value": "Supreme" }
```

---

## 5. Adding New Artifacts
1. Estimate the four dimension scores.
2. Compute `rarityScore` → rarity label.
3. Add 3-7 relevant traits & image.
4. Update `ARTIFACT_METADATA_MAPPING.md`.
5. Deploy updated JSON to IPFS and set baseURI if necessary. 