import { IUserRepository } from "../repositories/IUserRepository";
import { User } from "../entities/User";
import { AirtableResult } from "./AirtableResult";
import { z } from "zod";
import { AbstractAirtableRepository } from "./AbstractAirtableRepository";

const fieldSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

export class AirtableUserRepository
  extends AbstractAirtableRepository<typeof fieldSchema>
  implements IUserRepository
{
  protected getTableName(): string {
    return "users";
  }

  protected getFieldSchema() {
    return fieldSchema;
  }

  public async findByEmail(query: {
    email: string;
  }): Promise<AirtableResult<User> | null> {
    const { email } = query;
    try {
      if (email == null) return null;
      const records = await this.getTable()
        .select({
          filterByFormula: `{email} = '${this.escapeFilteringCharacters(email)}'`,
        })
        .all();
      if (records.length !== 1) {
        return null;
      }

      return this.convertToUser(this.validate(records[0]));
    } catch (error) {
      console.error(
        `Erreur lors de la recherche de l'utilisateur avec email ${email}:`,
        error,
      );
      throw error;
    }
  }

  private convertToUser(
    record: z.infer<ReturnType<typeof this.getRecordSchema>>,
  ): AirtableResult<User> {
    const { id, fields } = record;
    return {
      _airtableId: id,
      fullName: fields.fullName || "",
      email: fields.email || "",
      password: fields.password || "",
    };
  }
}
