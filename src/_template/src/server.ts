import express from "express";
import * as dotenv from "dotenv-flow";
import cors from "cors";
import bodyParser from "body-parser";
import { httpStatusCodes } from "@dollardojo/modules/constants/http-status-codes";
import { getCallBySid } from "@/handlers/calls/get-call-by-sid/get-call-by-sid";
import { handleInboundPhoneCall } from "@/handlers/calls/handle-inbound-phone-call/handle-inbound-phone-call";
import { dbClient } from "@/prisma-client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "@/swagger.json";
import { twilioClient } from "@/twilio-client";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
const apiVersion = "v1";

app.use(cors());
app.use(bodyParser.json());

const telephonyClient = twilioClient(
  process.env.TWILIO_PROD_SID as string,
  process.env.TWILIO_PROD_SECRET as string
);

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

app.get("/health-check", (req, res) => {
  return res.json({ healthy: true });
});

app.post(`/${apiVersion}/calls/handle-inbound-phone-call`, (req, res, next) => {
  handleInboundPhoneCall(res, dbClient, telephonyClient, next);
});

app.get(`/${apiVersion}/calls/handle-call-callback`, async (req, res) => {
  const { CallStatus: inboundCallStatus } = req.query;

  if (
    // TODO: bind to value from DB via constant/cache
    inboundCallStatus === "completed" ||
    inboundCallStatus === "in-progress"
  ) {
    const callStatus = await dbClient.callStatus.findFirst({
      where: {
        status: inboundCallStatus,
      },
    });

    const callSid = req.query.CallSid as string;
    let twilioCall;

    try {
      twilioCall = await getCallBySid(callSid, telephonyClient);
    } catch (error) {
      console.log(error);

      return res.status(500).json(error);
    }

    // Twilio's initial response on "completed" does
    // not have the `price` properly set, as if
    // it's on some sort of slightly delayed
    // batch process -:eye-roll:-

    if (inboundCallStatus === "completed" && !twilioCall.price) {
      // TODO: add event logging

      let localPrice = null;

      // see notes above regarding this stupid loop
      while (!localPrice) {
        // TODO: add event logging

        twilioCall = await getCallBySid(callSid, telephonyClient);
        localPrice = twilioCall.price;
      }
    }

    await dbClient.call.update({
      where: { twilioSid: callSid },
      data: {
        twilioSid: twilioCall.sid,
        dateCreated: twilioCall.dateCreated.toString() || null,
        dateUpdated: twilioCall.dateUpdated.toString() || null,
        twilioAccountSid: twilioCall.accountSid,
        calledNumber: twilioCall.to,
        calledNumberFormatted: twilioCall.toFormatted,
        phoneNumberSid: twilioCall.phoneNumberSid,
        startTime: twilioCall.startTime,
        endTime: twilioCall.endTime,
        duration: Number(twilioCall.duration),
        price: twilioCall.price,
        priceUnit: twilioCall.priceUnit,
        answeredBy: twilioCall.answeredBy,
        twilioUri: twilioCall.uri,
        callStatus: {
          connect: {
            id: callStatus?.id || 1,
          },
        },
      },
    });
  }

  return res.json({ success: true });
});

app.post(`/${apiVersion}/calls/handle-failed-handler`, (req, res) => {
  console.log("\n\ncall handler failed");
  console.log(req.body);

  return res.json({ success: false });
});

app.get(`/${apiVersion}/dashboards`, async (req, res) => {
  try {
    const dashboards = await dbClient.dashboard.findMany();

    return res.json(dashboards);
  } catch (error) {
    // TODO: replace with errorLogger
    console.error(error);

    // TODO: replace with errorResponse
    return res.status(500).json({ error: "Error fetching dashboards" });
  }
});

app.post(`/${apiVersion}/dashboards`, async (req, res) => {
  // TODO: add validation via joi

  try {
    const newDashboard = await dbClient.dashboard.create({
      data: {
        name: req.body.dashboardName,
      },
    });

    return res.json(newDashboard);
  } catch (error) {
    console.log(error, null, 2);

    return res.status(500).json({
      error,
    });
  }
});

