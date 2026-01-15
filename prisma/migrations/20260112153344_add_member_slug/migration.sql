/*
  Warnings:

  - You are about to drop the column `photo_url` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `members` DROP COLUMN `photo_url`,
    ADD COLUMN `birth_date` DATE NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `industry` VARCHAR(191) NULL,
    ADD COLUMN `membership_category` VARCHAR(191) NULL,
    ADD COLUMN `membership_number` VARCHAR(191) NULL,
    ADD COLUMN `salutation` VARCHAR(191) NULL,
    ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `state` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `member_profiles` (
    `member_id` INTEGER NOT NULL,
    `photo_url` VARCHAR(191) NULL,
    `headline` VARCHAR(191) NULL,
    `about` VARCHAR(191) NULL,
    `business_description` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `x_handle` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `facebook` VARCHAR(191) NULL,
    `youtube` VARCHAR(191) NULL,
    `show_email` BOOLEAN NOT NULL DEFAULT false,
    `show_phone` BOOLEAN NOT NULL DEFAULT false,
    `company_address` JSON NULL,
    `gst_number` VARCHAR(191) NULL,

    PRIMARY KEY (`member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_contacts` (
    `member_id` INTEGER NOT NULL,
    `office_email` VARCHAR(191) NULL,
    `personal_email` VARCHAR(191) NULL,
    `company_phone` VARCHAR(191) NULL,
    `residence_phone` VARCHAR(191) NULL,
    `company_address` JSON NULL,
    `residence_address` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`member_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `members_slug_key` ON `members`(`slug`);

-- AddForeignKey
ALTER TABLE `member_profiles` ADD CONSTRAINT `member_profiles_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_contacts` ADD CONSTRAINT `member_contacts_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
