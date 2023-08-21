import { errorObject } from "./error-object";

describe("error object which standardizes the error responses", () => {
  it("returns a properly formatted object", () => {
    const errorKey = "errror key";
    const errorStack = "error stack";

    const response = errorObject(errorKey, errorStack);

    expect(response).toEqual({ error: true, errorKey, errorStack });
  });
});
