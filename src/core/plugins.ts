export type PluginType = "dom" | "store";

export interface Effect {
  plugin: PluginType;
  payload: any;
}

export interface DomEffect extends Effect {
  plugin: "dom";
  payload: {
    selector: string;
    action: "mount" | "update" | "unmount";
    template: any;
  };
}

export class Plugin {
  _next: (message: any) => void;
  constructor() {
    this._next = (_message) => {
      throw new Error("Not implemented");
    };
  }

  subscribe(next: (message: any) => void) {
    this._next = next;
  }

  apply(_effect: Effect) {
    throw new Error("Not implemented");
  }
}

export class DomPlugin extends Plugin {
  apply({ payload }: Effect) {
    if (payload.action === "mount") {
      this._mount(payload);
    }
  }

  _mount(payload: DomEffect["payload"]) {
    console.log(payload);
  }
}

export class StorePlugin extends Plugin {
  apply({ payload }: Effect) {
    console.log(payload);
  }
}
