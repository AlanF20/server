-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "originId" TEXT;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_originId_fkey" FOREIGN KEY ("originId") REFERENCES "Song"("id") ON DELETE SET NULL ON UPDATE CASCADE;
