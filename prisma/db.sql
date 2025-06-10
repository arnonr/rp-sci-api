-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE SQL_MODE='ONLY_FULL_GROUP_BYSTRICT_TRANS_TABLESNO_ZERO_IN_DATENO_ZERO_DATEERROR_FOR_DIVISION_BY_ZERONO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTSmydb DEFAULT CHARACTER SET utf8 ;
USEmydb ;

-- -----------------------------------------------------
-- Tablemydb.tbl_prefix_name
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_prefix_name (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_position
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_position (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(45)
 name_en_abbr  String?     @db.VarChar(45)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_inspector
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_inspector (
 id Int NOT
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 sort_order Int

 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB
COMMENT = 'กองตรวจราชการ';


-- -----------------------------------------------------
-- Tablemydb.tbl_bureau
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_bureau (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 sort_order Int
 inspector_id Int
 is_master CHAR(1)

 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXbureau_ibfk_inspector_idx (inspector_id ASC) VISIBLE
  CONSTRAIntbureau_ibfk_inspector
    FOREIGN KEY (inspector_id)
    REFERENCESmydb.tbl_inspector (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'กองบัญชาการ/ตำรวจภูธรภาค';


-- -----------------------------------------------------
-- Tablemydb.tbl_division
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_division (
 id Int NOT
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 bureau_id Int  COMMENT 'กองบัญชาการ/ตำรวจภูธรภาค'
 sort_order  String?     @db.VarChar(45)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXdivision_ibfk_bureau_idx (bureau_id ASC) VISIBLE
  CONSTRAIntdivision_ibfk_bureau
    FOREIGN KEY (bureau_id)
    REFERENCESmydb.tbl_bureau (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'กองบังคับการ/ตำรวจภูธรจังหวัด';


-- -----------------------------------------------------
-- Tablemydb.tbl_agency
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_agency (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 division_id Int
 sort_order Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXagency_ibfk_division_idx (division_id ASC) VISIBLE
  CONSTRAIntagency_ibfk_division
    FOREIGN KEY (division_id)
    REFERENCESmydb.tbl_division (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'สถานีตำรวจ/สน./หน่วยงานในกองบังคับการ/หน่วยงานในตำรวจภูธรจังหวัด';


-- -----------------------------------------------------
-- Tablemydb.tbl_role
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_role (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_section
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_section (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_th_abbr  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 name_en_abbr  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB
COMMENT = 'สายงานตำรวจ เช่น ปราบปราม สืบสวน ธุรการ';


-- -----------------------------------------------------
-- Tablemydb.tbl_user
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_user (
 id Int       @id @default(autoincrement())
 username  String?     @db.VarChar(32)
 prefix_name_id Int  COMMENT 'คำนำหน้าชื่อ'
 firstname  String?     @db.VarChar(100)  COMMENT 'ชื่อ'
 lastname  String?     @db.VarChar(100)  COMMENT 'นามสกุล'
 officer_code  String?     @db.VarChar(45)  COMMENT 'รหัสเจ้าหน้าที่'
 id_card  String?     @db.VarChar(45)  COMMENT 'เลขประจำตัวประชาชน'
 position_id Int  COMMENT 'ตำแหน่ง'
 section_id Int  COMMENT 'สายงานตำรวจ เช่น ปราบปราม สืบสวน ธุรการ'
 role_id Int
 inspector_id Int  COMMENT 'กองตรวจราชการ'
 bureau_id Int  COMMENT 'กองบัญชาการ'
 division_id Int  COMMENT 'กองบังคับการ/ภูธรจังหวัด'
 agency_id Int  COMMENT 'สถานีตำรวจ/สน./หน่วยงานในกองบังคับการ/หน่วยงานในตำรวจภูธรจังหวัด'
 phone_number  String?     @db.VarChar(100)  COMMENT 'หมายเลขโทรศัพท์'
 status TINYInt(1)  COMMENT 'สถานะ 1=ใช้งาน0=ปิดใช้งาน2=รออนุมัติ'
 email  String?     @db.VarChar(45)  COMMENT 'อีเมล'
 line_id  String?     @db.VarChar(45)  COMMENT 'ID Line'
 birthday DATE  COMMENT 'วันเกิด'
 file_attach  String?     @db.VarChar(100)  COMMENT 'ไฟล์หลักฐานแนบ'
 password  String?     @db.VarChar(100)  COMMENT 'รหัสผ่าน'
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXuser_ibfk_1_idx (prefix_name_id ASC) VISIBLE
  INDEXuser_ibfk_position_id_idx (position_id ASC) INVISIBLE
  INDEXuser_ibfk_division_idx (agency_id ASC) VISIBLE
  INDEXuser_ibfk_role_idx (role_id ASC) VISIBLE
  INDEXuser_ibfk_inspection_idx (inspector_id ASC) VISIBLE
  INDEXuser_ibfk_bureau_idx (bureau_id ASC) VISIBLE
  INDEXuser_ibfk_division_idx1 (division_id ASC) VISIBLE
  INDEXuser_ibfk_section_idx (section_id ASC) VISIBLE
  CONSTRAIntuser_ibfk_1
    FOREIGN KEY (prefix_name_id)
    REFERENCESmydb.tbl_prefix_name (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_position_id
    FOREIGN KEY (position_id)
    REFERENCESmydb.tbl_position (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_sub_division
    FOREIGN KEY (agency_id)
    REFERENCESmydb.tbl_agency (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_role
    FOREIGN KEY (role_id)
    REFERENCESmydb.tbl_role (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_inspector
    FOREIGN KEY (inspector_id)
    REFERENCESmydb.tbl_inspector (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_bureau
    FOREIGN KEY (bureau_id)
    REFERENCESmydb.tbl_bureau (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_division
    FOREIGN KEY (division_id)
    REFERENCESmydb.tbl_division (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_section
    FOREIGN KEY (section_id)
    REFERENCESmydb.tbl_section (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntuser_ibfk_agency
    FOREIGN KEY (agency_id)
    REFERENCESmydb.tbl_agency (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'ผู้ใช้งานระบบ';


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint_type
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint_type (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB
COMMENT = 'ประเภทการร้องเรียน ร้องเรียน เบาะแส ประชาชนร้องเรียนเจ้าหน้าที่ ตำรวจร้องเรียนตำรวจ';


-- -----------------------------------------------------
-- Tablemydb.tbl_occupation
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_occupation (
 id Int NOT
 name_th  String?     @db.VarChar(45)
 name_en  String?     @db.VarChar(45)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_complainant
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complainant (
 id Int       @id @default(autoincrement())
 uuid  String?     @db.VarChar(45)  COMMENT 'รหัสอ้างอิง UUID'
 card_type TINYInt(1)  COMMENT 'ประเภทบัตร 1=บัตรประชาชน 2=หนังสือเดินทาง'
 id_card  String?     @db.VarChar(45)
 prefix_name_id Int  COMMENT 'คำนำหน้าชื่อ'
 firstname  String?     @db.VarChar(100)  COMMENT 'ชื่อ'
 lastname  String?     @db.VarChar(100)  COMMENT 'สกุล'
 birthday DATE  COMMENT 'วันเกิด'
 occupation_id Int  COMMENT 'อาชีพ กรณีใช้ตัวเลือก'
 occupation_text  String?     @db.VarChar(100)  COMMENT 'ระบุอาชีพ'
 phone_number  String?     @db.VarChar(45)  COMMENT 'หมายเลโทรศัพท์'
 email  String?     @db.VarChar(45)  COMMENT 'อีเมล'
 line_id  String?     @db.VarChar(45)  COMMENT 'ID line'
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXcomplainant_ibfk_prefix_name_idx (prefix_name_id ASC) VISIBLE
  INDEXcomplainant_ibfk_occupation_idx (occupation_id ASC) VISIBLE
  CONSTRAIntcomplainant_ibfk_prefix_name
    FOREIGN KEY (prefix_name_id)
    REFERENCESmydb.tbl_prefix_name (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplainant_ibfk_occupation
    FOREIGN KEY (occupation_id)
    REFERENCESmydb.tbl_occupation (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_province
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_province (
 id Int NOT
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_district
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_district (
 id Int NOT
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 province_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXdistrict_ibfk_province_idx (province_id ASC) VISIBLE
  CONSTRAIntdistrict_ibfk_province
    FOREIGN KEY (province_id)
    REFERENCESmydb.tbl_province (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_sub_district
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_sub_district (
 id Int NOT
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 district_id Int
 post_code  String?     @db.VarChar(10)
 province_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXsub_district_ibfk_district_idx (district_id ASC) VISIBLE
  INDEXsub_district_ibfk_province_idx (province_id ASC) VISIBLE
  CONSTRAIntsub_district_ibfk_district
    FOREIGN KEY (district_id)
    REFERENCESmydb.tbl_district (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntsub_district_ibfk_province
    FOREIGN KEY (province_id)
    REFERENCESmydb.tbl_province (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint_channel
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint_channel (
 id Int       @id @default(autoincrement())
 name_tn  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tablemydb.tbl_topic_category
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_topic_category (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 complaint_type_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXtopic_category_ibfk_complaint_type_idx (complaint_type_id ASC) VISIBLE
  CONSTRAInttopic_category_ibfk_complaint_type
    FOREIGN KEY (complaint_type_id)
    REFERENCESmydb.tbl_complaint_type (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'ประเภทเรื่องร้องเรียน ทุจริตต่อหน้าที่ ปฎิบัติหน้าที่มิชอบ';


-- -----------------------------------------------------
-- Tablemydb.tbl_topic_type
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_topic_type (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 topic_category_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXtopic_ibfk_category_idx (topic_category_id ASC) VISIBLE
  CONSTRAInttopic_ibfk_category
    FOREIGN KEY (topic_category_id)
    REFERENCESmydb.tbl_topic_category (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'ลักษณะเรื่องร้องเรียน เช่น เบียดบังทรัพย์สิน(โกง) ละเว้นการปฏิบัติหน้าที่';


-- -----------------------------------------------------
-- Tablemydb.tbl_state
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_state (
 id Int       @id @default(autoincrement())
 name_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB
COMMENT = 'ลำดับการดำเนินเรื่อง 1. ร้องเรียนใหม่ 2.รับเรื่อง 3.ส่งกองตรวจรายการ .. ส่งกองบังคับการจังหวัก';


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint (
 id Int       @id @default(autoincrement())
 uuid  String?     @db.VarChar(45)
 complaint_code  String?     @db.VarChar(45)  COMMENT 'หมายเลขเรื่องร้องเรียน'
 tracking_satisfaction TINYInt(1)  COMMENT 'ความพึงพอใจการติดตามเรื่อง'
 tracking_satisfaction_at DateTime?  COMMENT 'ประเมินความพึงพอใจการติดตามเรื่องเมื่อเวลา'
 complaint_satisfaction TINYInt(1)  COMMENT 'ความพึงพอใจการร้องเรียน'
 complaint_satisfaction_at DateTime?  COMMENT 'ประเมินความพึงพอใจการร้องเรียนเมื่อเวลา'
 received_at DateTime?  COMMENT 'เวลารับเรื่่อง'
 received_by Int
 complaint_type_id Int  COMMENT 'ประเภทการร้องเรียน ร้องเรียน เบาะแส ประชาชนร้องเรียนเจ้าหน้าที่ ตำรวจร้องเรียนตำรวจ'
 complainant_id Int  COMMENT 'ผู้ร้องเรียน'
 is_anonymous TINYInt(1)  COMMENT 'ร้องเรียนแบบไม่ระบุตัวตน'
 complaint_title  String?     @db.VarChar(200)  COMMENT 'เรื่องร้องเรียน'
 complaint_detail TEXT(1000)  COMMENT 'รายละเอียดการร้องเรียน'
 incident_date DATE  COMMENT 'วันที่เกิดเหตุ'
 location_coordinates  String?     @db.VarChar(100)  COMMENT 'พิกัดสถานที่เกิดเหตุ (Google map)'
 incident_location  String?     @db.VarChar(200)  COMMENT 'สถานที่เกิดเหตุโดยละเอียด'
 incident_time TIME
 day_time TINYInt(1)  COMMENT 'ห้วงเวลาเกิดเหตุ 1=กลางวัน2=กลางคืน'
 file_attach_1  String?     @db.VarChar(100)  COMMENT 'ไฟล์'
 file_attach_2  String?     @db.VarChar(100)
 file_attach_3  String?     @db.VarChar(100)
 file_attach_4  String?     @db.VarChar(100)
 file_attach_5  String?     @db.VarChar(100)
 complaint_channel_id Int  COMMENT 'ช่องทางการร้องเรียน'
 inspector_id Int  COMMENT 'กองตรวจราชการ'
 bureau_id Int  COMMENT 'กองบัญชาการ/ตำรวจภูธรภาค'
 division_id Int  COMMENT 'กองบังคับการ/ภูธรจังหวัด'
 topic_type_id Int
 house_number  String?     @db.VarChar(45)
 building  String?     @db.VarChar(100)  COMMENT 'หมู่บ้าน/อาคาร'
 moo  String?     @db.VarChar(45)  COMMENT 'หมู่ที่'
 soi  String?     @db.VarChar(100)
 road  String?     @db.VarChar(100)  COMMENT 'ถนน'
 postal_code  String?     @db.VarChar(45)  COMMENT 'รหัสไปรษณีย์'
 sub_district_id Int
 district_id Int
 provice_id Int
 proceed_state_id Int  COMMENT 'ลำดับการดำเนินเรื่อง 1. ร้องเรียนใหม่ 2.รับเรื่อง 3.ส่งกองตรวจรายการ .. ส่งกองบังคับการจังหวัก'
 notice_type TINYInt(1)  COMMENT 'ช่องทางการแจ้งเตือนที่ต้องการได้ 1=SMS2=Email3=Line'
 jcoms_no  String?     @db.VarChar(45)  COMMENT 'เลขที่ JCOMS'
 pol_no  String?     @db.VarChar(45)  COMMENT 'เลขที่ POL'
 receive_no  String?     @db.VarChar(45)  COMMENT 'เลขรับ ฝรท'
 forward_no  String?     @db.VarChar(45)  COMMENT 'เลขที่หนังสือส่ง จต/ตร'
 receive_status TINYInt(1)  COMMENT '1=รับเรื่อง2=ไม่รับเรื่อง (ข้อมูลไม่ครบถ้วน)3=ไม่รับเรื่อง (เป็นการร้องทุกข์กล่าวโทษคดีอาญา)'
  PRIMARY KEY (id)
  INDEXcomplaint_ibfk_type_idx (complaint_type_id ASC) VISIBLE
  INDEXcomplaint_ibfk_complainant_idx (complainant_id ASC) VISIBLE
  INDEXcomplaint_ibfk_district_idx (district_id ASC) VISIBLE
  INDEXcomplaint_ibfk_sub_district_idx (sub_district_id ASC) VISIBLE
  INDEXcomplaint_ibfk_province_idx (provice_id ASC) VISIBLE
  INDEXcomplaint_ibfk_channel_idx (complaint_channel_id ASC) VISIBLE
  INDEXcomplaint_ibfk_bureau_idx (bureau_id ASC) VISIBLE
  INDEXcomplaint_ibfk_inspector_idx (inspector_id ASC) VISIBLE
  INDEXcomplaint_ibfk_division_idx (division_id ASC) VISIBLE
  INDEXcomplaint_ibfk_topic_type_idx (topic_type_id ASC) VISIBLE
  INDEXcomplaint_ibfk_proceed_state_idx (proceed_state_id ASC) VISIBLE
  INDEXcomplaint_ibfk_user_receive_idx (received_by ASC) VISIBLE
  CONSTRAIntcomplaint_ibfk_type
    FOREIGN KEY (complaint_type_id)
    REFERENCESmydb.tbl_complaint_type (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_complainant
    FOREIGN KEY (complainant_id)
    REFERENCESmydb.tbl_complainant (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_province
    FOREIGN KEY (provice_id)
    REFERENCESmydb.tbl_province (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_district
    FOREIGN KEY (district_id)
    REFERENCESmydb.tbl_district (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_sub_district
    FOREIGN KEY (sub_district_id)
    REFERENCESmydb.tbl_sub_district (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_channel
    FOREIGN KEY (complaint_channel_id)
    REFERENCESmydb.tbl_complaint_channel (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_inspector
    FOREIGN KEY (inspector_id)
    REFERENCESmydb.tbl_inspector (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_bureau
    FOREIGN KEY (bureau_id)
    REFERENCESmydb.tbl_bureau (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_division
    FOREIGN KEY (division_id)
    REFERENCESmydb.tbl_division (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_topic_type
    FOREIGN KEY (topic_type_id)
    REFERENCESmydb.tbl_topic_type (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_proceed_state
    FOREIGN KEY (proceed_state_id)
    REFERENCESmydb.tbl_state (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntcomplaint_ibfk_user_receive
    FOREIGN KEY (received_by)
    REFERENCESmydb.tbl_user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'ตารางข้อมูลการร้องเรียน';


-- -----------------------------------------------------
-- Tablemydb.tbl_accused
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_accused (
 id Int       @id @default(autoincrement())
 prefix_name_id Int
 firstname  String?     @db.VarChar(100)
 lastname  String?     @db.VarChar(100)
 position_id Int
 section_id Int  COMMENT 'สายงานตำรวจ เช่น ปราบปราม สืบสวน ธุรการ'
 agency_id Int  COMMENT 'สถานีตำรวจ/สน./หน่วยงานในกองบังคับการ/หน่วยงานในตำรวจภูธรจังหวัด'
 inspector_id Int  COMMENT 'กองตรวจราชการ'
 bureau_id Int  COMMENT 'กองบัญชาการ'
 division_id Int  COMMENT 'กองบังคับการ/ภูธรจังหวัด'
 complaint_id Int
 type TINYInt(1)  COMMENT 'ประเภทผู้ถูกกล่าวหา 1=ประชาชน2=ตำรวจ'
 detail  String?     @db.VarChar(200)  COMMENT 'รายละเอียด'
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXaccused_ibfk_complaint_idx (complaint_id ASC) VISIBLE
  CONSTRAIntaccused_ibfk_complaint
    FOREIGN KEY (complaint_id)
    REFERENCESmydb.tbl_complaint (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'ผู้ถูกกล่าวหา';


-- -----------------------------------------------------
-- Tablemydb.tbl_order
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_order (
 id Int NOT
 name_th  String?     @db.VarChar(45)
 name_en  String?     @db.VarChar(45)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id))
ENGINE = InnoDB
COMMENT = 'ข้อสั่งการ 1=พิจารณาดำเนินการตามอำนาจหน้าที่ 2=เป็นข้อมูลในการปฏิบัติราชการ 3=เร่งรัดติตตามผล';


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint_forward
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint_forward (
 id Int       @id @default(autoincrement())
 complaint_id Int  COMMENT 'วันที่หนังสือส่งต่อ'
 forward_doc_no  String?     @db.VarChar(100)  COMMENT 'เลขหนังสือส่ง'
 forward_doc_date DATE  COMMENT 'วันที่ออกหนังสือส่ง'
 from_inspector_id Int
 from_bureau_id Int
 from_agency_id Int  COMMENT 'จากหน่วยงาน'
 from_division_id Int
 to_inspector_id Int
 to_bureau_id Int
 to_division_id Int
 to_agency_id Int  COMMENT 'ถึงหน่วยงาน (สน.)'
 receive_doc_no  String?     @db.VarChar(100)  COMMENT 'เลขที่ลงรับเรื่อง'
 receive_doc_date  String?     @db.VarChar(100)  COMMENT 'วันที่ลงรับเรื่อง'
 order_id Int  COMMENT 'ข้อสั่งการ ให้หน่วยงานรับเรื่องปฏิบัติ'
 assignment_detail  String?     @db.VarChar(200)  COMMENT '(ข้อสั่งการ) ระบุหมายเหตุ'
 receive_status_is Int
 order_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXforward_ibfk_complaint_idx (complaint_id ASC) VISIBLE
  INDEXforward_ibfk_from_inspector_idx (from_inspector_id ASC) VISIBLE
  INDEXforward_ibfk_from_bureau_idx (from_bureau_id ASC) VISIBLE
  INDEXforward_ibfk_from_division_idx (from_division_id ASC) VISIBLE
  INDEXforward_ibfk_from_agency_idx (from_agency_id ASC) VISIBLE
  INDEXforward_ibfk_to_inspector_idx (to_inspector_id ASC) VISIBLE
  INDEXforward_ibfk_to_bureau_idx (to_bureau_id ASC) VISIBLE
  INDEXforward_ibfk_to_division_idx (to_division_id ASC) VISIBLE
  INDEXforward_ibfk_to_agency_idx (to_agency_id ASC) VISIBLE
  INDEXforward_ibfk_order_idx (order_id ASC) VISIBLE
  CONSTRAIntforward_ibfk_complaint
    FOREIGN KEY (complaint_id)
    REFERENCESmydb.tbl_complaint (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_from_inspector
    FOREIGN KEY (from_inspector_id)
    REFERENCESmydb.tbl_inspector (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_from_bureau
    FOREIGN KEY (from_bureau_id)
    REFERENCESmydb.tbl_bureau (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_from_division
    FOREIGN KEY (from_division_id)
    REFERENCESmydb.tbl_division (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_from_agency
    FOREIGN KEY (from_agency_id)
    REFERENCESmydb.tbl_agency (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_to_inspector
    FOREIGN KEY (to_inspector_id)
    REFERENCESmydb.tbl_inspector (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_to_bureau
    FOREIGN KEY (to_bureau_id)
    REFERENCESmydb.tbl_bureau (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_to_division
    FOREIGN KEY (to_division_id)
    REFERENCESmydb.tbl_division (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_to_agency
    FOREIGN KEY (to_agency_id)
    REFERENCESmydb.tbl_agency (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntforward_ibfk_order
    FOREIGN KEY (order_id)
    REFERENCESmydb.tbl_order (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'การส่งต่อเรื่องร้องเรียน';


-- -----------------------------------------------------
-- Tablemydb.tbl_proceed_status
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_proceed_status (
 id Int       @id @default(autoincrement())
 namt_th  String?     @db.VarChar(100)
 name_en  String?     @db.VarChar(100)
 state_id Int
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXstatus_ibfk_state_idx (state_id ASC) VISIBLE
  CONSTRAIntstatus_ibfk_state
    FOREIGN KEY (state_id)
    REFERENCESmydb.tbl_state (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'สถานะการดำเนินเรื่อง';


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint_repoting
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint_repoting (
 id Int       @id @default(autoincrement())
 complaint_id Int
 proceed_status_id Int
 from_inspector_id Int
 from_bureau_id Int
 from_division_id Int
 from_agency_id Int
 to_inspector_id Int
 to_bureau_id Int
 to_division_id Int
 to_agency_id Int
 proceed_state_id Int  COMMENT 'ลำดับการดำเนินเรื่อง 1. ร้องเรียนใหม่ 2.รับเรื่อง 3.ส่งกองตรวจรายการ .. ส่งกองบังคับการจังหวัด'

 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXreport_ibfk_complaint_idx (complaint_id ASC) VISIBLE
  INDEXreport_ibfk_proceed_idx (proceed_status_id ASC) VISIBLE
  INDEXreport_ibfk_proceed_state_idx (proceed_state_id ASC) VISIBLE
  CONSTRAIntreport_ibfk_complaint
    FOREIGN KEY (complaint_id)
    REFERENCESmydb.tbl_complaint (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntreport_ibfk_proceed_status
    FOREIGN KEY (proceed_status_id)
    REFERENCESmydb.tbl_proceed_status (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
  CONSTRAIntreport_ibfk_proceed_state
    FOREIGN KEY (proceed_state_id)
    REFERENCESmydb.tbl_state (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'การรายงานผลการดำเนินการ';


-- -----------------------------------------------------
-- Tablemydb.tbl_complaint_follow
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_complaint_follow (
 id Int       @id @default(autoincrement())
 complaint_id Int
 detail  String?     @db.VarChar(200)
 created_at DateTime? @default(now())
 created_by  String?     @db.VarChar(32)
 updated_at DateTime? @default(now())
 updated_by  String?     @db.VarChar(32)
 deleted_at DateTime?
 deleted_by  String?     @db.VarChar(32)
 is_active Int?      @default(1)
  PRIMARY KEY (id)
  INDEXcomplaint_follow_ibfk_complaint_idx (complaint_id ASC) VISIBLE
  CONSTRAIntcomplaint_follow_ibfk_complaint
    FOREIGN KEY (complaint_id)
    REFERENCESmydb.tbl_complainant (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'การติดตามเรื่องร้องเรียน';


-- -----------------------------------------------------
-- Tablemydb.tbl_login_log
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.tbl_login_log (
 id Int       @id @default(autoincrement())
 user_id Int
 logined_at DateTime?
  INDEXloginlog_ibfk_user_idx (user_id ASC) VISIBLE
  CONSTRAIntloginlog_ibfk_user
    FOREIGN KEY (user_id)
    REFERENCESmydb.tbl_user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
COMMENT = 'Log ยืนยันตัวตนเข้าใช้งาน';


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
