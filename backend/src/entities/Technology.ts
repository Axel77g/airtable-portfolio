export interface Technology {
    name:string,
    logo: {
        filename: string;
        url: string;
        thumbnails ?: Record<"small" | "large" | "full", { url?: string } | undefined>;
    },
}
