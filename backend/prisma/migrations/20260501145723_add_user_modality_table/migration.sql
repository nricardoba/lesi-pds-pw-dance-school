-- CreateTable
CREATE TABLE "User_Modality" (
    "user_modality_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "modality_id" INTEGER NOT NULL,

    CONSTRAINT "User_Modality_pkey" PRIMARY KEY ("user_modality_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Modality_user_id_modality_id_idx" ON "User_Modality"("user_id", "modality_id");

-- AddForeignKey
ALTER TABLE "User_Modality" ADD CONSTRAINT "User_Modality_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Modality" ADD CONSTRAINT "User_Modality_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "Modality"("modality_id") ON DELETE CASCADE ON UPDATE CASCADE;
