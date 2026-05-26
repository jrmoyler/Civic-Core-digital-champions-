// ============================================================
// CIVIC CORE: DIGITAL CHAMPIONS — Object Pool
// Generic recycle pool that eliminates GC churn for frequently
// created/destroyed objects (damage text, particles, etc.)
// ============================================================

export class ObjectPool<T> {
  private readonly pool: T[] = [];
  private readonly factory: () => T;
  private readonly onAcquire: (item: T) => void;
  private readonly onRelease: (item: T) => void;

  /** Active items currently checked out of the pool */
  private _active: number = 0;
  get activeCount(): number { return this._active; }
  get pooledCount(): number { return this.pool.length; }

  /**
   * @param factory    Creates a new item when the pool is empty
   * @param onAcquire  Called just before returning an item (reset / show it)
   * @param onRelease  Called when an item is returned (hide / zero fields)
   * @param preWarm    Number of instances to allocate immediately
   */
  constructor(
    factory: () => T,
    onAcquire: (item: T) => void,
    onRelease: (item: T) => void,
    preWarm: number = 0,
  ) {
    this.factory   = factory;
    this.onAcquire = onAcquire;
    this.onRelease = onRelease;

    for (let i = 0; i < preWarm; i++) {
      const item = factory();
      onRelease(item);   // put it in a "released" state
      this.pool.push(item);
    }
  }

  /** Get an item (from pool or freshly created) */
  acquire(): T {
    const item = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    this._active++;
    this.onAcquire(item);
    return item;
  }

  /** Return an item to the pool for future reuse */
  release(item: T): void {
    this._active = Math.max(0, this._active - 1);
    this.onRelease(item);
    this.pool.push(item);
  }

  /** Dispose all pooled items using a custom disposer */
  dispose(disposer: (item: T) => void): void {
    for (const item of this.pool) disposer(item);
    this.pool.length = 0;
    this._active = 0;
  }
}
