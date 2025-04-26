import { ProjectListItem } from "../entities/Project";
import { PaginatedCollection } from "../types/PaginatedCollection";

export interface IProjectListRepository {
  findAll(query: {
    withDraft: boolean;
    search?: string;
  }): Promise<PaginatedCollection<ProjectListItem>>;
}
