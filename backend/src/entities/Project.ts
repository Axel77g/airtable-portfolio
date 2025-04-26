export interface Project {
  slug: string;
  published: boolean;
  title: string;
  like: number;
  date: Date;
  content: string;
  images: ProjectImage[];
  image: ProjectImage;
}

export interface ProjectImage {
  filename: string;
  url: string;
  thumbnails: Record<"small" | "large" | "full", { url: string }>;
}

export type ProjectListItem = Omit<Project, "images" | "content">;
export type ProjectWithLikedStatus<T extends ProjectListItem | Project> = T & {
  liked: boolean;
};
