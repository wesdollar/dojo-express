import { errorResponse } from "./error-response";

describe("error response for standardized error responses", () => {
  it("it shuold return a properly formatted error response", () => {
    const status = 418;
    const message = "I'm a teapot";
    const error = new Error("you failed");

    const response = errorResponse(status, message, error);

    expect(response).toEqual({
      status,
      message,
      error,
    });
  });
});
