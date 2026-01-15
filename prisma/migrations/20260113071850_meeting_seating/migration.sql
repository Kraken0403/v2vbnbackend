-- CreateTable
CREATE TABLE `meeting_seatings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_id` INTEGER NOT NULL,
    `uploaded_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `meeting_seatings_meeting_id_key`(`meeting_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_seating_members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `meeting_seating_id` INTEGER NOT NULL,
    `member_id` INTEGER NOT NULL,
    `sequence_number` INTEGER NOT NULL,

    INDEX `meeting_seating_members_meeting_seating_id_sequence_number_idx`(`meeting_seating_id`, `sequence_number`),
    UNIQUE INDEX `meeting_seating_members_meeting_seating_id_member_id_key`(`meeting_seating_id`, `member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `meeting_seatings` ADD CONSTRAINT `meeting_seatings_meeting_id_fkey` FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_seating_members` ADD CONSTRAINT `meeting_seating_members_meeting_seating_id_fkey` FOREIGN KEY (`meeting_seating_id`) REFERENCES `meeting_seatings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_seating_members` ADD CONSTRAINT `meeting_seating_members_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
