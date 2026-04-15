-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_postal_code_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_class_status_id_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_school_year_id_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_studio_modality_id_fkey";

-- DropForeignKey
ALTER TABLE "Class_Extra_Fee" DROP CONSTRAINT "Class_Extra_Fee_class_extra_fee_reason_id_fkey";

-- DropForeignKey
ALTER TABLE "Class_Extra_Fee" DROP CONSTRAINT "Class_Extra_Fee_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Class_Status_History" DROP CONSTRAINT "Class_Status_History_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Class_Status_History" DROP CONSTRAINT "Class_Status_History_class_status_id_fkey";

-- DropForeignKey
ALTER TABLE "Class_Status_History" DROP CONSTRAINT "Class_Status_History_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contact_type_id_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_item_characteristics_id_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_item_condition_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Characteristics" DROP CONSTRAINT "Item_Characteristics_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Characteristics" DROP CONSTRAINT "Item_Characteristics_color_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Characteristics" DROP CONSTRAINT "Item_Characteristics_size_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" DROP CONSTRAINT "Item_Characteristics_Dance_Type_dance_type_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" DROP CONSTRAINT "Item_Characteristics_Dance_Type_item_characteristics_id_fkey";

-- DropForeignKey
ALTER TABLE "Item_Image" DROP CONSTRAINT "Item_Image_item_characteristics_id_fkey";

-- DropForeignKey
ALTER TABLE "Postal_Code" DROP CONSTRAINT "Postal_Code_locality_id_fkey";

-- DropForeignKey
ALTER TABLE "Rent_Item" DROP CONSTRAINT "Rent_Item_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Rent_Item" DROP CONSTRAINT "Rent_Item_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule_Vacancy" DROP CONSTRAINT "Schedule_Vacancy_school_year_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule_Vacancy" DROP CONSTRAINT "Schedule_Vacancy_user_id_fkey";

-- DropForeignKey
ALTER TABLE "School_Item" DROP CONSTRAINT "School_Item_item_id_fkey";

-- DropForeignKey
ALTER TABLE "Student_Number" DROP CONSTRAINT "Student_Number_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Studio_Modality" DROP CONSTRAINT "Studio_Modality_modality_id_fkey";

-- DropForeignKey
ALTER TABLE "Studio_Modality" DROP CONSTRAINT "Studio_Modality_studio_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_user_type_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Address" DROP CONSTRAINT "User_Address_street_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Address" DROP CONSTRAINT "User_Address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Class" DROP CONSTRAINT "User_Class_class_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Class" DROP CONSTRAINT "User_Class_user_class_role_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Class" DROP CONSTRAINT "User_Class_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Contact" DROP CONSTRAINT "User_Contact_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Contact" DROP CONSTRAINT "User_Contact_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Credential" DROP CONSTRAINT "User_Credential_user_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Credential" DROP CONSTRAINT "User_Credential_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Item" DROP CONSTRAINT "User_Item_item_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Item" DROP CONSTRAINT "User_Item_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_NIF" DROP CONSTRAINT "User_NIF_user_id_fkey";

-- AlterTable
CREATE SEQUENCE address_street_id_seq;
ALTER TABLE "Address" ALTER COLUMN "street_id" SET DEFAULT nextval('address_street_id_seq');
ALTER SEQUENCE address_street_id_seq OWNED BY "Address"."street_id";

-- AlterTable
CREATE SEQUENCE category_category_id_seq;
ALTER TABLE "Category" ALTER COLUMN "category_id" SET DEFAULT nextval('category_category_id_seq');
ALTER SEQUENCE category_category_id_seq OWNED BY "Category"."category_id";

-- AlterTable
CREATE SEQUENCE class_class_id_seq;
ALTER TABLE "Class" ALTER COLUMN "class_id" SET DEFAULT nextval('class_class_id_seq'),
ALTER COLUMN "class_recurrence" SET DEFAULT false;
ALTER SEQUENCE class_class_id_seq OWNED BY "Class"."class_id";

