-- Migration 003: Equipment validation
-- Adds IPF equipment tracking and validation to weigh-ins

ALTER TABLE weigh_ins ADD COLUMN equipment_singlet TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_singlet_brand TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_belt TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_belt_brand TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_knee_sleeves TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_knee_sleeves_brand TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_wrist_wraps TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_wrist_wraps_brand TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_shoes TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_shoes_brand TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_validated INTEGER DEFAULT 0; -- Boolean: 0 = not validated, 1 = validated
ALTER TABLE weigh_ins ADD COLUMN equipment_validator_name TEXT;
ALTER TABLE weigh_ins ADD COLUMN equipment_validation_timestamp INTEGER; -- Unix timestamp

-- Index for finding non-validated equipment
CREATE INDEX IF NOT EXISTS idx_weigh_ins_equipment_validated ON weigh_ins(equipment_validated);
