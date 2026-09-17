export const EMPLOYEE_ROLES = ['Admin', 'Manager', 'Staff'] as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export type Employee = {
  id: string;
  email: string;
  displayName: string;
  role: EmployeeRole;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
};

export type CreateEmployeeModel = {
  email: string;
  password: string;
  displayName: string;
  role: EmployeeRole;
};

export type EmployeeFilterState = {
  keyword: string;
  sort: string;
  role: string;
  status: string;
};
