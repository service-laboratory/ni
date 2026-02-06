export interface UserType {
  id: string;
  name: string;
  email: string;
  roles: RoleType[];
}

export interface RoleType {
  id: string;
  name: string;
  permissions: PermissionType[];
}

export interface PermissionType {
  id: string;
  name: string;
}
