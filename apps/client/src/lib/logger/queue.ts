export class Queue {
  private name: string;
  private memoryQueue: unknown[] = [];

  constructor(name: string) {
    this.name = name;
    this.loadFromStorage();
  }

  enqueue(item: unknown) {
    this.memoryQueue.push(item);
    if (this.memoryQueue.length > 100) {
      this.memoryQueue.shift(); // Drop oldest if full
    }
    this.saveToStorage();
  }

  async dequeueAll(): Promise<unknown[]> {
    const items = [...this.memoryQueue];
    this.memoryQueue = [];
    this.saveToStorage();
    return items;
  }

  private saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.name, JSON.stringify(this.memoryQueue));
      } catch {
        console.warn('Failed to save log queue to localStorage');
      }
    }
  }

  private loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.name);
        if (stored) {
          this.memoryQueue = JSON.parse(stored) as unknown[];
        }
      } catch {
        this.memoryQueue = [];
      }
    }
  }

  get length() {
    return this.memoryQueue.length;
  }
}
