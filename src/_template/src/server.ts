import express from "express";
import * as dotenv from "dotenv-flow";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "@/swagger.json";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
const apiVersion = "v1";

app.use(cors());
app.use(bodyParser.json());

const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
};

app.use(
  "/docs/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, swaggerOptions)
);

app.get("/", (req, res) => {
  res.json({
    message: "Hello, world!",
    hangout: "Join us twitch.tv/dollardojo if you want to take a dip with us!",
  });
});

app.get(`/${apiVersion}/health-check`, (req, res) => {
  return res.json({ healthy: true });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}\n`);
  console.log(`http://localhost:${port}/docs/swagger`);
  console.log(`http://localhost:${port}/v1/health-check`);
});