-- AlterTable
CREATE SEQUENCE class_extra_fee_class_extra_fee_id_seq;
ALTER TABLE "Class_Extra_Fee" ALTER COLUMN "class_extra_fee_id" SET DEFAULT nextval('class_extra_fee_class_extra_fee_id_seq');
ALTER SEQUENCE class_extra_fee_class_extra_fee_id_seq OWNED BY "Class_Extra_Fee"."class_extra_fee_id";

-- AlterTable
CREATE SEQUENCE class_extra_fee_reason_class_extra_fee_reason_id_seq;
ALTER TABLE "Class_Extra_Fee_Reason" ALTER COLUMN "class_extra_fee_reason_id" SET DEFAULT nextval('class_extra_fee_reason_class_extra_fee_reason_id_seq');
ALTER SEQUENCE class_extra_fee_reason_class_extra_fee_reason_id_seq OWNED BY "Class_Extra_Fee_Reason"."class_extra_fee_reason_id";

-- AlterTable
CREATE SEQUENCE class_status_class_status_id_seq;
ALTER TABLE "Class_Status" ALTER COLUMN "class_status_id" SET DEFAULT nextval('class_status_class_status_id_seq');
ALTER SEQUENCE class_status_class_status_id_seq OWNED BY "Class_Status"."class_status_id";

-- AlterTable
CREATE SEQUENCE class_status_history_class_status_history_id_seq;
ALTER TABLE "Class_Status_History" ALTER COLUMN "class_status_history_id" SET DEFAULT nextval('class_status_history_class_status_history_id_seq');
ALTER SEQUENCE class_status_history_class_status_history_id_seq OWNED BY "Class_Status_History"."class_status_history_id";

-- AlterTable
CREATE SEQUENCE color_color_id_seq;
ALTER TABLE "Color" ALTER COLUMN "color_id" SET DEFAULT nextval('color_color_id_seq');
ALTER SEQUENCE color_color_id_seq OWNED BY "Color"."color_id";

-- AlterTable
CREATE SEQUENCE contact_contact_id_seq;
ALTER TABLE "Contact" ALTER COLUMN "contact_id" SET DEFAULT nextval('contact_contact_id_seq');
ALTER SEQUENCE contact_contact_id_seq OWNED BY "Contact"."contact_id";

-- AlterTable
CREATE SEQUENCE contact_type_contact_type_id_seq;
ALTER TABLE "Contact_Type" ALTER COLUMN "contact_type_id" SET DEFAULT nextval('contact_type_contact_type_id_seq');
ALTER SEQUENCE contact_type_contact_type_id_seq OWNED BY "Contact_Type"."contact_type_id";

-- AlterTable
CREATE SEQUENCE dance_type_dance_type_id_seq;
ALTER TABLE "Dance_Type" ALTER COLUMN "dance_type_id" SET DEFAULT nextval('dance_type_dance_type_id_seq');
ALTER SEQUENCE dance_type_dance_type_id_seq OWNED BY "Dance_Type"."dance_type_id";

-- AlterTable
CREATE SEQUENCE item_item_id_seq;
ALTER TABLE "Item" ALTER COLUMN "item_id" SET DEFAULT nextval('item_item_id_seq');
ALTER SEQUENCE item_item_id_seq OWNED BY "Item"."item_id";

-- AlterTable
CREATE SEQUENCE item_characteristics_item_characteristics_id_seq;
ALTER TABLE "Item_Characteristics" ALTER COLUMN "item_characteristics_id" SET DEFAULT nextval('item_characteristics_item_characteristics_id_seq');
ALTER SEQUENCE item_characteristics_item_characteristics_id_seq OWNED BY "Item_Characteristics"."item_characteristics_id";

-- AlterTable
CREATE SEQUENCE item_condition_item_condition_id_seq;
ALTER TABLE "Item_Condition" ALTER COLUMN "item_condition_id" SET DEFAULT nextval('item_condition_item_condition_id_seq');
ALTER SEQUENCE item_condition_item_condition_id_seq OWNED BY "Item_Condition"."item_condition_id";

-- AlterTable
CREATE SEQUENCE item_image_item_image_id_seq;
ALTER TABLE "Item_Image" ALTER COLUMN "item_image_id" SET DEFAULT nextval('item_image_item_image_id_seq'),
ALTER COLUMN "item_image_is_main" SET DEFAULT false;
ALTER SEQUENCE item_image_item_image_id_seq OWNED BY "Item_Image"."item_image_id";

