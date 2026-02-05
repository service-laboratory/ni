import { Application } from "core/run";

class RootApplication extends Application {
  start(message) {
    return [];
  }
}

class UserApplication extends Application {
  start(message) {
    console.log("user app");
    return [];
  }
}

const app = new RootApplication("root", [new UserApplication("user")]);

export default app;
