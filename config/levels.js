// Leveling System with Tiers
export const LEVEL_TIERS = [
  { name: 'MORTAL', startLevel: 1, endLevel: 10, expPerLevel: 1000 },
  { name: 'WARRIOR', startLevel: 11, endLevel: 20, expPerLevel: 2000 },
  { name: 'CHAMPION', startLevel: 21, endLevel: 30, expPerLevel: 3000 },
  { name: 'LEGEND', startLevel: 31, endLevel: 40, expPerLevel: 5000 },
  { name: 'TITAN', startLevel: 41, endLevel: 50, expPerLevel: 7500 },
  { name: 'DEMIGOD', startLevel: 51, endLevel: 999, expPerLevel: 10000 },
];

// Generate LEVELS array based on tiers
export const LEVELS = [];
let cumulativeEXP = 0;

LEVEL_TIERS.forEach(tier => {
  for (let level = tier.startLevel; level <= Math.min(tier.endLevel, 100); level++) {
    LEVELS.push({
      level,
      expRequired: cumulativeEXP,
      tier: tier.name,
    });
    cumulativeEXP += tier.expPerLevel;
  }
});

// Helper function to get tier name from level
export const getTierFromLevel = (level) => {
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.startLevel && level <= tier.endLevel) {
      return tier.name;
    }
  }
  return 'DEMIGOD'; // Default for levels beyond 50
};

// Helper function to calculate EXP needed for next level
export const getExpForNextLevel = (level) => {
  for (const tier of LEVEL_TIERS) {
    if (level >= tier.startLevel && level <= tier.endLevel) {
      return tier.expPerLevel;
    }
  }
  return 10000; // DEMIGOD tier default
};

// Helper function to get current level EXP requirement
export const getExpRequiredForLevel = (level) => {
  const levelData = LEVELS.find(l => l.level === level);
  return levelData ? levelData.expRequired : 0;
};