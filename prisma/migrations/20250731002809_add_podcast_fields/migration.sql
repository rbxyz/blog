-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "audioDuration" INTEGER,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "hasAudio" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spotifyPlaylistUrl" TEXT;
