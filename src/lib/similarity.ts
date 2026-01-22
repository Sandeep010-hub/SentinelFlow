/**
 * Similarity Analysis Utilities for SentinelFlow
 * Implements Cosine Similarity and TF-IDF concepts for text comparison.
 */

// Common English stop words to filter out
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'this',
    'that', 'it', 'as', 'be', 'can', 'will', 'has', 'have', 'had'
]);

/**
 * Tokenizes text into words, converts to lowercase, and removes stop words and punctuation.
 */
export function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

/**
 * Creates a frequency map (vector) from tokens.
 */
export function createVector(tokens: string[]): Map<string, number> {
    const vector = new Map<string, number>();
    for (const token of tokens) {
        vector.set(token, (vector.get(token) || 0) + 1);
    }
    return vector;
}

/**
 * Calculates the magnitude of a vector.
 */
function calculateMagnitude(vector: Map<string, number>): number {
    let sumOfSquares = 0;
    for (const count of vector.values()) {
        sumOfSquares += count * count;
    }
    return Math.sqrt(sumOfSquares);
}

/**
 * Calculates the dot product of two vectors.
 */
function calculateDotProduct(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    for (const [key, value] of vecA) {
        if (vecB.has(key)) {
            dotProduct += value * vecB.get(key)!;
        }
    }
    return dotProduct;
}

/**
 * Calculates Cosine Similarity between two text strings.
 * Formula: (A . B) / (||A|| * ||B||)
 * Returns a value between 0 (no similarity) and 1 (identical).
 */
export function calculateCosineSimilarity(textA: string, textB: string): number {
    const tokensA = tokenize(textA);
    const tokensB = tokenize(textB);

    // If either text is empty or has no valid keywords
    if (tokensA.length === 0 || tokensB.length === 0) {
        return 0;
    }

    const vecA = createVector(tokensA);
    const vecB = createVector(tokensB);

    const dotProduct = calculateDotProduct(vecA, vecB);
    const magnitudeA = calculateMagnitude(vecA);
    const magnitudeB = calculateMagnitude(vecB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Mock function to simulate "Digital DNA" extraction
 * Returns a list of top keywords found in the text.
 */
export function extractKeywords(text: string, limit: number = 5): string[] {
    const tokens = tokenize(text);
    const vector = createVector(tokens);

    // Sort by frequency
    return Array.from(vector.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(entry => entry[0]);
}
