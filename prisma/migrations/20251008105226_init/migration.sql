-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('JITSI', 'DAILY', 'LIVEKIT');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "provider" "Provider" NOT NULL DEFAULT 'JITSI';
