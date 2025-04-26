export type AirtableResult<T> = T & {
    _airtableId: string;
}
