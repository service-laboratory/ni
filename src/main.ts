import { Roles } from "./admin/pages/roles";
import { Users } from "./admin/pages/users";
import "./style.css";

class Main {
  mountElement: HTMLElement;
  contentElement: HTMLElement | null;
  routing: Record<string, typeof Users | typeof Roles>;

  constructor(mountElement: HTMLElement) {
    this.mountElement = mountElement;
    this.contentElement = null;
    this.routing = {
      "/users": Users,
      "/roles": Roles,
    };
  }

  renderPage() {
    const route = this.getRoute();
    const Page = this.routing[route];
    if (Page) {
      const page = new Page(this.contentElement as HTMLElement);
      page.mount();
    }
  }

  getRoute() {
    const url = new URL(window.location.href);
    return url.pathname;
  }

  getHtml = () => {
    return `<main class="main">
      <aside class="sidebar">
        <h2>Navigation</h2>
        <ul>
          <li><a href="/users">Users</a></li>
          <li><a href="/roles">Roles</a></li>
          <li><a href="/permissions">Permissions</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </aside>
      <div id="content">
        ...
      </div>
    </main>`;
  };

  initAsideEvents() {
    const links = document.querySelectorAll(".sidebar a");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const href = link.getAttribute("href");
        if (this.getRoute() === href) return;

        if (href) {
          window.history.pushState({}, "", href);
          this.renderPage();
        }
      });
    });
  }

  mount() {
    this.mountElement.innerHTML = this.getHtml();
    this.contentElement = document.getElementById("content") as HTMLElement;
    this.initAsideEvents();

    this.renderPage();
  }
}

const main = new Main(document.getElementById("app")!);
main.mount();
