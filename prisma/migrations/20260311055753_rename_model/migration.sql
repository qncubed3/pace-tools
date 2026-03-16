/*
  Warnings:

  - You are about to drop the `PaceRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaceRecord" DROP CONSTRAINT "PaceRecord_userId_fkey";

-- DropTable
DROP TABLE "PaceRecord";

-- CreateTable
CREATE TABLE "pace_record" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "distance" INTEGER,
    "time" INTEGER,
    "pace" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "pace_record_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pace_record" ADD CONSTRAINT "pace_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
