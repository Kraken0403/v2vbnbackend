-- DropForeignKey
ALTER TABLE `activities` DROP FOREIGN KEY `activities_to_member_id_fkey`;

-- DropIndex
DROP INDEX `activities_to_member_id_idx` ON `activities`;

-- AlterTable
ALTER TABLE `activities` ADD COLUMN `f2f_discussion` VARCHAR(191) NULL,
    ADD COLUMN `f2f_location` VARCHAR(191) NULL,
    ADD COLUMN `hotness` INTEGER NULL,
    ADD COLUMN `referral_name` VARCHAR(191) NULL,
    ADD COLUMN `referral_phone` VARCHAR(191) NULL,
    ADD COLUMN `referral_type` ENUM('INSIDE', 'OUTSIDE') NULL,
    MODIFY `to_member_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_to_member_id_fkey` FOREIGN KEY (`to_member_id`) REFERENCES `members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
