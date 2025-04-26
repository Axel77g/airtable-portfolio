import { Request, Response } from "express";
import { z, ZodObject, ZodType } from "zod";

export type RequestWithPayload<T extends ZodType | undefined> = Request & {
  payload: T extends ZodType ? z.infer<T> : null;
};

export type ControllerHandler<T extends ZodType | undefined> = (
  req: RequestWithPayload<T>,
  res: Response,
) => void;

export type ExpressHandler = (req: Request, res: Response) => void;

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
