/*
  Warnings:

  - You are about to drop the column `chapter_id` on the `activities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `activities` DROP FOREIGN KEY `activities_chapter_id_fkey`;

-- DropIndex
DROP INDEX `activities_chapter_id_idx` ON `activities`;

-- AlterTable
ALTER TABLE `activities` DROP COLUMN `chapter_id`;

-- CreateTable
CREATE TABLE `activity_chapters` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_id` INTEGER NOT NULL,
    `chapter_id` INTEGER NOT NULL,

    INDEX `activity_chapters_chapter_id_idx`(`chapter_id`),
    UNIQUE INDEX `activity_chapters_activity_id_chapter_id_key`(`activity_id`, `chapter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `activity_chapters` ADD CONSTRAINT `activity_chapters_activity_id_fkey` FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activity_chapters` ADD CONSTRAINT `activity_chapters_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
