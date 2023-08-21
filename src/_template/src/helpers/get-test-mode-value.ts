export const getTestModeValue = () =>
  process.env.ENABLE_TEST_MODE === "true" ? true : false;
