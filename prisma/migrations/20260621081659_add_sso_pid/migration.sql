-- AlterTable
ALTER TABLE `user` ADD COLUMN `sso_pid` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_sso_pid_key` ON `user`(`sso_pid`);
