import type { Effect, Plugin, PluginType } from "./plugins";

export interface Message {
  id: string;
  payload?: any;
}

export class Application {
  scope: string;
  applications: Application[];

  constructor(scope: string, applications: Application[] = []) {
    this.scope = scope;
    this.applications = applications;
  }

  compute(message: Message): Effect[] {
    const rootEffects = message.id in this ? (this as any)[message.id](message) : [];
    const childEffects = this.applications.flatMap((app) => app.compute(message));
    return [...rootEffects, ...childEffects];
  }
}

export type Plugins = {
  [key in PluginType]: Plugin;
};

export default function run(app: Application, plugins: Plugins, initMessage: Message) {
  const next = (message: any) => {
    const effects = app.compute(message);
    effects.forEach((effect: Effect) => {
      plugins[effect.plugin].apply(effect);
    });
  };

  Object.values(plugins).forEach((plugin) => {
    plugin.subscribe(next);
  });

  next(initMessage);
}
