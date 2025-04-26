import { Project } from "../entities/Project";

export interface IProjectRepository {
  findBySlug(query: {
    slug: string;
    withDraft: boolean;
  }): Promise<Project | null>;
  likeProject(query: {
    slug: string;
    dislike: boolean;
  }): Promise<Project | null>;
  setPublishProject(query: {
    slug: string;
    value: boolean;
  }): Promise<Project | null>;
}
