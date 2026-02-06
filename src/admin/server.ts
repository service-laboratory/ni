import { faker } from "@faker-js/faker";
import type { PermissionType, RoleType, UserType } from "./types";

export interface PaginationParams {
  page: number;
  limit: number;
}

export class Server {
  data: {
    users: UserType[];
    roles: RoleType[];
    permissions: PermissionType[];
  };
  delay: number;
  constructor(delay: number = 0) {
    this.data = {
      users: [],
      roles: [],
      permissions: [],
    };

    this.delay = delay;
    if (localStorage.getItem("data")) {
      this.data = JSON.parse(
        localStorage.getItem("data") ||
          '{"users": [], "roles": [], "permissions": []}',
      );
      return;
    }
    this.generate();
  }

  generate() {
    const permissions = faker.helpers
      .uniqueArray(faker.lorem.word, 100)
      .map((name) => {
        return {
          id: faker.string.uuid(),
          name,
        };
      });

    const roles = faker.helpers
      .uniqueArray(faker.lorem.word, 100)
      .map((name) => {
        return {
          id: faker.string.uuid(),
          name,
          permissions: faker.helpers
            .uniqueArray(permissions, faker.number.int({ min: 1, max: 10 }))
            .map((permission) => permission),
        };
      });

    const users = faker.helpers
      .uniqueArray(faker.internet.email, 1000)
      .map((email) => {
        return {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email,
          roles: faker.helpers
            .uniqueArray(roles, faker.number.int({ min: 1, max: 10 }))
            .map((role) => role),
        };
      });
    this.data = {
      users,
      roles,
      permissions,
    };
    this._updateLocalStorage();
  }

  removeRole(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data.roles = this.data.roles.filter((role) => role.id !== id);
        this.data.users = this.data.users.map((user) => {
          user.roles = user.roles.filter((role) => role.id !== id);
          return user;
        });
        this._updateLocalStorage();
        resolve();
      }, this.delay);
    });
  }

  removePermission(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data.permissions = this.data.permissions.filter(
          (permission) => permission.id !== id,
        );
        this.data.roles = this.data.roles.map((role) => {
          role.permissions = role.permissions.filter(
            (permission) => permission.id !== id,
          );
          return role;
        });
        this._updateLocalStorage();
        resolve();
      }, this.delay);
    });
  }

  removeUser(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data.users = this.data.users.filter((user) => user.id !== id);
        this._updateLocalStorage();
        resolve();
      }, this.delay);
    });
  }

  editUser(id: string, user: UserType): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.data.users.findIndex((u) => u.id === id);
        if (index !== -1) {
          this.data.users[index] = user;
          this._updateLocalStorage();
        }
        resolve();
      }, this.delay);
    });
  }

  addUser(user: UserType): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.data.users.push(user);
        this._updateLocalStorage();
        resolve();
      }, this.delay);
    });
  }

  loadRoles(
    params: PaginationParams = { page: 1, limit: 10 },
    searchQuery: string = "",
  ): Promise<{ count: number; items: RoleType[]; page: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredValues = this.data.roles.filter((role) => {
          return role.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        resolve({
          page: params.page,
          count: filteredValues.length,
          items: filteredValues.slice(
            (params.page - 1) * params.limit,
            params.page * params.limit,
          ),
        });
      }, this.delay);
    });
  }

  loadUsers(
    params: PaginationParams = { page: 1, limit: 10 },
    searchQuery: string = "",
  ): Promise<{ count: number; users: UserType[]; page: number }> {
    return new Promise((resolve) => {
      const filteredUsers = this.data.users.filter((user) => {
        if (!searchQuery) return true;
        return (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      setTimeout(() => {
        resolve({
          count: filteredUsers.length,
          users: filteredUsers.slice(
            (params.page - 1) * params.limit,
            params.page * params.limit,
          ),
          page: params.page,
        });
      }, this.delay);
    });
  }

  _updateLocalStorage() {
    localStorage.setItem("data", JSON.stringify(this.data));
  }

  reset() {
    localStorage.clear();
    this.generate();
  }
}

const server = new Server(0);

export default server;
