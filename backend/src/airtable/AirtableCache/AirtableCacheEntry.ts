export class AirtableCacheEntry {
  public constructor(
    public readonly records: any,
    public readonly date: Date = new Date(),
  ) {}

  isOutdated() {
    return new Date().getTime() - this.date.getTime() > 1000 * 60 * 30;
  }
}
