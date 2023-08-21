import { PrismaClient } from "@prisma/client";
import { handleInboundPhoneCall } from "./handle-inbound-phone-call";
import type { Response } from "express";
import { faker } from "@faker-js/faker";
import { handleInboundPhoneCallConstants } from "./handle-inbound-phone-call.constants";
import { httpStatusCodes } from "@dollardojo/modules/constants/http-status-codes";
import { errorResponse } from "@/responses/error-response/error-response";
import { TelephonyClient } from "@/types/telephony-client";

const mockTeleponyCallCreate = jest.fn() as unknown as jest.Mock;

const mockTelephonyClient = {
  calls: {
    create: mockTeleponyCallCreate,
  },
} as unknown as TelephonyClient;

const mockJson = jest.fn((data) => data);

const mockRes = {
  json: mockJson,
  status: jest.fn(() => ({
    json: mockJson,
  })),
} as unknown as Response;

const mockDashboardFindUnique = jest.fn();
const mockCallCreate = jest.fn();

const mockPrismaClient = {
  dashboard: {
    findUnique: mockDashboardFindUnique,
  },
  caller: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  call: {
    create: mockCallCreate,
  },
};

const twilioSid = faker.string.uuid();
const dateCreated = "2023-01-01";
const dateUpdated = "2023-02-02";
const twilioAccountSid = faker.string.uuid();
const calledNumber = faker.phone.number();
const calledNumberFormatted = faker.phone.number();
const phoneNumberSid = faker.string.uuid();
const startTime = faker.date.past();
const endTime = faker.date.past();
const duration = 160;
const price = faker.commerce.price();
const priceUnit = "USD";
const answeredBy = faker.phone.number();
const twilioUri = faker.internet.url();

const prismaClientCallCreatePayload = {
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
    dashboard: {
      connect: { id: 1 },
    },
    caller: {
      connect: { id: 1 },
    },
    callStatus: {
      connect: { id: 1 },
    },
  },
};

const twilioCallsCreateResponse = {
  sid: twilioSid,
  dateCreated,
  dateUpdated,
  accountSid: twilioAccountSid,
  to: calledNumber,
  toFormatted: calledNumberFormatted,
  phoneNumberSid,
  startTime,
  endTime,
  duration: duration.toString(),
  price,
  priceUnit,
  answeredBy,
  uri: twilioUri,
};

const mockNext = jest.fn();

const callResourceObject = {
  id: 1,
  twilioSid: "fsdl;ksdf",
  dateCreated: null,
  dateUpdated: null,
  twilioAccountSid: "sdfjlsdf",
  calledNumber: "+1235551234",
  calledNumberFormatted: "(123) 555-1234",
  phoneNumberSid: "sdflkjsdf",
  startTime: null,
  endTime: null,
  duration: 0,
  price: null,
  priceUnit: "USD",
  answeredBy: null,
  twilioUri: "/2010-04-01/Accounts/blasfh/Calls/sdjfhfdlksd.json",
  createdAt: "2023-08-11T17:02:49.604Z",
  updatedAt: "2023-08-11T17:02:49.604Z",
  dashboardId: 1,
  callerId: 1,
  callStatusId: 1,
};

describe("handleInboundPhoneCall happy path", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPrismaClient.caller.findFirst.mockResolvedValue({
      id: 1,
      number: "+15551231234",
    });

    mockDashboardFindUnique.mockResolvedValue({
      id: 1,
    });

    mockCallCreate.mockResolvedValue(callResourceObject);

    mockTeleponyCallCreate.mockResolvedValue(twilioCallsCreateResponse);
  });

  it("should return success response", async () => {
    const response = await handleInboundPhoneCall(
      mockRes,
      mockPrismaClient as unknown as PrismaClient,
      mockTelephonyClient,
      mockNext
    );

    expect(response).toEqual(callResourceObject);
  });

  it("should create a new call record", async () => {
    await handleInboundPhoneCall(
      mockRes,
      mockPrismaClient as unknown as PrismaClient,
      mockTelephonyClient,
      mockNext
    );

    expect(mockPrismaClient.call.create).toHaveBeenCalledWith(
      prismaClientCallCreatePayload
    );
  });

  it("should handle no caller found", async () => {
    mockPrismaClient.caller.findFirst.mockResolvedValue(null);

    await handleInboundPhoneCall(
      mockRes,
      mockPrismaClient as unknown as PrismaClient,
      mockTelephonyClient,
      mockNext
    );

    expect(mockRes.json).toHaveBeenCalledWith(
      errorResponse(
        httpStatusCodes.notFound,
        handleInboundPhoneCallConstants.noCallerFound,
        {}
      )
    );
  });
});

describe("handleInboundPhoneCall error handling", () => {
  it("should return appropriate error response when no dashboard is found", async () => {
    mockDashboardFindUnique.mockResolvedValue(null);

    await handleInboundPhoneCall(
      mockRes,
      mockPrismaClient as unknown as PrismaClient,
      mockTelephonyClient,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: handleInboundPhoneCallConstants.noDashboardFoundErrorMessage,
    });
  });

  it("should handle when the Twilio create Call fails", async () => {
    mockDashboardFindUnique.mockRejectedValue(
      handleInboundPhoneCallConstants.twilio.errors.callFailed
    );

    await expect(
      handleInboundPhoneCall(
        mockRes,
        mockPrismaClient as unknown as PrismaClient,
        mockTelephonyClient,
        mockNext
      )
    ).rejects.toEqual(handleInboundPhoneCallConstants.twilio.errors.callFailed);
  });
});
