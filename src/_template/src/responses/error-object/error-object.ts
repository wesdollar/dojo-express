import { type ErrorKey } from "@dollardojo/modules/constants/error-keys";

type ErrorStack = unknown;

interface ErrorObject {
  errorKey: ErrorKey;
  errorStack: ErrorStack;
  error: true;
}

export const errorObject = (
  errorKey: ErrorKey,
  errorStack: ErrorStack
): ErrorObject => ({
  error: true,
  errorKey,
  errorStack,
});
