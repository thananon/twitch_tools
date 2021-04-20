-- CreateIndex
CREATE INDEX "Player.username_index" ON "Player"("username");

-- CreateIndex
CREATE INDEX "Player.status_index" ON "Player"("status");

-- CreateIndex
CREATE INDEX "Player.coins_index" ON "Player"("coins");

-- CreateIndex
CREATE INDEX "Player.twitch_id_index" ON "Player"("twitch_id");

-- CreateIndex
CREATE INDEX "Player.discord_id_index" ON "Player"("discord_id");
