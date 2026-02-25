-- Add failedLoginAttempts to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;

-- Rename propertyType to type on properties
ALTER TABLE "properties" RENAME COLUMN "propertyType" TO "type";

-- Add UNDER_DISCUSSION and BOOKED to PropertyStatus enum
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'UNDER_DISCUSSION';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'BOOKED';

-- Create GasType enum
DO $$ BEGIN
  CREATE TYPE "GasType" AS ENUM ('NATURAL_GAS', 'LP_GAS', 'CYLINDER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create TenantPreference enum
DO $$ BEGIN
  CREATE TYPE "TenantPreference" AS ENUM ('FAMILY', 'BACHELOR', 'OFFICE', 'ANY');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add new columns to properties
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "serviceCharge" DOUBLE PRECISION;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "gasType" "GasType";
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "tenantPreference" "TenantPreference";

-- Update indexes that referenced propertyType
DROP INDEX IF EXISTS "properties_type_idx";
DROP INDEX IF EXISTS "properties_type_status_idx";
CREATE INDEX IF NOT EXISTS "properties_type_idx" ON "properties"("type");
CREATE INDEX IF NOT EXISTS "properties_type_status_idx" ON "properties"("type", "status");
