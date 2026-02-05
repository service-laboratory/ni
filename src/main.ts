// import "./style.css";

import application from "app/application";
import { DomPlugin, StorePlugin } from "core/plugins";
import run from "core/run";

run(application, { dom: new DomPlugin(), store: new StorePlugin() }, { id: "start" });
