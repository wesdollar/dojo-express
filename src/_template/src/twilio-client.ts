import { Twilio } from "twilio";

export const twilioClient = (twilioSid: string, twilioSecret: string) =>
  new Twilio(twilioSid, twilioSecret);
