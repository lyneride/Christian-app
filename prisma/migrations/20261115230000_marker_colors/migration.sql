-- CreateTable
CREATE TABLE "MarkerColor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "hue" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 2,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkerColor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarkerColor_userId_position_idx" ON "MarkerColor"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MarkerColor_userId_key_key" ON "MarkerColor"("userId", "key");

-- AddForeignKey
ALTER TABLE "MarkerColor" ADD CONSTRAINT "MarkerColor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

