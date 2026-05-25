// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Save System
// Wraps localStorage with error safety.
// ============================================================

export class SaveSystem {
  static get<T>(key: string, defaultVal: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultVal;
      return JSON.parse(raw) as T;
    } catch {
      return defaultVal;
    }
  }

  static set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('[SaveSystem] Could not write key:', key);
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  static clearAll(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cc_'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
  }
}
