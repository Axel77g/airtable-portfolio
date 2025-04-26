import { Base, FieldSet, Record, Records, Query } from "airtable";
import { ZodType, z, ZodArray } from "zod";
import * as crypto from "node:crypto";
import { AirtableCache } from "./AirtableCache";
export abstract class AbstractAirtableRepository<T extends ZodType> {
  /***
   * @param {Base} base - The airtable base injection
   */
  constructor(
    private base: Base,
    private cache: AirtableCache = new AirtableCache(),
  ) {}

  /***
   * @return {string} The name of the table as a string.
   */
  protected abstract getTableName(): string;

  /**
   * @return The table airtable instance corresponding to the table name.
   */
  protected getTable() {
    return this.base(this.getTableName());
  }

  /**
   * An abstract method that retrieves the schema definition for a specific field. Generic Return
   **/
  protected abstract getFieldSchema(): T;

  /**
   * Retrieves and returns a typed version of an Airtable Record
   */
  protected getRecordSchema() {
    return z.object({
      id: z.string().min(1),
      fields: this.getFieldSchema(),
    });
  }

  /**
   * Return a typed version of an Airtable records collection
   */
  protected getArraySchema(): ZodArray<
    ReturnType<typeof this.getRecordSchema>
  > {
    return z.array(this.getRecordSchema());
  }

  /**
   * Validate a typed airtable record according the repository type
   */
  protected validate(
    record: Record<FieldSet>,
  ): z.infer<ReturnType<typeof this.getRecordSchema>> {
    return this.getRecordSchema().parse(record);
  }

  /**
   * Return a typed airtable collection record the repository type
   */
  protected validateAll(
    records: Records<FieldSet>,
  ): z.infer<ReturnType<typeof this.getRecordSchema>>[] {
    return this.getArraySchema().parse(records);
  }

  protected escapeFilteringCharacters(value: string) {
    return value.replace(/[^a-zA-Z0-9-+@.]/g, "");
  }

  protected executeQueryFromCache<Q extends Query<any>>(
    query: Q,
    method: keyof Q,
  ) {
    return this.cache.executeQuery(query, method);
  }
}
