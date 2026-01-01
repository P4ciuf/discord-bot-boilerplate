export interface Event {
  name: string;
  once?: boolean;
  execute: (...args: unknown[]) => Promise<void> | void;
}
