import { ProjectListItem } from "../entities/Project";
import { PaginatedCollection } from "../types/PaginatedCollection";
import { AirtableResult } from "./AirtableResult";
import { AbstractAirtableRepository } from "./AbstractAirtableRepository";
import { z } from "zod";
import { IProjectListRepository } from "../repositories/IProjectListRepository";
import { AirtableQueryPaginatedDecorator } from "./AirtableQueryPaginatedDecorator";

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
    search?: string;
    cache?: boolean;
  }): Promise<PaginatedCollection<AirtableResult<ProjectListItem>>> {
    const { withDraft, page, pageSize, cache, search } = query;
    try {
      const conditions: string[] = [];

      if (search) {
        const safeSearch = this.escapeFilteringCharacters(search);
        let subConditions: string[] = [
          `FIND(LOWER('${safeSearch}'), LOWER({title}))`,
          `FIND(LOWER('${safeSearch}'), LOWER({slug}))`,
          `FIND(LOWER('${safeSearch}'), LOWER({content}))`,
        ];
        conditions.push(this.buildFilter(subConditions, "OR"));
      }

      if (!withDraft) conditions.push(`published = TRUE()`);

      const query = this.getTable().select({
        fields: ["slug", "title", "like", "date", "images", "published"],
        filterByFormula: this.buildFilter(conditions, "AND"),
        pageSize,
      });

      const decoratedQuery = new AirtableQueryPaginatedDecorator(query, page);
      const [records, pagination] = await this.executeQueryFromCache(
        decoratedQuery,
        "paginate",
      );
      const safeRecords = this.validateAll(records);
      const projects = safeRecords.map((record) =>
        this.convertToProjectListItem(record),
      );
      return {
        items: projects,
        page,
        pageSize,
        hasNextPage: pagination.hasNext,
        hasPreviousPage: pagination.hasPrev,
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
