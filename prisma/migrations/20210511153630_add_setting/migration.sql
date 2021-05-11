-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "data_type" TEXT NOT NULL DEFAULT 'string',
    "data" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting.name_unique" ON "Setting"("name");
