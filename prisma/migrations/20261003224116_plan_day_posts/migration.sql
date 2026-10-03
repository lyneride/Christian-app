-- CreateTable
CREATE TABLE "PlanDayPost" (
    "id" TEXT NOT NULL,
    "planGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanDayPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanDayPost_planGroupId_day_idx" ON "PlanDayPost"("planGroupId", "day");

-- CreateIndex
CREATE INDEX "PlanDayPost_userId_idx" ON "PlanDayPost"("userId");

-- AddForeignKey
ALTER TABLE "PlanDayPost" ADD CONSTRAINT "PlanDayPost_planGroupId_fkey" FOREIGN KEY ("planGroupId") REFERENCES "PlanGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanDayPost" ADD CONSTRAINT "PlanDayPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
