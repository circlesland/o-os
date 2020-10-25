import type { oRegistry } from "@omoearth/o-types";
import { Registry } from "./Registry";
import { SessionService } from "./SessionService";

export class Kernel {
  registry: oRegistry;
  isLocal: boolean;
  session: SessionService;

  private constructor(sessionService:SessionService,registry:Registry) {
    this.isLocal = window.location.hostname == "localhost"
      || window.location.hostname == "127.0.0.1"
      || window.location.hostname == "omo.local";
    this.registry = registry;
    this.session = sessionService;
  }

  static async boot(): Promise<Kernel> {
    var sessionServicePromise = SessionService.GetInstance();
    var registryPromise = Registry.init();
    var result = await Promise.all([sessionServicePromise, registryPromise])
    return new Kernel(...result);
  }
}