-- AlterTable
CREATE SEQUENCE locality_locality_id_seq;
ALTER TABLE "Locality" ALTER COLUMN "locality_id" SET DEFAULT nextval('locality_locality_id_seq');
ALTER SEQUENCE locality_locality_id_seq OWNED BY "Locality"."locality_id";

-- AlterTable
CREATE SEQUENCE modality_modality_id_seq;
ALTER TABLE "Modality" ALTER COLUMN "modality_id" SET DEFAULT nextval('modality_modality_id_seq');
ALTER SEQUENCE modality_modality_id_seq OWNED BY "Modality"."modality_id";

-- AlterTable
CREATE SEQUENCE rent_item_rent_id_seq;
ALTER TABLE "Rent_Item" ALTER COLUMN "rent_id" SET DEFAULT nextval('rent_item_rent_id_seq'),
ALTER COLUMN "item_damaged" SET DEFAULT false;
ALTER SEQUENCE rent_item_rent_id_seq OWNED BY "Rent_Item"."rent_id";

-- AlterTable
CREATE SEQUENCE schedule_vacancy_schedule_vacancy_id_seq;
ALTER TABLE "Schedule_Vacancy" ALTER COLUMN "schedule_vacancy_id" SET DEFAULT nextval('schedule_vacancy_schedule_vacancy_id_seq'),
ALTER COLUMN "schedule_vacancy_recurrence" SET DEFAULT false;
ALTER SEQUENCE schedule_vacancy_schedule_vacancy_id_seq OWNED BY "Schedule_Vacancy"."schedule_vacancy_id";

-- AlterTable
CREATE SEQUENCE school_year_school_year_id_seq;
ALTER TABLE "School_Year" ALTER COLUMN "school_year_id" SET DEFAULT nextval('school_year_school_year_id_seq');
ALTER SEQUENCE school_year_school_year_id_seq OWNED BY "School_Year"."school_year_id";

-- AlterTable
CREATE SEQUENCE size_size_id_seq;
ALTER TABLE "Size" ALTER COLUMN "size_id" SET DEFAULT nextval('size_size_id_seq');
ALTER SEQUENCE size_size_id_seq OWNED BY "Size"."size_id";

-- AlterTable
CREATE SEQUENCE studio_studio_id_seq;
ALTER TABLE "Studio" ALTER COLUMN "studio_id" SET DEFAULT nextval('studio_studio_id_seq');
ALTER SEQUENCE studio_studio_id_seq OWNED BY "Studio"."studio_id";

-- AlterTable
CREATE SEQUENCE studio_modality_studio_modality_id_seq;
ALTER TABLE "Studio_Modality" ALTER COLUMN "studio_modality_id" SET DEFAULT nextval('studio_modality_studio_modality_id_seq');
ALTER SEQUENCE studio_modality_studio_modality_id_seq OWNED BY "Studio_Modality"."studio_modality_id";

-- AlterTable
CREATE SEQUENCE user_user_id_seq;
ALTER TABLE "User" ALTER COLUMN "user_id" SET DEFAULT nextval('user_user_id_seq'),
ALTER COLUMN "user_is_active" SET DEFAULT true;
ALTER SEQUENCE user_user_id_seq OWNED BY "User"."user_id";

-- AlterTable
CREATE SEQUENCE user_address_user_address_id_seq;
ALTER TABLE "User_Address" ALTER COLUMN "user_address_id" SET DEFAULT nextval('user_address_user_address_id_seq'),
ALTER COLUMN "is_main_address" SET DEFAULT false;
ALTER SEQUENCE user_address_user_address_id_seq OWNED BY "User_Address"."user_address_id";

-- AlterTable
ALTER TABLE "User_Class" ALTER COLUMN "user_validation" SET DEFAULT false;

-- AlterTable
CREATE SEQUENCE user_class_role_user_class_role_id_seq;
ALTER TABLE "User_Class_Role" ALTER COLUMN "user_class_role_id" SET DEFAULT nextval('user_class_role_user_class_role_id_seq');
ALTER SEQUENCE user_class_role_user_class_role_id_seq OWNED BY "User_Class_Role"."user_class_role_id";

