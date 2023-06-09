/// Information display formatting utils
import BigNumber from 'bignumber.js';

const POSTFIXES = ['', 'k', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y'];

/**
 * Format a number as a balance
 * @dev - Inspired by Aave's FormattedNumber:
 *        https://github.com/aave/interface/blob/main/src/components/primitives/FormattedNumber.tsx
 * @param amount - The number being converted to a balance
 * @returns string in the form of a formatted balance. Does not include units.
 */
export function toBalance(amount: number | undefined): string {
  if (amount == undefined) {
    return '';
  }

  let decimals = 0;
  if (amount === 0) {
    decimals = 0;
  } else {
    if (amount > 1) {
      decimals = 2;
    } else {
      decimals = 7;
    }
  }

  const minValue = 10 ** -(decimals as number);
  const isSmallerThanMin = amount !== 0 && Math.abs(amount) < Math.abs(minValue);
  let adjAmount = isSmallerThanMin ? minValue : amount;

  const bnValue = new BigNumber(amount);

  const integerPlaces = bnValue.toFixed(0).length;
  const postfixIndex = Math.min(
    Math.floor(integerPlaces ? (integerPlaces - 1) / 3 : 0),
    POSTFIXES.length - 1
  );
  adjAmount = bnValue.shiftedBy(-3 * postfixIndex).toNumber();

  const formattedStr = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(adjAmount);
  return `${formattedStr}${POSTFIXES[postfixIndex]}`;
}

/**
 * Format a number as a percentage
 * @param rate - The number expressed in decimal
 * @returns the number as a percentage
 */
export function toPercentage(rate: number | undefined): string {
  if (rate == undefined) {
    return '';
  }

  const adjRate = rate * 100;
  const formattedStr = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(adjRate);
  return `${formattedStr}%`;
}

/**
 * Format an addressed into a compressed version
 * @param address
 */
export function toCompactAddress(address: string | undefined): string {
  if (!address) {
    return '';
  }

  return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
}

/**
 * Format a time span in seconds into a readable string
 */
export function toTimeSpan(secondsLeft: number): string {
  let d = Math.floor(secondsLeft / (3600 * 24));
  secondsLeft -= d * 3600 * 24;
  let h = Math.floor(secondsLeft / 3600);
  secondsLeft -= h * 3600;
  let m = Math.floor(secondsLeft / 60);
  secondsLeft -= m * 60;

  const tmp = [];
  d && tmp.push(d + 'd');
  (d || h) && tmp.push(h + 'h');
  (d || h || m) && tmp.push(m + 'm');
  !d && tmp.push(secondsLeft + 's');
  return tmp.join(' ');
}
