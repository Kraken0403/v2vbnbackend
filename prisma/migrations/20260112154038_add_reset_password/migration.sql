/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `members` ADD COLUMN `user_id` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `members_user_id_key` ON `members`(`user_id`);
