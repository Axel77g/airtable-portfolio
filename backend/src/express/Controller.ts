import { Request, Response } from "express";
import { z, ZodObject, ZodType } from "zod";

/**
 * A TypeScript type that extends the express `Request` interface to include a `payload` property.
 * This is typically used in contexts where a request is expected to carry additional
 * validated data, with the structure defined by a `ZodType` schema.*
 */
export type RequestWithPayload<T extends ZodType | undefined> = Request & {
  payload: T extends ZodType ? z.infer<T> : null;
};

export type ControllerHandler<T extends ZodType | undefined> = (
  req: RequestWithPayload<T>,
  res: Response,
) => void;

export type ExpressHandler = (req: Request, res: Response) => void;

/**
 * A utility function for creating an Express route handler
 * with optional validation and error handling logic.
 *
 * It transform the express Request to an RequestWithPayload by adding safe parsed payload
 * It return a valid express RequestHandler
 */
export const makeController = <T extends ZodType>(
  handler: ControllerHandler<T>,
  schema?: T | undefined,
  onError?: (res: Response) => void,
): ExpressHandler => {
  return (req: Request, res: Response) => {
    if (schema) {
      const payload = schema.safeParse({
        ...req.query,
        ...req.body,
        ...req.params,
      });

      if (!payload.success) {
        if (onError) onError(res);
        return res.status(422).send("Bad request");
      }

      (req as RequestWithPayload<typeof schema>).payload = payload.data;
    } else {
      (req as RequestWithPayload<typeof schema>).payload = null;
    }

    return handler(req as RequestWithPayload<T>, res);
  };
};
