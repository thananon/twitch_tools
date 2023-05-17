-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "status" TEXT,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "roll_counter" INTEGER NOT NULL DEFAULT 0,
    "twitch_id" TEXT,
    "discord_id" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Player.username_unique" ON "Player"("username");
