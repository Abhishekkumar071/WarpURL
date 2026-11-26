package com.url.shortener.util;

import java.nio.charset.StandardCharsets;

/**
 * High-performance 32-bit MurmurHash3 implementation (x86 variant).
 * Fast, non-cryptographic hash with excellent avalanche distribution.
 */
public final class MurmurHash3 {

    private static final int C1 = 0xcc9e2d51;
    private static final int C2 = 0x1b873593;
    private static final int R1 = 15;
    private static final int R2 = 13;
    private static final int M = 5;
    private static final int N = 0xe6546b64;

    private MurmurHash3() {}

    public static int hash32(String input, int seed) {
        byte[] data = input.getBytes(StandardCharsets.UTF_8);
        int length = data.length;
        int h1 = seed;

        int nblocks = length / 4;
        for (int i = 0; i < nblocks; i++) {
            int index = i * 4;
            int k1 = (data[index] & 0xff)
                    | ((data[index + 1] & 0xff) << 8)
                    | ((data[index + 2] & 0xff) << 16)
                    | ((data[index + 3] & 0xff) << 24);

            k1 *= C1;
            k1 = Integer.rotateLeft(k1, R1);
            k1 *= C2;

            h1 ^= k1;
            h1 = Integer.rotateLeft(h1, R2);
            h1 = h1 * M + N;
        }

        int tailIndex = nblocks * 4;
        int k1 = 0;
        int tailLength = length & 3;

        if (tailLength == 3) {
            k1 ^= (data[tailIndex + 2] & 0xff) << 16;
        }
        if (tailLength >= 2) {
            k1 ^= (data[tailIndex + 1] & 0xff) << 8;
        }
        if (tailLength >= 1) {
            k1 ^= (data[tailIndex] & 0xff);
            k1 *= C1;
            k1 = Integer.rotateLeft(k1, R1);
            k1 *= C2;
            h1 ^= k1;
        }

        h1 ^= length;
        h1 ^= (h1 >>> 16);
        h1 *= 0x85ebca6b;
        h1 ^= (h1 >>> 13);
        h1 *= 0xc2b2ae35;
        h1 ^= (h1 >>> 16);

        return h1;
    }
}