app.post(`/${apiVersion}/calls`, async (req, res) => {
  const {
    twilioSid,
    dateCreated,
    dateUpdated,
    twilioAccountSid,
    calledNumber,
    calledNumberFormatted,
    phoneNumberSid,
    startTime,
    endTime,
    duration,
    price,
    priceUnit,
    answeredBy,
    twilioUri,
    dashboardId,
    callerId,
    callStatusId,
  } = req.body;

  // TODO: add joi data validation

  try {
    const newCall = await dbClient.call.create({
      data: {
        twilioSid,
        dateCreated,
        dateUpdated,
        twilioAccountSid,
        calledNumber,
        calledNumberFormatted,
        phoneNumberSid,
        startTime,
        endTime,
        duration,
        price,
        priceUnit,
        answeredBy,
        twilioUri,
        dashboardId,
        callerId,
        callStatusId,
      },
    });

    return res.json(newCall);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Error creating call" });
  }
});

app.put(`/${apiVersion}/calls/:id`, async (req, res) => {
  const { id } = req.params;

  const {
    twilioSid,
    dateCreated,
    dateUpdated,
    twilioAccountSid,
    calledNumber,
    calledNumberFormatted,
    phoneNumberSid,
    startTime,
    endTime,
    duration,
    price,
    priceUnit,
    answeredBy,
    twilioUri,
    dashboardId,
    callerId,
    callStatusId,
  } = req.body;

  // TODO: add joi data validation

  try {
    const updatedCall = await dbClient.call.update({
      where: { id: Number(id) },
      data: {
        twilioSid,
        dateCreated,
        dateUpdated,
        twilioAccountSid,
        calledNumber,
        calledNumberFormatted,
        phoneNumberSid,
        startTime,
        endTime,
        duration,
        price,
        priceUnit,
        answeredBy,
        twilioUri,
        dashboardId,
        callerId,
        callStatusId,
      },
    });

    return res.json(updatedCall);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error updating call" });
  }
});

app.get(`/${apiVersion}/calls`, async (req, res) => {
  try {
    const calls = await dbClient.call.findMany();

    res.json(calls);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Error fetching calls" });
  }
});

app.post(`/${apiVersion}/callers`, async (req, res) => {
  const { number, numberFormatted, name, country, state, city, zip } = req.body;

  const existingRecord = await dbClient.caller.findFirst({
    where: {
      number,
    },
  });

  if (!existingRecord) {
    try {
      const newCaller = await dbClient.caller.create({
        data: {
          number,
          numberFormatted,
          name,
          country,
          state,
          city,
          zip,
        },
      });

      return res.json(newCaller);
    } catch (error) {
      console.error(error);

      return res.status(500).json({ error: "Error creating caller" });
    }
  } else {
    return res
      .status(httpStatusCodes.conflict)
      .json({ error: "Caller already exists" });
  }
});

app.put(`/${apiVersion}/callers/:id`, async (req, res) => {
  const { id } = req.params;

  const { number, numberFormatted, name, country, state, city, zip } = req.body;

  try {
    const updatedCaller = await dbClient.caller.update({
      where: {
        id: Number(id),
      },
      data: {
        number,
        numberFormatted,
        name,
        country,
        state,
        city,
        zip,
      },
    });

    return res.json(updatedCaller);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error updating caller" });
  }
});

app.get(`/${apiVersion}/callers`, async (req, res) => {
  try {
    const callers = await dbClient.caller.findMany();

    return res.json(callers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error fetching callers" });
  }
});

app.post(`/${apiVersion}/phone-numbers`, async (req, res) => {
  const { twilioSid, twilioAccountSid, nickname, phoneNumber } = req.body;

  try {
    const newPhoneNumber = await dbClient.phoneNumber.create({
      data: {
        twilioSid,
        twilioAccountSid,
        nickname,
        phoneNumber,
      },
    });

    return res.json(newPhoneNumber);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error creating phone number" });
  }
});

app.put(`/${apiVersion}/phone-numbers/:id`, async (req, res) => {
  const { id } = req.params;

  const { twilioSid, twilioAccountSid, nickname, phoneNumber } = req.body;

  try {
    const updatedPhoneNumber = await dbClient.phoneNumber.update({
      where: {
        id: Number(id),
      },
      data: {
        twilioSid,
        twilioAccountSid,
        nickname,
        phoneNumber,
      },
    });

    return res.json(updatedPhoneNumber);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error updating phone number" });
  }
});

app.get(`/${apiVersion}/phone-numbers`, async (req, res) => {
  try {
    const phoneNumbers = await dbClient.phoneNumber.findMany();

    return res.json(phoneNumbers);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Error fetching phone numbers" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
