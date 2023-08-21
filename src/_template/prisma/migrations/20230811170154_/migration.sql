-- CreateTable
CREATE TABLE "Dashboard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Call" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "twilioSid" TEXT NOT NULL,
    "dateCreated" TEXT,
    "dateUpdated" TEXT,
    "twilioAccountSid" TEXT NOT NULL,
    "calledNumber" TEXT NOT NULL,
    "calledNumberFormatted" TEXT,
    "phoneNumberSid" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "duration" INTEGER,
    "price" DECIMAL,
    "priceUnit" TEXT,
    "answeredBy" TEXT,
    "twilioUri" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "callerId" INTEGER NOT NULL,
    "callStatusId" INTEGER NOT NULL,
    CONSTRAINT "Call_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Call_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "Caller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Call_callStatusId_fkey" FOREIGN KEY ("callStatusId") REFERENCES "CallStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Caller" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "numberFormatted" TEXT,
    "name" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "twilioSid" TEXT NOT NULL,
    "twilioAccountSid" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "dashboardId" INTEGER,
    CONSTRAINT "PhoneNumber_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DashboardToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DashboardToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Dashboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DashboardToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_twilioSid_key" ON "Call"("twilioSid");

-- CreateIndex
CREATE UNIQUE INDEX "Call_twilioUri_key" ON "Call"("twilioUri");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_twilioSid_key" ON "PhoneNumber"("twilioSid");

-- CreateIndex
CREATE UNIQUE INDEX "_DashboardToUser_AB_unique" ON "_DashboardToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DashboardToUser_B_index" ON "_DashboardToUser"("B");
