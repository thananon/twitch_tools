-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "status" TEXT,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "roll_counter" INTEGER NOT NULL DEFAULT 0,
    "twitch_id" TEXT,
    "discord_id" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Player" ("id", "username", "status", "coins", "roll_counter", "twitch_id", "discord_id") SELECT "id", "username", "status", "coins", "roll_counter", "twitch_id", "discord_id" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player.username_unique" ON "Player"("username");
CREATE INDEX "Player.username_index" ON "Player"("username");
CREATE INDEX "Player.status_index" ON "Player"("status");
CREATE INDEX "Player.coins_index" ON "Player"("coins");
CREATE INDEX "Player.twitch_id_index" ON "Player"("twitch_id");
CREATE INDEX "Player.discord_id_index" ON "Player"("discord_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
