import { Query } from "airtable";
import * as crypto from "node:crypto";
import { EventObserver } from "../events/EventObserver";

class AirtableCacheEntry {
  public constructor(
    public readonly records: any,
    public readonly date: Date = new Date(),
  ) {}

  isOutdated() {
    return new Date().getTime() - this.date.getTime() > 1000 * 60 * 30;
  }
}

export class AirtableCache extends Map<string, AirtableCacheEntry> {
  constructor() {
    super();
    EventObserver.getInstance().subscribe("cache:clear", this.clear.bind(this));
  }

  public isCacheDisabled() {
    return false;
  }

  /**
   * Executes a query by checking the cache for the result.
   * If a cached version of the query exists and is still valid,
   * it returns the cached result. Otherwise, it executes the query and stores the result in the cache.
   */
  public executeQuery<Q extends Query<any>>(query: Q, method: keyof Q) {
    //Create a unique identifier for the given query using all the query parameters
    const queryFingerPrint = {
      table: query._table.name,
      method,
      ...query._params,
    };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(queryFingerPrint))
      .digest("hex");

    if (this.has(hash) && !this.isCacheDisabled()) {
      console.log(`[${"\x1b[32m"}CACHE HIT${"\x1b[0m"}] for query ${hash}`);
      const entry = this.get(hash) as AirtableCacheEntry;
      if (!entry.isOutdated()) {
        return entry.records;
      }
    }
    //limit cache size prevent memory leak
    if (this.size == 10) this.removeTheNextOutdatedEntry();

    //@ts-ignore
    const records = query[method]();
    if (records == null || records.length == 0) return records; //do not cache empty query result
    console.log(`[${"\x1b[31m"}CACHE MISS${"\x1b[0m"}] for query ${hash}`);
    this.set(hash, new AirtableCacheEntry(records));
    return records;
  }

  private removeTheNextOutdatedEntry() {
    const entries = Array.from(this.entries());
    entries.sort((a, b) => a[1].date.getTime() - b[1].date.getTime());
    this.delete(entries[0][0]);
  }
}
