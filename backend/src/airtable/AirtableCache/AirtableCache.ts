import * as crypto from "node:crypto";
import { EventObserver } from "../../events/EventObserver";
import { AirtableCacheEntry } from "./AirtableCacheEntry";
import { IAirtableCacheableQuery } from "./IAirtableCacheableQuery";
import { EVENT_CLEAR_CACHE } from "../../events/ClearCacheEvent";

/**
 * A cache implementation extending the Map class designed to store and manage Airtable query results.
 * This cache is used to optimize repeated queries by saving their results and reducing redundant requests.
 */
export class AirtableCache extends Map<string, AirtableCacheEntry> {
  static MAX_CACHE_SIZE = 50;
  constructor() {
    super();
    EventObserver.getInstance().subscribe(
      EVENT_CLEAR_CACHE,
      this.clear.bind(this),
    );
  }

  public isCacheDisabled() {
    return false;
  }

  /**
   * Executes a query by checking the cache for the result.
   * If a cached version of the query exists and is still valid,
   * it returns the cached result.
   * Otherwise, it executes the query and stores the result in the cache.
   */
  public executeQuery<Q extends IAirtableCacheableQuery>(
    query: Q,
    method: keyof Q,
  ) {
    //Create a unique identifier for the given query using all the query parameters
    const queryFingerPrint = {
      table: query._table.name,
      method,
      ...query._params,
    };
    //Create a hash of the query finger print
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
    if (this.size == AirtableCache.MAX_CACHE_SIZE)
      this.removeTheNextOutdatedEntry();

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
