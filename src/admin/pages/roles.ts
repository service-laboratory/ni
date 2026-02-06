import type { RoleType } from "../types";
import html from "../html";
import server, { Server, type PaginationParams } from "../server";

export class Roles {
  mountElement: HTMLElement;
  server: Server;
  pagination: PaginationParams;
  searchQuery: string;
  data: {
    count: number;
    page: number;
    items: RoleType[];
  };

  constructor(mountElement: HTMLElement) {
    this.mountElement = mountElement;
    this.server = server;
    this.pagination = JSON.parse(
      localStorage.getItem("roles-pagination") || '{"page": 1, "limit": 10 }',
    );
    this.searchQuery = localStorage.getItem("roles-search") || "";
    this.data = {
      count: 0,
      page: 1,
      items: [],
    };
  }

  loadRoles() {
    this.setLoading(true);
    return this.server
      .loadRoles(this.pagination, this.searchQuery)
      .then((data) => {
        this.data = data;
        this.setLoading(false);
      });
  }

  setLoading(isLoading: boolean) {
    const containerElement = this.mountElement.querySelector(
      `#${html.IDs.roleTableContainerID}`,
    ) as HTMLElement;

    if (isLoading) {
      containerElement.classList.add("loading");
    } else {
      containerElement.classList.remove("loading");
    }
  }

  getPageCount() {
    return Math.ceil(this.data.count / this.pagination.limit) || 1;
  }

  async updateRoles() {
    await this.loadRoles();
    return this.renderRoles();
  }

  renderRoles() {
    const roleTable = this.mountElement.querySelector(
      `#${html.IDs.roleTableContainerID}`,
    ) as HTMLElement;
    roleTable.innerHTML = html.getRoleRowsHTML(this.data.items, this.searchQuery);
  }

  initRolesEvents() {
    this.mountElement.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("delete-button")) {
        const roleId = target.getAttribute("data-id");
        this.setLoading(true);
        this.server
          .removeRole(roleId as string)
          .then(() => {
            return this.loadRoles();
          })
          .then(() => {
            if (this.pagination.page > this.getPageCount()) {
              this.pagination.page = this.getPageCount();
            }
            return this.loadRoles();
          })
          .then(() => {
            this.updateRoles();
            this.updatePagination();
          });
      }
    });
  }

  updateRolesAndPagination = () => {
    this.updateRoles()
      .then(() => {
        if (this.pagination.page > this.getPageCount()) {
          this.pagination.page = this.getPageCount();
        }
        return this.loadRoles();
      })
      .then(() => {
        this.updateRoles();
        this.updatePagination();
      });
  };

  initPaginationEvents() {
    this.mountElement.addEventListener("change", (event) => {
      if ((event.target as HTMLSelectElement).id === "select-page-count") {
        this.pagination.limit = Number(
          (event.target as HTMLSelectElement).value,
        );
        this.updateRolesAndPagination();
      }
    });

    this.mountElement
      .querySelector(".pagination")
      ?.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;

        if (target.id === "prev-page") {
          this.pagination.page--;
          this.updateRolesAndPagination();
        }

        if (target.id === "next-page") {
          this.pagination.page++;
          this.updateRolesAndPagination();
        }

        if (target.classList.contains("pagination-page-button")) {
          const page = target.getAttribute("data-page");
          this.pagination.page = parseInt(page as string);
          this.updateRolesAndPagination();
        }

        if (target.classList.contains("pagination-start")) {
          this.pagination.page = 1;
          this.updateRolesAndPagination();
        }

        if (target.classList.contains("pagination-end")) {
          this.pagination.page = this.getPageCount();
          this.updateRolesAndPagination();
        }
      });
  }

  initSearchEvents() {
    const searchInput = this.mountElement.querySelector(
      "#role-search-input",
    ) as HTMLInputElement;
    searchInput?.addEventListener("input", () => {
      this.searchQuery = searchInput?.value as string;
      localStorage.setItem("roles-search", searchInput.value);
      this.pagination.page = 1;
      this.updateRoles().then(() => {
        this.updatePagination();
      });
    });
  }

  mount() {
    this.mountElement.innerHTML = html.getRolesContainerHTML(this.searchQuery);
    this.updateRoles().then(() => {
      this.initRolesEvents();
      this.updatePagination();
      this.initPaginationEvents();
      this.initSearchEvents();
    });

    const resetButton = this.mountElement.querySelector("#reset-roles");
    resetButton?.addEventListener("click", () => {
      this.server.reset();
      this.updateRoles().then(() => {
        this.updatePagination();
      });
    });
  }

  updatePagination() {
    const paginationContainer = this.mountElement.querySelector(
      `#${html.IDs.rolePaginationContainerID}`,
    ) as HTMLElement;
    paginationContainer.innerHTML = html.getPaginationHTML({
      limit: this.pagination.limit,
      page: this.pagination.page,
      total: this.getPageCount(),
    });

    localStorage.setItem("roles-pagination", JSON.stringify(this.pagination));
  }
}
