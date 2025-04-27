import { Query, Records } from "airtable";
import axios from "axios";

import { IAirtableCacheableQuery } from "./AirtableCache/IAirtableCacheableQuery";

/**
 * Décorateur pour la gestion de la mise en cache d'une requete paginé airtable
 *
 * Cette classe implémente une solution de contournement pour mettre en cache les query paginé de airtable
 * La librairie airtable ne fournit pas directement l'offset de pagination.
 * Avec ce decorateur on vient améliorer la query de base en ajoutant une methode paginate qui fait le call directement
 * Implemente IAirtableCacheableQuery qui est utilisé dans le systeme de mise en cache.
 **/
export class AirtableQueryPaginatedDecorator
  implements IAirtableCacheableQuery
{
  private axiosInstance = axios.create({
    baseURL: "https://api.airtable.com/v0",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    },
  });

  public constructor(
    private query: Query<any>,
    private page: number,
  ) {}

  private getTableAPIPath(): string {
    return `/${this.query._table._base._id}/${this.query._table.name}`;
  }

  public get _table() {
    return this.query._table;
  }

  public get _params() {
    return {
      ...this.query._params,
      page: this.page,
    };
  }

  /**
   * Fetches and paginates records based on the provided query parameters.
   * It navigates through multiple pages of data until the current page is reached,
   * returning the records and pagination metadata (indicating if there are previous or next pages).
   */
  async paginate(): Promise<
    [Records<any>, { hasNext: boolean; hasPrev: boolean }]
  > {
    const params = this.query._params;
    let offset = 0;
    let records = [];
    let currentPage = 1;
    do {
      try {
        let body = params;

        if (offset)
          body = {
            ...body,
            offset,
          };

        const response = await this.axiosInstance.post(
          `${this.getTableAPIPath()}/listRecords`,
          body,
        );

        const { offset: newOffset, records: newRecords } = response.data;
        offset = newOffset;

        if (currentPage == this.page) {
          records = newRecords;
          break;
        }

        currentPage++;
      } catch (e) {
        //@ts-ignore
        console.error(e, e?.response?.data);
        throw e;
        break;
      }
    } while (offset);

    return [
      records as Records<any>,
      {
        hasNext: offset != null,
        hasPrev: currentPage > 1,
      },
    ];
  }

  /**
   * Call the base decorated object's method
   */
  all() {
    return this.query.all();
  }

  /**
   * Call the base decorated object's method
   */
  eachPage(...args: any[]) {
    //@ts-ignore
    return this.query.eachPage(...args);
  }

  /**
   * Call the base decorated object's method
   */
  firstPage() {
    return this.query.firstPage();
  }
}
