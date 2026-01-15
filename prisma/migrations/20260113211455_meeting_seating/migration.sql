-- AlterTable
ALTER TABLE `meetings` ADD COLUMN `closed_at` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN';
