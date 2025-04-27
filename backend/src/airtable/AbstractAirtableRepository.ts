import { Base, FieldSet, Record, Records, Query } from "airtable";
import { ZodType, z, ZodArray } from "zod";
import { AirtableCache } from "./AirtableCache/AirtableCache";
import { IAirtableCacheableQuery } from "./AirtableCache/IAirtableCacheableQuery";
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

  /**
   * Escapes special characters from the input string to ensure only valid filtering characters remain.
   */
  protected escapeFilteringCharacters(value: string) {
    return value.replace(/[^a-zA-Z0-9-+@.]/g, "");
  }

  /**
   * Executes a query using the cache mechanism by invoking the specified method on the provided query object.
   */
  protected executeQueryFromCache<Q extends IAirtableCacheableQuery>(
    query: Q,
    method: keyof Q,
  ) {
    return this.cache.executeQuery(query, method);
  }

  /**
   * Constructs an airtable filter string by combining multiple conditions with a logical operator.
   */
  protected buildFilter(
    conditions: string[] = [],
    operator: "AND" | "OR" = "AND",
  ) {
    if (conditions.length === 0) return "";

    const formatted = conditions.map((cond) => cond.trim()).filter(Boolean);

    if (formatted.length === 1) {
      return formatted[0];
    }

    return `${operator}(\n  ${formatted.join(",\n  ")}\n)`;
  }
}
