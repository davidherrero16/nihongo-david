
const numberMap = {
  0: '',
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'よん',
  5: 'ご',
  6: 'ろく',
  7: 'なな',
  8: 'はち',
  9: 'きゅう'
};

const placeValues = {
  1: '',
  10: 'じゅう',
  100: 'ひゃく',
  1000: 'せん',
  10000: 'まん',
  100000: 'まん',
  1000000: 'まん'
};

export const convertNumberToHiragana = (num: number): string => {
  if (num === 0) return 'ぜろ';
  if (num < 0) return 'マイナス' + convertNumberToHiragana(-num);

  let result = '';
  let remaining = num;

  // Handle 万 (10,000s)
  if (remaining >= 10000) {
    const manPart = Math.floor(remaining / 10000);
    if (manPart === 1) {
      result += 'いち';
    } else {
      result += convertThousands(manPart);
    }
    result += 'まん';
    remaining %= 10000;
  }

  // Handle thousands, hundreds, tens, ones
  result += convertThousands(remaining);

  return result;
};

const convertThousands = (num: number): string => {
  if (num === 0) return '';
  
  let result = '';
  let remaining = num;

  // Handle 千 (1000s)
  if (remaining >= 1000) {
    const thousands = Math.floor(remaining / 1000);
    if (thousands === 1) {
      result += 'せん';
    } else if (thousands === 3) {
      result += 'さんぜん';
    } else if (thousands === 8) {
      result += 'はっせん';
    } else {
      result += numberMap[thousands] + 'せん';
    }
    remaining %= 1000;
  }

  // Handle 百 (100s)
  if (remaining >= 100) {
    const hundreds = Math.floor(remaining / 100);
    if (hundreds === 1) {
      result += 'ひゃく';
    } else if (hundreds === 3) {
      result += 'さんびゃく';
    } else if (hundreds === 6) {
      result += 'ろっぴゃく';
    } else if (hundreds === 8) {
      result += 'はっぴゃく';
    } else {
      result += numberMap[hundreds] + 'ひゃく';
    }
    remaining %= 100;
  }

  // Handle 十 (10s)
  if (remaining >= 10) {
    const tens = Math.floor(remaining / 10);
    if (tens === 1) {
      result += 'じゅう';
    } else {
      result += numberMap[tens] + 'じゅう';
    }
    remaining %= 10;
  }

  // Handle ones
  if (remaining > 0) {
    result += numberMap[remaining];
  }

  return result;
};

export const generateRandomNumber = (min: number = 1, max: number = 9999999): number => {
  // Create ranges with specific weights: 70% bigger numbers, 25% lower numbers, 5% for 1-100
  const ranges = [];
  
  // 5% chance for numbers 1-100
  if (max >= 100) {
    ranges.push({ min: 1, max: Math.min(100, max), weight: 5 });
  }
  
  // 25% chance for lower numbers (101 to 10% of max, or up to 10,000)
  const lowerThreshold = Math.min(Math.floor(max * 0.1), 10000);
  if (max > 100 && lowerThreshold > 100) {
    ranges.push({ min: 101, max: lowerThreshold, weight: 25 });
  }
  
  // 70% chance for bigger numbers (from 10% of max to max)
  if (max > lowerThreshold) {
    ranges.push({ min: lowerThreshold + 1, max: max, weight: 70 });
  }
  
  // If max is too small, adjust weights appropriately
  if (max <= 100) {
    ranges[0].weight = 100; // 100% for the only available range
  } else if (max <= lowerThreshold) {
    // Only small and lower ranges exist
    const smallRange = ranges.find(r => r.max === 100);
    const lowerRange = ranges.find(r => r.min === 101);
    if (smallRange) smallRange.weight = 17; // ~17% for 1-100
    if (lowerRange) lowerRange.weight = 83; // ~83% for 101-max
  }
  
  // Calculate total weight
  const totalWeight = ranges.reduce((sum, range) => sum + range.weight, 0);
  
  // Choose a random range based on weights
  let randomWeight = Math.random() * totalWeight;
  let selectedRange = ranges[0];
  
  for (const range of ranges) {
    randomWeight -= range.weight;
    if (randomWeight <= 0) {
      selectedRange = range;
      break;
    }
  }
  
  // Generate random number within selected range
  return Math.floor(Math.random() * (selectedRange.max - selectedRange.min + 1)) + selectedRange.min;
};
