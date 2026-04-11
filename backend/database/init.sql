CREATE TABLE "User" (
  "user_id" int PRIMARY KEY,
  "user_name" varchar NOT NULL,
  "user_birth_date" date,
  "user_start_date" date,
  "user_type_id" int NOT NULL,
  "user_is_active" bool NOT NULL
);

CREATE TABLE "User_Credential" (
  "user_id" int PRIMARY KEY,
  "user_contact_id" int UNIQUE NOT NULL,
  "user_credential_password_hash" varchar NOT NULL,
  "user_credential_last_login" datetime
);

CREATE TABLE "Student_Number" (
  "user_id" int PRIMARY KEY,
  "student_number" varchar UNIQUE NOT NULL
);

CREATE TABLE "User_Address" (
  "user_address_id" int PRIMARY KEY,
  "user_id" int NOT NULL,
  "street_id" int NOT NULL,
  "is_main_address" bool NOT NULL
);

CREATE TABLE "Address" (
  "street_id" int PRIMARY KEY,
  "street_name" varchar NOT NULL,
  "postal_code" varchar NOT NULL
);

CREATE TABLE "Postal_Code" (
  "postal_code" varchar PRIMARY KEY,
  "locality_id" int NOT NULL
);

CREATE TABLE "Locality" (
  "locality_id" int PRIMARY KEY,
  "locality_name" varchar NOT NULL
);

CREATE TABLE "Contact_Type" (
  "contact_type_id" int PRIMARY KEY,
  "contact_type_desc" varchar UNIQUE NOT NULL
);

CREATE TABLE "Contact" (
  "contact_id" int PRIMARY KEY,
  "contact_value" varchar NOT NULL,
  "contact_type_id" int NOT NULL
);

CREATE TABLE "User_Contact" (
  "user_contact_id" int PRIMARY KEY,
  "user_id" int NOT NULL,
  "contact_id" int NOT NULL,
  "is_main_contact" bool NOT NULL
);

CREATE TABLE "User_Type" (
  "user_type_id" int PRIMARY KEY,
  "user_type_desc" varchar UNIQUE NOT NULL
);

