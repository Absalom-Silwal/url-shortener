"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strToDate = exports.ttlCalculation = exports.Base62 = exports.createSnowflake = void 0;
const createSnowflake = (workerId) => {
    const EPOCH = 1577836800000n; // Jan 1 2020
    let lastTimestamp = -1n;
    let sequence = 0n;
    return () => {
        let now = BigInt(Date.now());
        if (now === lastTimestamp) {
            sequence = (sequence + 1n) & 0xfffn; // 12 bits
            // checking if generated sequence more than 4096.if generate sequence more than 4096, it will 
            // wait until next millisecond to generate the sequence
            if (sequence === 0n) {
                while (now <= lastTimestamp) {
                    now = BigInt(Date.now());
                }
            }
        }
        else {
            sequence = 0n;
        }
        lastTimestamp = now;
        const timestampPart = (now - EPOCH) << 22n;
        const workerPart = (BigInt(workerId) & 0x3ffn) << 12n;
        const sequencePart = sequence;
        return timestampPart | workerPart | sequencePart;
    };
};
exports.createSnowflake = createSnowflake;
const Base62 = (uId) => {
    const Base62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let new_encoded_str = '';
    const base = 62n;
    while (uId > 0) {
        const rem = uId % base;
        new_encoded_str = Base62[Number(rem)] + new_encoded_str; //prepending
        uId = uId / base;
    }
    return new_encoded_str;
};
exports.Base62 = Base62;
const ttlCalculation = (createdAt, ttlYear = 3) => {
    const result = new Date(createdAt);
    result.setFullYear(createdAt.getFullYear() + ttlYear);
    return result;
};
exports.ttlCalculation = ttlCalculation;
const strToDate = (date) => {
    return new Date(date);
};
exports.strToDate = strToDate;
