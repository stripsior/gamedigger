-- CreateTable
CREATE TABLE "watchers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT,
    "channelId" TEXT NOT NULL,
    "depotId" TEXT NOT NULL,
    "manifest" TEXT,
    CONSTRAINT "watchers_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