CREATE TABLE "Color" (
  "color_id" int PRIMARY KEY,
  "color_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Category" (
  "category_id" int PRIMARY KEY,
  "category_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Dance_Type" (
  "dance_type_id" int PRIMARY KEY,
  "dance_type_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Item_Characteristics_Dance_Type" (
  "item_characteristics_id" int,
  "dance_type_id" int,
  PRIMARY KEY ("item_characteristics_id", "dance_type_id")
);

CREATE TABLE "Size" (
  "size_id" int PRIMARY KEY,
  "size_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Item_Condition" (
  "item_condition_id" int PRIMARY KEY,
  "item_condition_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "Item_Characteristics" (
  "item_characteristics_id" int PRIMARY KEY,
  "item_characteristics_name" varchar NOT NULL,
  "color_id" int NOT NULL,
  "size_id" int,
  "category_id" int NOT NULL
);

CREATE TABLE "Item_Image" (
  "item_image_id" int PRIMARY KEY,
  "item_characteristics_id" int NOT NULL,
  "item_image_url" varchar NOT NULL,
  "item_image_is_main" bool NOT NULL
);

CREATE TABLE "Item" (
  "item_id" int PRIMARY KEY,
  "item_characteristics_id" int NOT NULL,
  "item_condition_id" int NOT NULL
);

CREATE TABLE "School_Item" (
  "item_id" int PRIMARY KEY,
  "rent_fee" decimal(10,2) NOT NULL
);

CREATE TABLE "User_Item" (
  "item_id" int PRIMARY KEY,
  "user_id" int NOT NULL
);

CREATE TABLE "Class_Extra_Fee" (
  "class_extra_fee_id" int PRIMARY KEY,
  "class_extra_fee_value" decimal(10,2) NOT NULL,
  "class_extra_fee_reason_id" int NOT NULL,
  "class_id" int NOT NULL
);

CREATE TABLE "Class_Extra_Fee_Reason" (
  "class_extra_fee_reason_id" int PRIMARY KEY,
  "class_extra_fee_reason_desc" varchar UNIQUE NOT NULL
);

CREATE TABLE "Modality" (
  "modality_id" int PRIMARY KEY,
  "modality_name" varchar UNIQUE NOT NULL,
  "modality_hourly_fee" decimal(10,2) NOT NULL
);

CREATE TABLE "Studio" (
  "studio_id" int PRIMARY KEY,
  "studio_name" varchar UNIQUE NOT NULL,
  "studio_max_capacity" int NOT NULL
);

CREATE TABLE "Studio_Modality" (
  "studio_modality_id" int PRIMARY KEY,
  "studio_id" int NOT NULL,
  "modality_id" int NOT NULL
);

CREATE TABLE "Class" (
  "class_id" int PRIMARY KEY,
  "school_year_id" int NOT NULL,
  "class_day" date NOT NULL,
  "class_date_start" time NOT NULL,
  "class_date_end" time NOT NULL,
  "class_recurrence" bool,
  "studio_modality_id" int NOT NULL,
  "class_final_fee" decimal(10,2) NOT NULL,
  "class_status_id" int NOT NULL
);

CREATE TABLE "Class_Status" (
  "class_status_id" int PRIMARY KEY,
  "class_status_desc" varchar UNIQUE NOT NULL
);

CREATE TABLE "Class_Status_History" (
  "class_status_history_id" int PRIMARY KEY,
  "class_id" int NOT NULL,
  "class_status_id" int NOT NULL,
  "user_id" int NOT NULL,
  "class_status_history_date" datetime NOT NULL
);

CREATE TABLE "User_Class" (
  "class_id" int,
  "user_id" int,
  "user_class_role_id" int,
  "user_validation" bool NOT NULL,
  PRIMARY KEY ("class_id", "user_id")
);

CREATE TABLE "User_Class_Role" (
  "user_class_role_id" int PRIMARY KEY,
  "user_class_role_desc" varchar UNIQUE NOT NULL
);

CREATE TABLE "User_NIF" (
  "user_id" int PRIMARY KEY,
  "user_nif" varchar UNIQUE NOT NULL
);

CREATE TABLE "Rent_Item" (
  "rent_id" int PRIMARY KEY,
  "item_id" int NOT NULL,
  "user_id" int NOT NULL,
  "rent_date_start" datetime NOT NULL,
  "rent_date_end" datetime NOT NULL,
  "actual_rent_date_end" datetime,
  "item_damaged" bool
);

CREATE TABLE "Schedule_Vacancy" (
  "schedule_vacancy_id" int PRIMARY KEY,
  "user_id" int NOT NULL,
  "school_year_id" int NOT NULL,
  "schedule_vacancy_day" date NOT NULL,
  "schedule_vacancy_start" time NOT NULL,
  "schedule_vacancy_end" time NOT NULL,
  "schedule_vacancy_recurrence" bool
);

CREATE TABLE "School_Year" (
  "school_year_id" int PRIMARY KEY,
  "school_year_name" varchar UNIQUE NOT NULL,
  "school_year_start" date NOT NULL,
  "school_year_end" date NOT NULL
);

CREATE UNIQUE INDEX ON "User_Address" ("user_id", "street_id");

CREATE UNIQUE INDEX ON "User_Contact" ("user_id", "contact_id");

CREATE UNIQUE INDEX ON "Studio_Modality" ("studio_id", "modality_id");

ALTER TABLE "Postal_Code" ADD FOREIGN KEY ("locality_id") REFERENCES "Locality" ("locality_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Address" ADD FOREIGN KEY ("postal_code") REFERENCES "Postal_Code" ("postal_code") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Address" ADD FOREIGN KEY ("street_id") REFERENCES "Address" ("street_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Address" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Contact" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User" ADD FOREIGN KEY ("user_type_id") REFERENCES "User_Type" ("user_type_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Contact" ADD FOREIGN KEY ("contact_type_id") REFERENCES "Contact_Type" ("contact_type_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Contact" ADD FOREIGN KEY ("contact_id") REFERENCES "Contact" ("contact_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Class" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("class_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Class" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_NIF" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class" ADD FOREIGN KEY ("class_status_id") REFERENCES "Class_Status" ("class_status_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Schedule_Vacancy" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Student_Number" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Class" ADD FOREIGN KEY ("user_class_role_id") REFERENCES "User_Class_Role" ("user_class_role_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Characteristics" ADD FOREIGN KEY ("color_id") REFERENCES "Color" ("color_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Characteristics" ADD FOREIGN KEY ("size_id") REFERENCES "Size" ("size_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Characteristics" ADD FOREIGN KEY ("category_id") REFERENCES "Category" ("category_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item" ADD FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics" ("item_characteristics_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item" ADD FOREIGN KEY ("item_condition_id") REFERENCES "Item_Condition" ("item_condition_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "School_Item" ADD FOREIGN KEY ("item_id") REFERENCES "Item" ("item_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Item" ADD FOREIGN KEY ("item_id") REFERENCES "Item" ("item_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Rent_Item" ADD FOREIGN KEY ("item_id") REFERENCES "School_Item" ("item_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Rent_Item" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Characteristics_Dance_Type" ADD FOREIGN KEY ("dance_type_id") REFERENCES "Dance_Type" ("dance_type_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Characteristics_Dance_Type" ADD FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics" ("item_characteristics_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class" ADD FOREIGN KEY ("school_year_id") REFERENCES "School_Year" ("school_year_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Schedule_Vacancy" ADD FOREIGN KEY ("school_year_id") REFERENCES "School_Year" ("school_year_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Studio_Modality" ADD FOREIGN KEY ("studio_id") REFERENCES "Studio" ("studio_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Studio_Modality" ADD FOREIGN KEY ("modality_id") REFERENCES "Modality" ("modality_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class" ADD FOREIGN KEY ("studio_modality_id") REFERENCES "Studio_Modality" ("studio_modality_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class_Status_History" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("class_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class_Status_History" ADD FOREIGN KEY ("class_status_id") REFERENCES "Class_Status" ("class_status_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class_Status_History" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Credential" ADD FOREIGN KEY ("user_contact_id") REFERENCES "User_Contact" ("user_contact_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "User_Credential" ADD FOREIGN KEY ("user_id") REFERENCES "User" ("user_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Item_Image" ADD FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics" ("item_characteristics_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class_Extra_Fee" ADD FOREIGN KEY ("class_id") REFERENCES "Class" ("class_id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Class_Extra_Fee" ADD FOREIGN KEY ("class_extra_fee_reason_id") REFERENCES "Class_Extra_Fee_Reason" ("class_extra_fee_reason_id") DEFERRABLE INITIALLY IMMEDIATE;
