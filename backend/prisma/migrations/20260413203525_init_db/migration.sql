-- CreateTable
CREATE TABLE "Address" (
    "street_id" INTEGER NOT NULL,
    "street_name" VARCHAR NOT NULL,
    "postal_code" VARCHAR NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("street_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" INTEGER NOT NULL,
    "category_name" VARCHAR NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Class" (
    "class_id" INTEGER NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "class_day" DATE NOT NULL,
    "class_time_start" TIME(6) NOT NULL,
    "class_time_end" TIME(6) NOT NULL,
    "class_recurrence" BOOLEAN,
    "studio_modality_id" INTEGER NOT NULL,
    "class_final_fee" DECIMAL(10,2) NOT NULL,
    "class_status_id" INTEGER NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "Class_Extra_Fee" (
    "class_extra_fee_id" INTEGER NOT NULL,
    "class_extra_fee_value" DECIMAL(10,2) NOT NULL,
    "class_extra_fee_reason_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,

    CONSTRAINT "Class_Extra_Fee_pkey" PRIMARY KEY ("class_extra_fee_id")
);

-- CreateTable
CREATE TABLE "Class_Extra_Fee_Reason" (
    "class_extra_fee_reason_id" INTEGER NOT NULL,
    "class_extra_fee_reason_desc" VARCHAR NOT NULL,

    CONSTRAINT "Class_Extra_Fee_Reason_pkey" PRIMARY KEY ("class_extra_fee_reason_id")
);

-- CreateTable
CREATE TABLE "Class_Status" (
    "class_status_id" INTEGER NOT NULL,
    "class_status_desc" VARCHAR NOT NULL,

    CONSTRAINT "Class_Status_pkey" PRIMARY KEY ("class_status_id")
);

-- CreateTable
CREATE TABLE "Class_Status_History" (
    "class_status_history_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "class_status_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "class_status_history_date" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Class_Status_History_pkey" PRIMARY KEY ("class_status_history_id")
);

-- CreateTable
CREATE TABLE "Color" (
    "color_id" INTEGER NOT NULL,
    "color_name" VARCHAR NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("color_id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "contact_id" INTEGER NOT NULL,
    "contact_value" VARCHAR NOT NULL,
    "contact_type_id" INTEGER NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "Contact_Type" (
    "contact_type_id" INTEGER NOT NULL,
    "contact_type_desc" VARCHAR NOT NULL,

    CONSTRAINT "Contact_Type_pkey" PRIMARY KEY ("contact_type_id")
);

-- CreateTable
CREATE TABLE "Dance_Type" (
    "dance_type_id" INTEGER NOT NULL,
    "dance_type_name" VARCHAR NOT NULL,

    CONSTRAINT "Dance_Type_pkey" PRIMARY KEY ("dance_type_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "item_id" INTEGER NOT NULL,
    "item_characteristics_id" INTEGER NOT NULL,
    "item_condition_id" INTEGER NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Item_Characteristics" (
    "item_characteristics_id" INTEGER NOT NULL,
    "item_characteristics_name" VARCHAR NOT NULL,
    "color_id" INTEGER NOT NULL,
    "size_id" INTEGER,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "Item_Characteristics_pkey" PRIMARY KEY ("item_characteristics_id")
);

-- CreateTable
CREATE TABLE "Item_Characteristics_Dance_Type" (
    "item_characteristics_id" INTEGER NOT NULL,
    "dance_type_id" INTEGER NOT NULL,

    CONSTRAINT "Item_Characteristics_Dance_Type_pkey" PRIMARY KEY ("item_characteristics_id","dance_type_id")
);

-- CreateTable
CREATE TABLE "Item_Condition" (
    "item_condition_id" INTEGER NOT NULL,
    "item_condition_name" VARCHAR NOT NULL,

    CONSTRAINT "Item_Condition_pkey" PRIMARY KEY ("item_condition_id")
);

-- CreateTable
CREATE TABLE "Item_Image" (
    "item_image_id" INTEGER NOT NULL,
    "item_characteristics_id" INTEGER NOT NULL,
    "item_image_url" VARCHAR NOT NULL,
    "item_image_is_main" BOOLEAN NOT NULL,

    CONSTRAINT "Item_Image_pkey" PRIMARY KEY ("item_image_id")
);

-- CreateTable
CREATE TABLE "Locality" (
    "locality_id" INTEGER NOT NULL,
    "locality_name" VARCHAR NOT NULL,

    CONSTRAINT "Locality_pkey" PRIMARY KEY ("locality_id")
);

-- CreateTable
CREATE TABLE "Modality" (
    "modality_id" INTEGER NOT NULL,
    "modality_name" VARCHAR NOT NULL,
    "modality_hourly_fee" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Modality_pkey" PRIMARY KEY ("modality_id")
);

-- CreateTable
CREATE TABLE "Postal_Code" (
    "postal_code" VARCHAR NOT NULL,
    "locality_id" INTEGER NOT NULL,

    CONSTRAINT "Postal_Code_pkey" PRIMARY KEY ("postal_code")
);

-- CreateTable
CREATE TABLE "Rent_Item" (
    "rent_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rent_date_start" TIMESTAMPTZ(6) NOT NULL,
    "rent_date_end" TIMESTAMPTZ(6) NOT NULL,
    "actual_rent_date_end" TIMESTAMPTZ(6),
    "item_damaged" BOOLEAN,

    CONSTRAINT "Rent_Item_pkey" PRIMARY KEY ("rent_id")
);

-- CreateTable
CREATE TABLE "Schedule_Vacancy" (
    "schedule_vacancy_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "schedule_vacancy_day" DATE NOT NULL,
    "schedule_vacancy_start" TIME(6) NOT NULL,
    "schedule_vacancy_end" TIME(6) NOT NULL,
    "schedule_vacancy_recurrence" BOOLEAN,

    CONSTRAINT "Schedule_Vacancy_pkey" PRIMARY KEY ("schedule_vacancy_id")
);

-- CreateTable
CREATE TABLE "School_Item" (
    "item_id" INTEGER NOT NULL,
    "rent_fee" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "School_Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "School_Year" (
    "school_year_id" INTEGER NOT NULL,
    "school_year_name" VARCHAR NOT NULL,
    "school_year_start" DATE NOT NULL,
    "school_year_end" DATE NOT NULL,

    CONSTRAINT "School_Year_pkey" PRIMARY KEY ("school_year_id")
);

-- CreateTable
CREATE TABLE "Size" (
    "size_id" INTEGER NOT NULL,
    "size_name" VARCHAR NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("size_id")
);

-- CreateTable
CREATE TABLE "Student_Number" (
    "user_id" INTEGER NOT NULL,
    "student_number" VARCHAR NOT NULL,

    CONSTRAINT "Student_Number_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Studio" (
    "studio_id" INTEGER NOT NULL,
    "studio_name" VARCHAR NOT NULL,
    "studio_max_capacity" INTEGER NOT NULL,

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("studio_id")
);

-- CreateTable
CREATE TABLE "Studio_Modality" (
    "studio_modality_id" INTEGER NOT NULL,
    "studio_id" INTEGER NOT NULL,
    "modality_id" INTEGER NOT NULL,

    CONSTRAINT "Studio_Modality_pkey" PRIMARY KEY ("studio_modality_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL,
    "user_name" VARCHAR NOT NULL,
    "user_birth_date" DATE,
    "user_start_date" DATE,
    "user_type_id" INTEGER NOT NULL,
    "user_is_active" BOOLEAN NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User_Address" (
    "user_address_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "street_id" INTEGER NOT NULL,
    "is_main_address" BOOLEAN NOT NULL,

    CONSTRAINT "User_Address_pkey" PRIMARY KEY ("user_address_id")
);

-- CreateTable
CREATE TABLE "User_Class" (
    "class_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "user_class_role_id" INTEGER,
    "user_validation" BOOLEAN NOT NULL,

    CONSTRAINT "User_Class_pkey" PRIMARY KEY ("class_id","user_id")
);

-- CreateTable
CREATE TABLE "User_Class_Role" (
    "user_class_role_id" INTEGER NOT NULL,
    "user_class_role_desc" VARCHAR NOT NULL,

    CONSTRAINT "User_Class_Role_pkey" PRIMARY KEY ("user_class_role_id")
);

-- CreateTable
CREATE TABLE "User_Contact" (
    "user_contact_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "is_main_contact" BOOLEAN NOT NULL,

    CONSTRAINT "User_Contact_pkey" PRIMARY KEY ("user_contact_id")
);

-- CreateTable
CREATE TABLE "User_Credential" (
    "user_id" INTEGER NOT NULL,
    "user_contact_id" INTEGER NOT NULL,
    "user_credential_password_hash" VARCHAR NOT NULL,
    "user_credential_last_login" TIMESTAMPTZ(6),

    CONSTRAINT "User_Credential_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User_Item" (
    "item_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "User_Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "User_NIF" (
    "user_id" INTEGER NOT NULL,
    "user_nif" VARCHAR NOT NULL,

    CONSTRAINT "User_NIF_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User_Type" (
    "user_type_id" INTEGER NOT NULL,
    "user_type_desc" VARCHAR NOT NULL,

    CONSTRAINT "User_Type_pkey" PRIMARY KEY ("user_type_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_name_key" ON "Category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Class_Extra_Fee_Reason_class_extra_fee_reason_desc_key" ON "Class_Extra_Fee_Reason"("class_extra_fee_reason_desc");

-- CreateIndex
CREATE UNIQUE INDEX "Class_Status_class_status_desc_key" ON "Class_Status"("class_status_desc");

-- CreateIndex
CREATE UNIQUE INDEX "Color_color_name_key" ON "Color"("color_name");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_Type_contact_type_desc_key" ON "Contact_Type"("contact_type_desc");

-- CreateIndex
CREATE UNIQUE INDEX "Dance_Type_dance_type_name_key" ON "Dance_Type"("dance_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "Item_Condition_item_condition_name_key" ON "Item_Condition"("item_condition_name");

-- CreateIndex
CREATE UNIQUE INDEX "Modality_modality_name_key" ON "Modality"("modality_name");

-- CreateIndex
CREATE UNIQUE INDEX "School_Year_school_year_name_key" ON "School_Year"("school_year_name");

-- CreateIndex
CREATE UNIQUE INDEX "Size_size_name_key" ON "Size"("size_name");

-- CreateIndex
CREATE UNIQUE INDEX "Student_Number_student_number_key" ON "Student_Number"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_studio_name_key" ON "Studio"("studio_name");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_Modality_studio_id_modality_id_idx" ON "Studio_Modality"("studio_id", "modality_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_Address_user_id_street_id_idx" ON "User_Address"("user_id", "street_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_Class_Role_user_class_role_desc_key" ON "User_Class_Role"("user_class_role_desc");

-- CreateIndex
CREATE UNIQUE INDEX "User_Contact_user_id_contact_id_idx" ON "User_Contact"("user_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_Credential_user_contact_id_key" ON "User_Credential"("user_contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_NIF_user_nif_key" ON "User_NIF"("user_nif");

-- CreateIndex
CREATE UNIQUE INDEX "User_Type_user_type_desc_key" ON "User_Type"("user_type_desc");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_postal_code_fkey" FOREIGN KEY ("postal_code") REFERENCES "Postal_Code"("postal_code") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_class_status_id_fkey" FOREIGN KEY ("class_status_id") REFERENCES "Class_Status"("class_status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "School_Year"("school_year_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_studio_modality_id_fkey" FOREIGN KEY ("studio_modality_id") REFERENCES "Studio_Modality"("studio_modality_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class_Extra_Fee" ADD CONSTRAINT "Class_Extra_Fee_class_extra_fee_reason_id_fkey" FOREIGN KEY ("class_extra_fee_reason_id") REFERENCES "Class_Extra_Fee_Reason"("class_extra_fee_reason_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class_Extra_Fee" ADD CONSTRAINT "Class_Extra_Fee_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_class_status_id_fkey" FOREIGN KEY ("class_status_id") REFERENCES "Class_Status"("class_status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contact_type_id_fkey" FOREIGN KEY ("contact_type_id") REFERENCES "Contact_Type"("contact_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_item_condition_id_fkey" FOREIGN KEY ("item_condition_id") REFERENCES "Item_Condition"("item_condition_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "Color"("color_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "Size"("size_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" ADD CONSTRAINT "Item_Characteristics_Dance_Type_dance_type_id_fkey" FOREIGN KEY ("dance_type_id") REFERENCES "Dance_Type"("dance_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" ADD CONSTRAINT "Item_Characteristics_Dance_Type_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Item_Image" ADD CONSTRAINT "Item_Image_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Postal_Code" ADD CONSTRAINT "Postal_Code_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "Locality"("locality_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rent_Item" ADD CONSTRAINT "Rent_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "School_Item"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Rent_Item" ADD CONSTRAINT "Rent_Item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schedule_Vacancy" ADD CONSTRAINT "Schedule_Vacancy_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "School_Year"("school_year_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Schedule_Vacancy" ADD CONSTRAINT "Schedule_Vacancy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "School_Item" ADD CONSTRAINT "School_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student_Number" ADD CONSTRAINT "Student_Number_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Studio_Modality" ADD CONSTRAINT "Studio_Modality_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "Modality"("modality_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Studio_Modality" ADD CONSTRAINT "Studio_Modality_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("studio_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "User_Type"("user_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Address" ADD CONSTRAINT "User_Address_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "Address"("street_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Address" ADD CONSTRAINT "User_Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_user_class_role_id_fkey" FOREIGN KEY ("user_class_role_id") REFERENCES "User_Class_Role"("user_class_role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Contact" ADD CONSTRAINT "User_Contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Contact" ADD CONSTRAINT "User_Contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Credential" ADD CONSTRAINT "User_Credential_user_contact_id_fkey" FOREIGN KEY ("user_contact_id") REFERENCES "User_Contact"("user_contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Credential" ADD CONSTRAINT "User_Credential_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_NIF" ADD CONSTRAINT "User_NIF_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
