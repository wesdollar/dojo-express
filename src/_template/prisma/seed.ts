import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dashboard = await prisma.dashboard.create({
    data: {
      name: "Hello World",
    },
  });

  await prisma.phoneNumber.create({
    data: {
      twilioSid: "PNb21df047c9e44c70c942bed7949bca46",
      twilioAccountSid: process.env.TWILIO_SID as string,
      nickname: "Ducky Phone",
      phoneNumber: "+7064453656",
      dashboardId: dashboard.id,
    },
  });

  const callStatuses = [
    {
      status: "queued",
    },
    {
      status: "in-progress",
    },
    {
      status: "completed",
    },
  ];

  for (const status of callStatuses) {
    await prisma.callStatus.create({
      data: status,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
