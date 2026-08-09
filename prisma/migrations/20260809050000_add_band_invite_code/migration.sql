-- AlterTable
ALTER TABLE "Band" ADD COLUMN "inviteCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Band_inviteCode_key" ON "Band"("inviteCode");
