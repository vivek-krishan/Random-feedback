/**
 * Generates a random integer between 1 and the provided maximum number (inclusive)
 * @param max The maximum number (inclusive)
 * @returns A random integer between 1 and max
 */
export function getRandomNumber(max: number): number {
    if (max <= 0) {
        throw new Error('Maximum number must be greater than 0');
    }
    if (!Number.isInteger(max)) {
        throw new Error('Maximum number must be an integer');
    }

    // Math.random() returns a float between 0 (inclusive) and 1 (exclusive)
    // Multiply by max and floor to get integer between 0 and max-1
    // Then add 1 to shift range to 1 and max
    return Math.floor(Math.random() * max) + 1;
}

