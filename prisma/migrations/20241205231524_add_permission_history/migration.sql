-- CreateTable
CREATE TABLE "PermissionHistory" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PermissionHistory" ADD CONSTRAINT "PermissionHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
