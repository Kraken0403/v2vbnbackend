/*
  Warnings:

  - You are about to drop the column `chapter_id` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `chapter_id` on the `users` table. All the data in the column will be lost.
  - The values [PRESIDENT,VP,ST] on the enum `users_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `members` DROP FOREIGN KEY `members_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_chapter_id_fkey`;

-- DropIndex
DROP INDEX `members_chapter_id_idx` ON `members`;

-- DropIndex
DROP INDEX `users_chapter_id_fkey` ON `users`;

-- AlterTable
ALTER TABLE `meeting_member_rows` MODIFY `status` ENUM('PRESENT', 'ABSENT', 'SUBSTITUTE', 'MEDICAL') NOT NULL DEFAULT 'PRESENT';

-- AlterTable
ALTER TABLE `members` DROP COLUMN `chapter_id`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `chapter_id`,
    MODIFY `role` ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF') NOT NULL;

-- CreateTable
CREATE TABLE `member_chapters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_id` INTEGER NOT NULL,
    `chapter_id` INTEGER NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `member_chapters_chapter_id_idx`(`chapter_id`),
    UNIQUE INDEX `member_chapters_member_id_chapter_id_key`(`member_id`, `chapter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapter_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `member_chapter_id` INTEGER NOT NULL,
    `role` ENUM('PRESIDENT', 'VP', 'ST', 'MENTOR', 'CORE') NOT NULL,

    UNIQUE INDEX `chapter_roles_member_chapter_id_role_key`(`member_chapter_id`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('F2F', 'REFERRAL', 'APPRECIATION') NOT NULL,
    `from_member_id` INTEGER NOT NULL,
    `to_member_id` INTEGER NOT NULL,
    `chapter_id` INTEGER NULL,
    `amount` DECIMAL(10, 2) NULL,
    `note` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activities_from_member_id_idx`(`from_member_id`),
    INDEX `activities_to_member_id_idx`(`to_member_id`),
    INDEX `activities_chapter_id_idx`(`chapter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_chapters` ADD CONSTRAINT `member_chapters_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_chapters` ADD CONSTRAINT `member_chapters_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapter_roles` ADD CONSTRAINT `chapter_roles_member_chapter_id_fkey` FOREIGN KEY (`member_chapter_id`) REFERENCES `member_chapters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_from_member_id_fkey` FOREIGN KEY (`from_member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_to_member_id_fkey` FOREIGN KEY (`to_member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
