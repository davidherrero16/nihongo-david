
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
  // Create more variety by choosing random ranges with different digit counts
  const maxDigits = max.toString().length;
  
  // Weight towards smaller numbers for more variety
  const ranges = [];
  
  // Add single digits (1-9)
  if (max >= 9) ranges.push({ min: 1, max: Math.min(9, max), weight: 3 });
  
  // Add double digits (10-99)
  if (max >= 99) ranges.push({ min: 10, max: Math.min(99, max), weight: 3 });
  
  // Add triple digits (100-999)
  if (max >= 999) ranges.push({ min: 100, max: Math.min(999, max), weight: 2 });
  
  // Add 4 digits (1000-9999)
  if (max >= 9999) ranges.push({ min: 1000, max: Math.min(9999, max), weight: 2 });
  
  // Add 5+ digits with lower weight
  if (max >= 10000) ranges.push({ min: 10000, max: max, weight: 1 });
  
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
