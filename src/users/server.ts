import { faker } from "@faker-js/faker";
import type { UserType } from "./types";

export interface PaginationParams {
  page: number;
  limit: number;
}

export class UsersServer {
  users: UserType[];
  delay: number;
  constructor(delay: number = 0) {
    this.users = [];
    this.delay = delay;
    if (localStorage.getItem("users")) {
      this.users = JSON.parse(localStorage.getItem("users") || "[]");
      return;
    }
    this.generateUsers();
  }

  generateUsers() {
    this.users = faker.helpers.uniqueArray(faker.internet.email, 1000).map((email) => {
      return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email,
      };
    });

    localStorage.setItem("users", JSON.stringify(this.users));
  }

  removeUser(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.users = this.users.filter((user) => user.id !== id);
        localStorage.setItem("users", JSON.stringify(this.users));
        resolve();
      }, this.delay);
    });
  }

  loadUsers(
    params: PaginationParams = { page: 1, limit: 10 },
    searchQuery: string = "",
  ): Promise<{ count: number; users: UserType[]; page: number }> {
    return new Promise((resolve) => {
      const filteredUsers = this.users.filter((user) => {
        if (!searchQuery) return true;
        return (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      setTimeout(() => {
        resolve({
          count: filteredUsers.length,
          users: filteredUsers.slice((params.page - 1) * params.limit, params.page * params.limit),
          page: params.page,
        });
      }, this.delay);
    });
  }

  reset() {
    localStorage.clear();
    this.generateUsers();
  }
}
