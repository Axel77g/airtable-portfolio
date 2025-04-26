export interface User {
  fullName: string;
  email: string;
  password: string;
}

export function hidePassword(user: User) {
  return {
    ...user,
    password: undefined,
  };
}
