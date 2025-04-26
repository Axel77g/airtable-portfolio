import { User } from "../entities/User";

export interface IUserRepository {
  findByEmail(query: { email: string }): Promise<User | null>;
}
