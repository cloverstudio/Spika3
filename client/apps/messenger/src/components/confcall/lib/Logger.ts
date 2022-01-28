export class Logger {
  private _output: boolean = false;
  private _prefix: string;
  private _listeners: Array<Function>;

  constructor(prefix: string, output: boolean = false) {
    this._prefix = prefix;
    this._output = output;
    this._listeners = [];
  }

  debug(obj: any): void {
    if (!this._output) return;

    const output = `${this._prefix} debug: ${obj}`;
    console.log(output);
    this._listeners.map((func) => func("debug", `${obj}`));
  }

  warn(obj: any): void {
    const output = `${this._prefix} warn: ${obj}`;
    console.warn(output);
    this._listeners.map((func) => func("warn", `${obj}`));
  }

  error(obj: any): void {
    const output = `${this._prefix} error: ${obj}`;
    console.error(output);
    this._listeners.map((func) => func("error", `${obj}`));
  }

  addListener(listener: Function): void {
    this._listeners.push(listener);
  }
}
