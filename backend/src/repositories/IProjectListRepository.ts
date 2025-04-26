import { ProjectListItem } from "../entities/Project";
import { PaginatedCollection } from "../types/PaginatedCollection";

export interface IProjectListRepository {
  findAll(query: {
    withDraft: boolean;
  }): Promise<PaginatedCollection<ProjectListItem>>;
}
