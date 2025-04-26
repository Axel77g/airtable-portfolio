import { Project, ProjectListItem } from "../entities/Project";
import { IProjectRepository } from "../repositories/IProjectRepository";
import { PaginatedCollection } from "../types/PaginatedCollection";
import { AirtableResult } from "./AirtableResult";
import { AbstractAirtableRepository } from "./AbstractAirtableRepository";
import { z } from "zod";
import { IProjectListRepository } from "../repositories/IProjectListRepository";

const fieldSchema = z.object({
  slug: z.string(),
  title: z.string(),
  like: z.number(),
  date: z.union([
    z.string().transform((str) => {
      const date = new Date(str);
      if (isNaN(date.getTime())) {
        throw new Error("Date invalide");
      }
      return date;
    }),
    z.date(),
  ]),
  published: z.boolean().optional().default(false),
  images: z.array(z.any()),
});

export class AirtableProjectsListingRepository
  extends AbstractAirtableRepository<typeof fieldSchema>
  implements IProjectListRepository
{
  protected getTableName(): string {
    return "projects";
  }

  protected getFieldSchema() {
    return fieldSchema;
  }

  public async findAll(query: {
    withDraft: boolean;
    page: number;
    pageSize: number;
    cache?: boolean;
  }): Promise<PaginatedCollection<AirtableResult<ProjectListItem>>> {
    const { withDraft, page, pageSize, cache } = query;
    try {
      const offset = (page - 1) * pageSize;

      const totalQuery = this.getTable().select();
      const totalRecords =
        cache !== false
          ? await this.executeQueryFromCache(totalQuery, "all")
          : await totalQuery.all();

      const total = totalRecords.length;
      const totalPages = Math.ceil(total / pageSize);

      const query = this.getTable().select({
        fields: ["slug", "title", "like", "date", "images", "published"], //scope to the used fields
        filterByFormula: !withDraft ? `published = TRUE()` : "",
        maxRecords: pageSize,
        offset: offset,
      });

      const records =
        cache !== false
          ? await this.executeQueryFromCache(query, "all")
          : await query.all();

      const safeRecords = this.validateAll(records);
      const projects = safeRecords.map((record) =>
        this.convertToProjectListItem(record),
      );
      return {
        items: projects,
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
  }

  private convertToProjectListItem(
    record: z.infer<ReturnType<typeof this.getRecordSchema>>,
  ): AirtableResult<ProjectListItem> {
    const { id, fields } = record;
    return {
      _airtableId: id,
      slug: fields.slug,
      title: fields.title,
      like: fields.like || 0,
      published: fields.published,
      date: new Date(fields.date || Date.now()),
      image: fields.images[0] ?? null,
    };
  }
}
