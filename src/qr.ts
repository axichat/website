const qrVersion = 10;
const qrSize = 21 + (qrVersion - 1) * 4;
const errorCorrectionFormatBitsMedium = 0;
const maskPattern = 0;
const dataBlockLengths = [43, 43, 43, 43, 44];
const errorCorrectionCodewordsPerBlock = 26;
const dataCodewordCount = dataBlockLengths.reduce((total, length) => total + length, 0);
const dataCapacityBits = dataCodewordCount * 8;
const alignmentPatternPositions = [6, 28, 50];

const gfExp = new Array<number>(255);
const gfLog = new Array<number>(256).fill(0);

let gfValue = 1;
for (let index = 0; index < 255; index += 1) {
  gfExp[index] = gfValue;
  gfLog[gfValue] = index;
  gfValue <<= 1;
  if ((gfValue & 0x100) !== 0) {
    gfValue ^= 0x11d;
  }
}

function gfMultiply(left: number, right: number) {
  if (left === 0 || right === 0) {
    return 0;
  }
  return gfExp[(gfLog[left] + gfLog[right]) % 255];
}

function reedSolomonDivisor(degree: number) {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;

  for (let index = 0; index < degree; index += 1) {
    for (let cursor = 0; cursor < degree; cursor += 1) {
      result[cursor] = gfMultiply(result[cursor], root);
      if (cursor + 1 < degree) {
        result[cursor] ^= result[cursor + 1];
      }
    }
    root = gfMultiply(root, 0x02);
  }

  return result;
}

function reedSolomonRemainder(data: number[], divisor: number[]) {
  const result = new Array<number>(divisor.length).fill(0);

  for (const value of data) {
    const factor = value ^ result.shift()!;
    result.push(0);
    for (let index = 0; index < divisor.length; index += 1) {
      result[index] ^= gfMultiply(divisor[index], factor);
    }
  }

  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let index = length - 1; index >= 0; index -= 1) {
    bits.push((value >>> index) & 1);
  }
}

function toDataCodewords(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value));
  const bits: number[] = [];

  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 16);
  for (const byte of bytes) {
    appendBits(bits, byte, 8);
  }

  if (bits.length > dataCapacityBits) {
    throw new Error("qr_data_too_long");
  }

  appendBits(bits, 0, Math.min(4, dataCapacityBits - bits.length));
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords: number[] = [];
  for (let index = 0; index < bits.length; index += 8) {
    let codeword = 0;
    for (let bit = 0; bit < 8; bit += 1) {
      codeword = (codeword << 1) | bits[index + bit];
    }
    codewords.push(codeword);
  }

  for (let padIndex = 0; codewords.length < dataCodewordCount; padIndex += 1) {
    codewords.push(padIndex % 2 === 0 ? 0xec : 0x11);
  }

  return codewords;
}

function interleaveBlocks(dataCodewords: number[]) {
  const divisor = reedSolomonDivisor(errorCorrectionCodewordsPerBlock);
  const blocks = dataBlockLengths.map((length, index) => {
    const offset = dataBlockLengths.slice(0, index).reduce((total, entry) => total + entry, 0);
    const data = dataCodewords.slice(offset, offset + length);
    const errorCorrection = reedSolomonRemainder(data, divisor);
    return { data, errorCorrection };
  });

  const result: number[] = [];
  const maxDataLength = Math.max(...blocks.map((block) => block.data.length));

  for (let index = 0; index < maxDataLength; index += 1) {
    for (const block of blocks) {
      if (index < block.data.length) {
        result.push(block.data[index]);
      }
    }
  }

  for (let index = 0; index < errorCorrectionCodewordsPerBlock; index += 1) {
    for (const block of blocks) {
      result.push(block.errorCorrection[index]);
    }
  }

  return result;
}

function bitLength(value: number) {
  let result = 0;
  while (value > 0) {
    result += 1;
    value >>>= 1;
  }
  return result;
}

function bchRemainder(value: number, polynomial: number) {
  const divisorLength = bitLength(polynomial);
  let remainder = value << (divisorLength - 1);

  while (bitLength(remainder) >= divisorLength) {
    remainder ^= polynomial << (bitLength(remainder) - divisorLength);
  }

  return remainder;
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0;
}

function makeMatrix() {
  return {
    modules: Array.from({ length: qrSize }, () => new Array<boolean>(qrSize).fill(false)),
    functionModules: Array.from({ length: qrSize }, () => new Array<boolean>(qrSize).fill(false)),
  };
}

