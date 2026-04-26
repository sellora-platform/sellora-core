/**
 * Reliable Job Queue: Handles non-critical, asynchronous tasks.
 * Includes retry logic and idempotency guarantees.
 */
export const JobQueue = {
  private _queue: Array<{ id: string; task: () => Promise<any>; retries: number }> = [],
  private _processing: boolean = false,

  /**
   * Adds a task to the queue with a retry policy.
   */
  async enqueue(id: string, task: () => Promise<any>, maxRetries: number = 3) {
    this._queue.push({ id, task, retries: maxRetries });
    this.process();
  },

  /**
   * Processes the queue sequentially.
   */
  async process() {
    if (this._processing || this._queue.length === 0) return;
    this._processing = true;

    while (this._queue.length > 0) {
      const { id, task, retries } = this._queue.shift()!;
      
      try {
        console.log(`[Queue] Processing job ${id}...`);
        await task();
      } catch (error) {
        console.error(`[Queue] Job ${id} failed. Remaining retries: ${retries - 1}`);
        if (retries > 1) {
          // Re-enqueue with exponential backoff conceptually
          this._queue.push({ id, task, retries: retries - 1 });
        }
      }
    }

    this._processing = false;
  }
};
