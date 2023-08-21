import type { NextFunction, Response } from "express";
import { httpStatusCodes } from "@dollardojo/modules/constants/http-status-codes";
import type { PrismaClient } from "@prisma/client";
import { handleInboundPhoneCallConstants } from "./handle-inbound-phone-call.constants";
import { errorResponse } from "@/responses/error-response/error-response";
import { TelephonyClient } from "@/types/telephony-client";

export const handleInboundPhoneCall = async (
  res: Response,
  dbClient: PrismaClient,
  telephonyClient: TelephonyClient,
  next: NextFunction
  // eslint-disable-next-line max-params
) => {
  let call;

  try {
    call = await telephonyClient.calls.create({
      statusCallback: `https://${process.env.CALLDASH_HOST}/v1/calls/handle-call-callback`,
      statusCallbackEvent: [
        "completed",
        "no-answer",
        "failed",
        "in-progress",
        "answered",
      ],
      statusCallbackMethod: "GET",
      url: "http://demo.twilio.com/docs/voice.xml",
      to: process.env.WES_PHONE_NUMBER as string,
      from: "+17064453656",
    });
  } catch (error) {
    return next(error);
  }

  // TODO: replace with dashboard by querying phone number
  const dashboard = await dbClient.dashboard.findUnique({
    where: { id: 1 },
  });

  if (!dashboard) {
    return res.status(httpStatusCodes.notFound).json({
      error: handleInboundPhoneCallConstants.noDashboardFoundErrorMessage,
    });
  }

  let existingCaller;
  let caller;

  try {
    existingCaller = await dbClient.caller.findFirst({
      where: {
        number: call.from,
      },
    });
  } catch (error) {
    console.error(error);
  }

  if (!existingCaller) {
    try {
      caller = await dbClient.caller.create({
        data: {
          number: call.from,
        },
      });
    } catch (error) {
      console.error(error);
    }
  } else {
    caller = existingCaller;
  }

  if (!caller) {
    return res
      .status(httpStatusCodes.notFound)
      .json(
        errorResponse(
          httpStatusCodes.notFound,
          handleInboundPhoneCallConstants.noCallerFound,
          {}
        )
      );
  }

  try {
    const callResource = await dbClient.call.create({
      data: {
        twilioSid: call.sid,
        dateCreated: call.dateCreated ? call.dateCreated.toString() : null,
        dateUpdated: call.dateUpdated ? call.dateUpdated.toString() : null,
        twilioAccountSid: call.accountSid,
        calledNumber: call.to,
        calledNumberFormatted: call.toFormatted,
        phoneNumberSid: call.phoneNumberSid,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: Number(call.duration),
        price: call.price,
        priceUnit: call.priceUnit,
        answeredBy: call.answeredBy,
        twilioUri: call.uri,
        dashboard: {
          connect: { id: dashboard.id },
        },
        caller: {
          connect: { id: caller.id },
        },
        callStatus: {
          connect: { id: 1 },
        },
      },
    });

    return res.json(callResource);
  } catch (error) {
    return next(error);
  }
};
