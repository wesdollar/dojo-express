import { TelephonyClient } from "@/types/telephony-client";

export const getCallBySid = async (
  sid: string,
  telephonyClient: TelephonyClient
) => {
  try {
    const twilioCall = await telephonyClient.calls(sid).fetch();

    return twilioCall;
  } catch (error) {
    console.log(error);

    throw new Error("unable to fetch Call resource");
  }
};
