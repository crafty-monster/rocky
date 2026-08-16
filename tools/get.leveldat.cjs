#!/usr/bin/env node
/**
 * Extract key fields from a Minecraft Bedrock level.dat file.
 * No dependencies — pure Node.js.
 *
 * Usage:
 *   node get.leveldat.cjs /path/to/worlds/MyWorld/level.dat
 *
 * Bedrock's level.dat starts with an 8-byte header:
 *   [4 bytes: file format version, little-endian int32]
 *   [4 bytes: length of NBT payload, little-endian int32]
 * followed by little-endian, uncompressed NBT data.
 */

const fs = require('fs');

const TAG = {
  End: 0, Byte: 1, Short: 2, Int: 3, Long: 4, Float: 5, Double: 6,
  ByteArray: 7, String: 8, List: 9, Compound: 10, IntArray: 11, LongArray: 12,
};

const DIFFICULTY_NAMES = ['peaceful', 'easy', 'normal', 'hard'];
const GAME_TYPE_NAMES = ['survival', 'creative', 'adventure', 'spectator'];

class NbtReader {
  constructor(buffer, offset) {
    this.buf = buffer;
    this.off = offset;
  }

  readByte() { const v = this.buf.readInt8(this.off); this.off += 1; return v; }
  readUByte() { const v = this.buf.readUInt8(this.off); this.off += 1; return v; }
  readShort() { const v = this.buf.readInt16LE(this.off); this.off += 2; return v; }
  readInt() { const v = this.buf.readInt32LE(this.off); this.off += 4; return v; }
  readLong() { const v = this.buf.readBigInt64LE(this.off); this.off += 8; return v; }
  readFloat() { const v = this.buf.readFloatLE(this.off); this.off += 4; return v; }
  readDouble() { const v = this.buf.readDoubleLE(this.off); this.off += 8; return v; }

  readString() {
    const len = this.readShort(); // unsigned short in spec, but LE short is fine for typical lengths
    const str = this.buf.toString('utf8', this.off, this.off + len);
    this.off += len;
    return str;
  }

  readByteArray() {
    const len = this.readInt();
    const arr = this.buf.slice(this.off, this.off + len);
    this.off += len;
    return arr;
  }

  readIntArray() {
    const len = this.readInt();
    const arr = new Array(len);
    for (let i = 0; i < len; i++) arr[i] = this.readInt();
    return arr;
  }

  readLongArray() {
    const len = this.readInt();
    const arr = new Array(len);
    for (let i = 0; i < len; i++) arr[i] = this.readLong();
    return arr;
  }

  readTagPayload(type) {
    switch (type) {
      case TAG.Byte: return this.readByte();
      case TAG.Short: return this.readShort();
      case TAG.Int: return this.readInt();
      case TAG.Long: return this.readLong();
      case TAG.Float: return this.readFloat();
      case TAG.Double: return this.readDouble();
      case TAG.ByteArray: return this.readByteArray();
      case TAG.String: return this.readString();
      case TAG.List: return this.readList();
      case TAG.Compound: return this.readCompound();
      case TAG.IntArray: return this.readIntArray();
      case TAG.LongArray: return this.readLongArray();
      default:
        throw new Error(`Unsupported/unknown tag type: ${type} at offset ${this.off}`);
    }
  }

  readList() {
    const itemType = this.readUByte();
    const len = this.readInt();
    const items = new Array(len);
    for (let i = 0; i < len; i++) items[i] = this.readTagPayload(itemType);
    return items;
  }

  readCompound() {
    const obj = {};
    while (true) {
      const type = this.readUByte();
      if (type === TAG.End) break;
      const name = this.readString();
      obj[name] = this.readTagPayload(type);
    }
    return obj;
  }
}

function parseLevelDat(filePath) {
  const fileBuf = fs.readFileSync(filePath);

  // Skip the 8-byte Bedrock header (version int32 + length int32)
  const version = fileBuf.readInt32LE(0);
  const payloadLength = fileBuf.readInt32LE(4);
  const nbtStart = 8;

  const reader = new NbtReader(fileBuf, nbtStart);

  // Root tag: type byte + name string + compound payload
  const rootType = reader.readUByte();
  if (rootType !== TAG.Compound) {
    throw new Error(`Expected root Compound tag, got type ${rootType}`);
  }
  const rootName = reader.readString(); // usually empty string
  const root = reader.readCompound();

  return { version, payloadLength, rootName, data: root };
}

// --- Main ---
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node get.leveldat.cjs /path/to/worlds/<WorldName>/level.dat');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const { version, data } = parseLevelDat(filePath);

  console.log(`Bedrock level.dat format version: ${version}`);
  console.log(`World name (LevelName): ${data.LevelName ?? '(not set)'}`);
  console.log(`Seed (RandomSeed): ${data.RandomSeed?.toString() ?? '(not set)'}`);
  console.log(`Difficulty: ${DIFFICULTY_NAMES[data.Difficulty] ?? '(unknown)'}`);
  console.log(`Game type (GameType): ${GAME_TYPE_NAMES[data.GameType] ?? '(unknown)'}`);
  console.log(`Base game version (BaseGameVersion): ${data.BaseGameVersion ?? '(not set)'}`);
  console.log(`Last played (LastPlayed): ${data.LastPlayed?.toString() ?? '(not set)'}`);
} catch (err) {
  console.error('Failed to parse level.dat:', err.message);
  process.exit(1);
}