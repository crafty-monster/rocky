import fs from 'fs';

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
    const len = this.readShort();
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

/**
 * Recursively converts NBT payload values (BigInt, Buffer) into
 * JSON-serializable equivalents.
 * @param {*} value the value to sanitize
 * @return {*} a JSON-serializable value
 */
function sanitize(value) {
  if (typeof value === 'bigint') return value.toString();
  if (Buffer.isBuffer(value)) return value.toString('base64');
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)]));
  }
  return value;
}

/**
 * Parses a Bedrock level.dat file.
 * @param {String} filePath path to level.dat
 * @return {Object} the parsed contents, JSON-serializable
 */
export function readLevelDat(filePath) {
  const fileBuf = fs.readFileSync(filePath);

  // 8-byte header: [version int32 LE][payload length int32 LE], then NBT data.
  const version = fileBuf.readInt32LE(0);
  const reader = new NbtReader(fileBuf, 8);

  const rootType = reader.readUByte();
  if (rootType !== TAG.Compound) {
    throw new Error(`Expected root Compound tag, got type ${rootType}`);
  }
  reader.readString(); // root name, usually empty
  const data = sanitize(reader.readCompound());

  return {
    version,
    name: data.LevelName,
    seed: data.RandomSeed,
    difficulty: DIFFICULTY_NAMES[data.Difficulty] ?? null,
    gameType: GAME_TYPE_NAMES[data.GameType] ?? null,
    baseGameVersion: data.BaseGameVersion,
    lastPlayed: data.LastPlayed !== undefined ? new Date(Number(data.LastPlayed) * 1000).toISOString() : null,
    data,
  };
}
