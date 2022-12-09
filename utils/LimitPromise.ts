/** @format */

/**
 * limit the axios request number
 */
export default class LimitPromise {
    private _max: number;
    private _count: number;
    private _taskQueue: any[];
  
    constructor(max: number) {
      // maxmal async task number
      this._max = max || 6;
      // the number of runing task
      this._count = 0;
      // waiting tasks
      this._taskQueue = [];
    }
  
    /**
     * caller 
     * @param caller task function，must be async function or function that return Promise
     * @param args async function arguments
     * @returns {Promise<unknown>} return Promise
     */
    call(caller: (...arg: any[]) => any) {
      return new Promise((resolve, reject) => {
        const task = this._createTask(caller, resolve, reject);
        if (this._count >= this._max) {
          this._taskQueue.push(task);
        } else {
          task();
        }
      });
    }
  
    /**
     * create task
     * @param caller 
     * @param args 
     * @param resolve
     * @param reject
     * @returns {Function} return a function
     * @private
     */
    _createTask(
      caller: (...arg: any[]) => any,
      resolve: (value: any | PromiseLike<any>) => void,
      reject: (reason?: any) => void
    ) {
      return () => {
        // call the async function
        caller()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            // next task
            this._count--;
            if (this._taskQueue.length) {
              const task = this._taskQueue.shift();
              task();
            }
          });
        this._count++;
      };
    }
  }
  