-- AlterTable
CREATE SEQUENCE user_contact_user_contact_id_seq;
ALTER TABLE "User_Contact" ALTER COLUMN "user_contact_id" SET DEFAULT nextval('user_contact_user_contact_id_seq'),
ALTER COLUMN "is_main_contact" SET DEFAULT false;
ALTER SEQUENCE user_contact_user_contact_id_seq OWNED BY "User_Contact"."user_contact_id";

-- AlterTable
CREATE SEQUENCE user_type_user_type_id_seq;
ALTER TABLE "User_Type" ALTER COLUMN "user_type_id" SET DEFAULT nextval('user_type_user_type_id_seq');
ALTER SEQUENCE user_type_user_type_id_seq OWNED BY "User_Type"."user_type_id";

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_postal_code_fkey" FOREIGN KEY ("postal_code") REFERENCES "Postal_Code"("postal_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_class_status_id_fkey" FOREIGN KEY ("class_status_id") REFERENCES "Class_Status"("class_status_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "School_Year"("school_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_studio_modality_id_fkey" FOREIGN KEY ("studio_modality_id") REFERENCES "Studio_Modality"("studio_modality_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Extra_Fee" ADD CONSTRAINT "Class_Extra_Fee_class_extra_fee_reason_id_fkey" FOREIGN KEY ("class_extra_fee_reason_id") REFERENCES "Class_Extra_Fee_Reason"("class_extra_fee_reason_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Extra_Fee" ADD CONSTRAINT "Class_Extra_Fee_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_class_status_id_fkey" FOREIGN KEY ("class_status_id") REFERENCES "Class_Status"("class_status_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class_Status_History" ADD CONSTRAINT "Class_Status_History_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contact_type_id_fkey" FOREIGN KEY ("contact_type_id") REFERENCES "Contact_Type"("contact_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_item_condition_id_fkey" FOREIGN KEY ("item_condition_id") REFERENCES "Item_Condition"("item_condition_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "Color"("color_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Characteristics" ADD CONSTRAINT "Item_Characteristics_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "Size"("size_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" ADD CONSTRAINT "Item_Characteristics_Dance_Type_dance_type_id_fkey" FOREIGN KEY ("dance_type_id") REFERENCES "Dance_Type"("dance_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Characteristics_Dance_Type" ADD CONSTRAINT "Item_Characteristics_Dance_Type_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item_Image" ADD CONSTRAINT "Item_Image_item_characteristics_id_fkey" FOREIGN KEY ("item_characteristics_id") REFERENCES "Item_Characteristics"("item_characteristics_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postal_Code" ADD CONSTRAINT "Postal_Code_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "Locality"("locality_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rent_Item" ADD CONSTRAINT "Rent_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "School_Item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rent_Item" ADD CONSTRAINT "Rent_Item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Vacancy" ADD CONSTRAINT "Schedule_Vacancy_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "School_Year"("school_year_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Vacancy" ADD CONSTRAINT "Schedule_Vacancy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School_Item" ADD CONSTRAINT "School_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Number" ADD CONSTRAINT "Student_Number_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Studio_Modality" ADD CONSTRAINT "Studio_Modality_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "Modality"("modality_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Studio_Modality" ADD CONSTRAINT "Studio_Modality_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("studio_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_type_id_fkey" FOREIGN KEY ("user_type_id") REFERENCES "User_Type"("user_type_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Address" ADD CONSTRAINT "User_Address_street_id_fkey" FOREIGN KEY ("street_id") REFERENCES "Address"("street_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Address" ADD CONSTRAINT "User_Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_user_class_role_id_fkey" FOREIGN KEY ("user_class_role_id") REFERENCES "User_Class_Role"("user_class_role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Class" ADD CONSTRAINT "User_Class_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Contact" ADD CONSTRAINT "User_Contact_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("contact_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Contact" ADD CONSTRAINT "User_Contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Credential" ADD CONSTRAINT "User_Credential_user_contact_id_fkey" FOREIGN KEY ("user_contact_id") REFERENCES "User_Contact"("user_contact_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Credential" ADD CONSTRAINT "User_Credential_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Item" ADD CONSTRAINT "User_Item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_NIF" ADD CONSTRAINT "User_NIF_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
