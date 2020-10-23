import type { oRegistry } from "o-types";
import { Registry } from "./registry";

export class Kernel {
  registry: oRegistry;
  isLocal: boolean;
  events: any;

  private constructor() {
    this.isLocal = window.location.hostname == "localhost"
      || window.location.hostname == "127.0.0.1"
      || window.location.hostname == "omo.local";
    this.registry = new Registry();
  }

  static async boot(): Promise<Kernel> {
    return new Kernel();
  }
}
