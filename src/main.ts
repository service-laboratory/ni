import "./style.css";

import { Users } from "users/users";

const users = new Users(document.getElementById("app") as HTMLElement);

users.mount();
