import html from "../html";
import server, { Server, type PaginationParams } from "../server";
import type { UserType } from "../types";

export class Users {
  mountElement: HTMLElement;
  server: Server;
  pagination: PaginationParams;
  searchQuery: string;

  constructor(mountElement: HTMLElement) {
    this.server = server;
    this.pagination = JSON.parse(
      localStorage.getItem("pagination") || '{"page": 1, "limit": 10 }',
    );
    this.searchQuery = localStorage.getItem("search") || "";
    this.mountElement = mountElement;
    this.data = {
      count: 0,
      page: 1,
      users: [],
    };
  }
  data: {
    count: number;
    page: number;
    users: UserType[];
  };

  loadUsers() {
    this.setLoading(true);
    return this.server
      .loadUsers(this.pagination, this.searchQuery)
      .then((data) => {
        this.data = data;
        this.setLoading(false);
      });
  }

  setLoading(isLoading: boolean) {
    const containerElement = this.mountElement.querySelector(
      `#${html.IDs.userTableContainerID}`,
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

  async updateUsers() {
    await this.loadUsers();
    return this.renderUsers();
  }

  renderUsers() {
    const userTable = this.mountElement.querySelector(
      `#${html.IDs.userTableContainerID}`,
    ) as HTMLElement;
    userTable.innerHTML = html.getUserRowsHTML(
      this.data.users,
      this.searchQuery,
    );
  }

  initUsersEvents() {
    this.mountElement.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains("delete-button")) {
        const userId = target.getAttribute("data-id");
        this.setLoading(true);
        this.server
          .removeUser(userId as string)
          .then(() => {
            return this.loadUsers();
          })
          .then(() => {
            if (this.pagination.page > this.getPageCount()) {
              this.pagination.page = this.getPageCount();
            }
            return this.loadUsers();
          })
          .then(() => {
            this.updateUsers();
            this.updatePagination();
          });
      }
    });
  }

  updateUsersAndPagination = () => {
    this.updateUsers()
      .then(() => {
        if (this.pagination.page > this.getPageCount()) {
          this.pagination.page = this.getPageCount();
        }
        return this.loadUsers();
      })
      .then(() => {
        this.updateUsers();
        this.updatePagination();
      });
  };

  initPaginationEvents() {
    this.mountElement.addEventListener("change", (event) => {
      if ((event.target as HTMLSelectElement).id === "select-page-count") {
        this.pagination.limit = Number(
          (event.target as HTMLSelectElement).value,
        );
        this.updateUsersAndPagination();
      }
    });

    this.mountElement
      .querySelector(".pagination")
      ?.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;

        if (target.id === "prev-page") {
          this.pagination.page--;
          this.updateUsersAndPagination();
        }

        if (target.id === "next-page") {
          this.pagination.page++;
          this.updateUsersAndPagination();
        }

        if (target.classList.contains("pagination-page-button")) {
          const page = target.getAttribute("data-page");
          this.pagination.page = parseInt(page as string);
          this.updateUsersAndPagination();
        }

        if (target.classList.contains("pagination-start")) {
          this.pagination.page = 1;
          this.updateUsersAndPagination();
        }

        if (target.classList.contains("pagination-end")) {
          this.pagination.page = this.getPageCount();
          this.updateUsersAndPagination();
        }
      });
  }

  initSearchEvents() {
    const searchInput = this.mountElement.querySelector(
      "#search-input",
    ) as HTMLInputElement;
    searchInput?.addEventListener("input", () => {
      this.searchQuery = searchInput?.value as string;
      localStorage.setItem("search", searchInput.value);
      this.pagination.page = 1;
      this.updateUsers().then(() => {
        this.updatePagination();
      });
    });
  }

  mount() {
    this.mountElement.innerHTML = html.getContainerHTML(this.searchQuery);
    this.updateUsers().then(() => {
      this.initUsersEvents();
      this.updatePagination();
      this.initPaginationEvents();
      this.initSearchEvents();
    });

    const resetButton = this.mountElement.querySelector("#reset");
    resetButton?.addEventListener("click", () => {
      this.server.reset();
      this.updateUsers().then(() => {
        this.updatePagination();
      });
    });
  }

  updatePagination() {
    const paginationContainer = this.mountElement.querySelector(
      `#${html.IDs.paginationContainerID}`,
    ) as HTMLElement;
    paginationContainer.innerHTML = html.getPaginationHTML({
      limit: this.pagination.limit,
      page: this.pagination.page,
      total: this.getPageCount(),
    });

    localStorage.setItem("pagination", JSON.stringify(this.pagination));
  }
}
