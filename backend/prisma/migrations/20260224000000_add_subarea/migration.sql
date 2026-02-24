-- AlterTable
ALTER TABLE "properties" ADD COLUMN "subArea" TEXT;

-- CreateIndex
CREATE INDEX "properties_area_subArea_idx" ON "properties"("area", "subArea");
