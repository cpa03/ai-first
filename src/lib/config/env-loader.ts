/**
 * Type-safe environment variable loader
 */
export class EnvLoader {
  /**
   * Get string value from environment variable
   */
  static string(key: string, defaultValue: string): string {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get number value from environment variable
   */
  static number(
    key: string,
    defaultValue: number,
    min?: number,
    max?: number
  ): number {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined) return defaultValue;

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(
        `Invalid number value for ${key}: "${value}". Using default: ${defaultValue}`
      );
      return defaultValue;
    }

    if (min !== undefined && parsed < min) {
      console.warn(
        `${key} value ${parsed} is below minimum ${min}. Using minimum.`
      );
      return min;
    }

    if (max !== undefined && parsed > max) {
      console.warn(
        `${key} value ${parsed} is above maximum ${max}. Using maximum.`
      );
      return max;
    }

    return parsed;
  }

  /**
   * Get boolean value from environment variable
   */
  static boolean(key: string, defaultValue: boolean): boolean {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined) return defaultValue;

    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;

    console.warn(
      `Invalid boolean value for ${key}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  /**
   * Get array value from comma-separated environment variable
   */
  static array<T>(
    key: string,
    defaultValue: T[],
    parser: (item: string) => T
  ): T[] {
    const value = typeof process !== 'undefined' ? process.env[key] : undefined;
    if (value === undefined || value.trim() === '') return defaultValue;

    return value
      .split(',')
      .map((item) => parser(item.trim()))
      .filter((item) => item !== undefined);
  }
}