function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < qrSize && y < qrSize;
}

function maskBit(x: number, y: number) {
  return (x + y) % 2 === 0;
}

function buildQrMatrix(value: string) {
  const { modules, functionModules } = makeMatrix();

  const setFunctionModule = (x: number, y: number, dark: boolean) => {
    if (!inBounds(x, y)) {
      return;
    }
    modules[y][x] = dark;
    functionModules[y][x] = true;
  };

  const drawFinderPattern = (centerX: number, centerY: number) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(centerX + dx, centerY + dy, distance !== 2 && distance !== 4);
      }
    }
  };

  const drawAlignmentPattern = (centerX: number, centerY: number) => {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunctionModule(centerX + dx, centerY + dy, distance !== 1);
      }
    }
  };

  drawFinderPattern(3, 3);
  drawFinderPattern(qrSize - 4, 3);
  drawFinderPattern(3, qrSize - 4);

  for (let index = 8; index < qrSize - 8; index += 1) {
    const dark = index % 2 === 0;
    setFunctionModule(6, index, dark);
    setFunctionModule(index, 6, dark);
  }

  for (let yIndex = 0; yIndex < alignmentPatternPositions.length; yIndex += 1) {
    for (let xIndex = 0; xIndex < alignmentPatternPositions.length; xIndex += 1) {
      const overlapsTopLeft = xIndex === 0 && yIndex === 0;
      const overlapsTopRight = xIndex === alignmentPatternPositions.length - 1 && yIndex === 0;
      const overlapsBottomLeft = xIndex === 0 && yIndex === alignmentPatternPositions.length - 1;
      if (!overlapsTopLeft && !overlapsTopRight && !overlapsBottomLeft) {
        drawAlignmentPattern(alignmentPatternPositions[xIndex], alignmentPatternPositions[yIndex]);
      }
    }
  }

  const formatData = (errorCorrectionFormatBitsMedium << 3) | maskPattern;
  const formatBits = ((formatData << 10) | bchRemainder(formatData, 0x537)) ^ 0x5412;

  for (let index = 0; index <= 5; index += 1) {
    setFunctionModule(8, index, getBit(formatBits, index));
  }
  setFunctionModule(8, 7, getBit(formatBits, 6));
  setFunctionModule(8, 8, getBit(formatBits, 7));
  setFunctionModule(7, 8, getBit(formatBits, 8));
  for (let index = 9; index < 15; index += 1) {
    setFunctionModule(14 - index, 8, getBit(formatBits, index));
  }
  for (let index = 0; index < 8; index += 1) {
    setFunctionModule(qrSize - 1 - index, 8, getBit(formatBits, index));
  }
  for (let index = 8; index < 15; index += 1) {
    setFunctionModule(8, qrSize - 15 + index, getBit(formatBits, index));
  }
  setFunctionModule(8, qrSize - 8, true);

  const versionBits = (qrVersion << 12) | bchRemainder(qrVersion, 0x1f25);
  for (let index = 0; index < 18; index += 1) {
    const bit = getBit(versionBits, index);
    const a = qrSize - 11 + (index % 3);
    const b = Math.floor(index / 3);
    setFunctionModule(a, b, bit);
    setFunctionModule(b, a, bit);
  }

  const dataCodewords = toDataCodewords(value);
  const codewords = interleaveBlocks(dataCodewords);
  const dataBits: number[] = [];
  for (const codeword of codewords) {
    appendBits(dataBits, codeword, 8);
  }

  let bitIndex = 0;
  let upward = true;
  for (let right = qrSize - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < qrSize; vertical += 1) {
      const y = upward ? qrSize - 1 - vertical : vertical;
      for (let column = 0; column < 2; column += 1) {
        const x = right - column;
        if (functionModules[y][x]) {
          continue;
        }
        const bit = bitIndex < dataBits.length ? dataBits[bitIndex] === 1 : false;
        bitIndex += 1;
        modules[y][x] = bit !== maskBit(x, y);
      }
    }

    upward = !upward;
  }

  return modules;
}

export function createQrSvg(value: string, border = 4) {
  const modules = buildQrMatrix(value);
  const size = modules.length + border * 2;
  const path = modules
    .flatMap((row, y) =>
      row.map((dark, x) => (dark ? `M${x + border},${y + border}h1v1h-1z` : ""))
    )
    .filter(Boolean)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Authenticator QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
