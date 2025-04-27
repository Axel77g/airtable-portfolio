import { Records } from "airtable";

export interface IAirtableCacheableQuery {
  _table: any;
  _params: any;

  all(): Promise<Records<any>>;

  eachPage(...args: any[]): Promise<any>;

  firstPage(): Promise<Records<any>>;

  paginate?(): Promise<any>;
}
