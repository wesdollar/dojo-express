import { httpStatusCodes } from "@dollardojo/modules/constants/http-status-codes";
import { type HttpStatusCodes } from "@dollardojo/modules/types/constants/http-status-codes";

export const successObject = (
  data: any,
  message: string,
  httpStatusCode?: HttpStatusCodes
) => ({
  data,
  message,
  httpStatusCode: httpStatusCode || httpStatusCodes.ok,
});
