import { Technology } from "./Technology";

export interface Project {
  slug: string;
  published: boolean;
  title: string;
  like: number;
  date: Date;
  content: string;
  images: ProjectImage[];
  image: ProjectImage;
  technologies: Technology[];
}

export interface ProjectImage {
  filename: string;
  url: string;
  thumbnails ?: Record<"small" | "large" | "full", { url?: string } | undefined>;
}

export type ProjectListItem = Omit<Project, "images" | "content"| "technologies">;
export type ProjectWithLikedStatus<T extends ProjectListItem | Project> = T & {
  liked: boolean;
};
