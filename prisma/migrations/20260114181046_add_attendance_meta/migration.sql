-- AlterTable
ALTER TABLE `meeting_member_rows` ADD COLUMN `is_auto_generated` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `marked_at` DATETIME(3) NULL,
    ADD COLUMN `marked_by_member_id` INTEGER NULL,
    ADD COLUMN `marked_by_role` ENUM('PRESIDENT', 'VP', 'ST', 'MENTOR', 'CORE', 'ATTENDANCE_COORDINATOR') NULL,
    MODIFY `status` ENUM('PRESENT', 'ABSENT', 'SUBSTITUTE', 'MEDICAL', 'LATE') NOT NULL DEFAULT 'PRESENT';
