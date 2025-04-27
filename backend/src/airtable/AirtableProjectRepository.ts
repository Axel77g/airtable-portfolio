import { Project } from "../entities/Project";
import { IProjectRepository } from "../repositories/IProjectRepository";
import { AirtableResult } from "./AirtableResult";
import { AbstractAirtableRepository } from "./AbstractAirtableRepository";
import { z } from "zod";
import { EventObserver } from "../events/EventObserver";
import { ClearCacheEvent } from "../events/ClearCacheEvent";

const fieldSchema = z.object({
  slug: z.string(),
  published: z.boolean().optional().default(false),
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
  content: z.string(),
  images: z.array(z.any()),
  image: z.any(),
});

export class AirtableProjectRepository
  extends AbstractAirtableRepository<typeof fieldSchema>
  implements IProjectRepository
{
  protected getTableName(): string {
    return "projects";
  }

  protected getFieldSchema() {
    return fieldSchema;
  }

  public async findBySlug(queryArgs: {
    slug: string;
    withDraft?: boolean;
    cache?: boolean;
  }): Promise<AirtableResult<Project> | null> {
    const { slug, withDraft, cache } = queryArgs;
    try {
      if (!slug) return null;

      const filterByFormula = !withDraft
        ? `AND({slug} = '${this.escapeFilteringCharacters(slug)}', {published} = TRUE())`
        : `{slug} = '${this.escapeFilteringCharacters(slug)}'`;

      const query = this.getTable().select({
        filterByFormula: filterByFormula,
      });

      const records =
        cache !== false
          ? await this.executeQueryFromCache(query, "all")
          : await query.all();

      if (records.length === 0) return null;

      return this.convertToProject(this.validate(records[0]));
    } catch (error) {
      console.error(
        `Erreur lors de la recherche du projet avec slug ${slug}:`,
        error,
      );
      throw error;
    }
  }

  public async likeProject(query: {
    slug: string;
    dislike: boolean;
    withDraft?: boolean;
  }): Promise<AirtableResult<Project> | null> {
    const { slug, dislike, withDraft } = query;
    try {
      const project = await this.findBySlug({
        slug,
        withDraft,
        cache: false,
      });

      if (!project) {
        return null;
      }
      const currentLikes = project.like || 0;

      const updatedRecord = await this.getTable().update(project._airtableId, {
        like: currentLikes + (dislike ? -1 : 1),
      });

      return this.convertToProject(this.validate(updatedRecord));
    } catch (error) {
      console.error(`Erreur lors du like du projet avec slug ${slug}:`, error);
      throw error;
    }
  }

  public async setPublishProject(query: {
    slug: string;
    value: boolean;
    withDraft?: boolean;
  }): Promise<AirtableResult<Project> | null> {
    const { slug, value, withDraft } = query;
    try {
      const project = await this.findBySlug({ slug, withDraft, cache: false });
      if (!project) {
        return null;
      }

      const updatedRecord = await this.getTable().update(project._airtableId, {
        published: value,
      });

      //invalidate the app caches
      EventObserver.getInstance().emit(ClearCacheEvent);

      return this.convertToProject(this.validate(updatedRecord));
    } catch (error) {
      console.error(
        `Erreur lors de la modification de l'état de publication du projet avec slug ${slug}:`,
        error,
      );
      throw error;
    }
  }

  private convertToProject(
    record: z.infer<ReturnType<typeof this.getRecordSchema>>,
  ): AirtableResult<Project> {
    const { id, fields } = record;
    return {
      _airtableId: id,
      slug: fields.slug || "",
      published: fields.published || false,
      title: fields.title || "",
      like: fields.like || 0,
      date: new Date(fields.date || Date.now()),
      content: fields.content || "",
      images: fields.images,
      image: fields.image,
    };
  }
}
