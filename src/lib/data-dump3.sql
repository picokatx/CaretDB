-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: caretdb
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `added_node_mutation`
--

DROP TABLE IF EXISTS `added_node_mutation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `added_node_mutation` (
  `event_id` char(36) NOT NULL,
  `parent_id` int NOT NULL,
  `next_id` int DEFAULT NULL,
  `node_id` int NOT NULL,
  PRIMARY KEY (`event_id`,`parent_id`,`node_id`),
  KEY `fk_added_node_mutation_node_id` (`node_id`),
  CONSTRAINT `added_node_mutation_ibfk_1` FOREIGN KEY (`node_id`) REFERENCES `serialized_node` (`id`),
  CONSTRAINT `fk_added_node_mutation_event_id` FOREIGN KEY (`event_id`) REFERENCES `mutation_data` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_added_node_mutation_node_id` FOREIGN KEY (`node_id`) REFERENCES `serialized_node` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `added_node_mutation`
--

LOCK TABLES `added_node_mutation` WRITE;
/*!40000 ALTER TABLE `added_node_mutation` DISABLE KEYS */;
INSERT INTO `added_node_mutation` VALUES ('7ec8e4d6-562b-4a3f-b523-93e1b39cedf1',74,NULL,83),('7ec8e4d6-562b-4a3f-b523-93e1b39cedf1',83,NULL,84),('8e1f946d-ba78-45b6-b1e7-6cf1c7dd4dde',74,NULL,82),('8e1f946d-ba78-45b6-b1e7-6cf1c7dd4dde',82,NULL,83),('91f036d1-92b1-4f72-b171-0c1dbab08473',60,NULL,84),('b14b3bfe-cd3f-417d-8658-9cb1a2687489',60,NULL,85),('b14b3bfe-cd3f-417d-8658-9cb1a2687489',85,NULL,86);
/*!40000 ALTER TABLE `added_node_mutation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute_mutation`
--

DROP TABLE IF EXISTS `attribute_mutation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_mutation` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  PRIMARY KEY (`event_id`,`node_id`),
  CONSTRAINT `fk_attribute_mutation_event_id` FOREIGN KEY (`event_id`) REFERENCES `mutation_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_mutation`
--

LOCK TABLES `attribute_mutation` WRITE;
/*!40000 ALTER TABLE `attribute_mutation` DISABLE KEYS */;
INSERT INTO `attribute_mutation` VALUES ('3d142c46-d38a-47e2-93bd-92c55b739ea7',83),('422192d1-9415-48fc-8be6-01dd50b307d3',83),('a1bc0dd9-3b69-44d9-b261-d854409920b3',83);
/*!40000 ALTER TABLE `attribute_mutation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attribute_mutation_entry`
--

DROP TABLE IF EXISTS `attribute_mutation_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute_mutation_entry` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  `attribute_key` char(32) NOT NULL,
  `string_value` text,
  `style_om_value_id` int DEFAULT NULL,
  PRIMARY KEY (`event_id`,`node_id`,`attribute_key`),
  KEY `fk_attribute_mutation_entry_style_om_value_id` (`style_om_value_id`),
  CONSTRAINT `fk_attribute_mutation_entry_event_id_node_id` FOREIGN KEY (`event_id`, `node_id`) REFERENCES `attribute_mutation` (`event_id`, `node_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attribute_mutation_entry_style_om_value_id` FOREIGN KEY (`style_om_value_id`) REFERENCES `style_om_value` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attribute_mutation_entry`
--

LOCK TABLES `attribute_mutation_entry` WRITE;
/*!40000 ALTER TABLE `attribute_mutation_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `attribute_mutation_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `console_log`
--

DROP TABLE IF EXISTS `console_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `console_log` (
  `log_id` char(36) NOT NULL,
  `replay_id` char(36) NOT NULL,
  `level` enum('log','warn','error','info','debug') NOT NULL,
  `payload` json NOT NULL,
  `delay` int NOT NULL,
  `timestamp` timestamp NOT NULL,
  `trace` text,
  PRIMARY KEY (`log_id`),
  KEY `fk_console_log_replay` (`replay_id`),
  CONSTRAINT `fk_console_log_replay` FOREIGN KEY (`replay_id`) REFERENCES `replay` (`replay_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `console_log`
--

LOCK TABLES `console_log` WRITE;
/*!40000 ALTER TABLE `console_log` DISABLE KEYS */;
INSERT INTO `console_log` VALUES ('04fed3db-8a73-49b8-8ebe-bcd759c811dd','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"Added element #1\"]',644,'2025-05-06 03:09:21',NULL),('19795f68-28a6-4aa9-9cfe-92cea4c7e503','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"PerformanceObserver started for network resources.\"]',0,'2025-05-06 02:47:42',NULL),('1ad91ca7-60fc-42c3-a02a-182fd0eed82b','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Changed color to:\", \"#8e2ff3\"]',2803,'2025-05-06 02:47:45',NULL),('21c9ff83-1020-4316-aa0f-b4485630be0e','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"XHR and Fetch APIs intercepted for network logging.\"]',0,'2025-05-06 03:09:21',NULL),('313de357-ceb2-4a32-8986-f10f90d39c98','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Changed color to:\", \"#db3df7\"]',978,'2025-05-06 02:47:43',NULL),('47dcbc30-03d4-4594-b259-35891ac989cc','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Changed color to:\", \"#58461f\"]',3395,'2025-05-06 02:47:45',NULL),('4afdc0fa-2aa9-406e-905b-7bfa9e86cab1','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"Form submitted:\", \"{\\\"name\\\":\\\"\\\",\\\"message\\\":\\\"\\\"}\"]',2407,'2025-05-06 03:09:23',NULL),('4c663be9-9d20-42f3-abe8-69432d147d16','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"XHR and Fetch APIs intercepted for network logging.\"]',0,'2025-05-06 02:47:42',NULL),('b2dfde57-1266-45c8-8d97-049241286022','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Changed color to:\", \"#d31392\"]',3244,'2025-05-06 02:47:45',NULL),('b31c4481-49bd-405b-931c-113f4b1159e3','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"API response:\", \"{\\\"userId\\\":1,\\\"id\\\":1,\\\"title\\\":\\\"delectus aut autem\\\",\\\"completed\\\":false}\"]',1624,'2025-05-06 03:09:22',NULL),('b33fd450-2ecb-41c1-a34d-96ed7c12fa2a','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Form submitted:\", \"{\\\"name\\\":\\\"A\\\",\\\"message\\\":\\\"\\\"}\"]',7716,'2025-05-06 02:47:50',NULL),('cacc83d3-8ff5-4711-89b3-2d1739b36c10','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"rrweb recording started.\"]',3,'2025-05-06 03:09:21',NULL),('e52f8d43-5ae2-443d-9248-6a9e548a1f14','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"rrweb recording started.\"]',2,'2025-05-06 02:47:42',NULL),('ec063543-6acd-45c1-abb4-cd54bdcbdc5d','c1affc40-cb6d-4b55-afb5-d1467a526650','log','[\"PerformanceObserver started for network resources.\"]',0,'2025-05-06 03:09:21',NULL),('fc183699-04a5-4fa5-9b65-938e91dad748','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','log','[\"Added element #1\"]',2068,'2025-05-06 02:47:44',NULL);
/*!40000 ALTER TABLE `console_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cookie`
--

DROP TABLE IF EXISTS `cookie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cookie` (
  `name` varchar(256) NOT NULL,
  `html_hash` char(64) NOT NULL,
  `path` varchar(256) DEFAULT NULL,
  `secure` tinyint(1) NOT NULL DEFAULT '0',
  `http_only` tinyint(1) NOT NULL DEFAULT '0',
  `size` int DEFAULT NULL,
  `expiry` timestamp NULL DEFAULT NULL,
  `domain` varchar(4096) DEFAULT NULL,
  `value` varchar(4096) DEFAULT NULL,
  `same_site` varchar(20) DEFAULT NULL,
  `last_accessed` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`,`html_hash`),
  KEY `html_hash` (`html_hash`),
  CONSTRAINT `cookie_ibfk_1` FOREIGN KEY (`html_hash`) REFERENCES `webstate` (`html_hash`),
  CONSTRAINT `cookie_chk_1` CHECK ((regexp_like(`path`,_utf8mb4'^/.*') and (length(`path`) <= 256))),
  CONSTRAINT `cookie_chk_2` CHECK ((`size` between 1 and 4096)),
  CONSTRAINT `cookie_chk_3` CHECK (regexp_like(`domain`,_utf8mb4'^[a-za-z0-9-]+(\\.[a-za-z0-9-]+)+$')),
  CONSTRAINT `cookie_chk_4` CHECK ((`same_site` in (_utf8mb4'strict',_utf8mb4'lax',_utf8mb4'none')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cookie`
--

LOCK TABLES `cookie` WRITE;
/*!40000 ALTER TABLE `cookie` DISABLE KEYS */;
/*!40000 ALTER TABLE `cookie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `event_id` char(36) NOT NULL,
  `replay_id` char(36) NOT NULL,
  `type` enum('fullsnapshot','incrementalsnapshot','meta') NOT NULL,
  `timestamp` timestamp NOT NULL,
  `delay` int DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `fk_event_replay` (`replay_id`),
  CONSTRAINT `fk_event_replay` FOREIGN KEY (`replay_id`) REFERENCES `replay` (`replay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES ('01c7c03d-d7cf-4914-a5d8-a60223973dc9','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2714),('04e023b8-74f7-446d-abb0-576ad6398b41','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',2296),('05271424-f969-41c2-be24-3d9d86dfa6aa','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1400),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:49',6558),('10135461-b750-4348-9a76-2d1264095fb1','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7441),('10932bef-476c-4df4-af88-58caa7b8e47e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:51',8831),('11591f1e-e85d-4a3a-8cd9-537868d0a4eb','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',4283),('146457bf-5207-4865-b2bb-0f3d8c567317','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7716),('1666ca7e-45a8-4638-9f9e-9cf4bf847882','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3244),('17e4cb02-75be-4b7d-b682-33bc87d4fc8f','c1affc40-cb6d-4b55-afb5-d1467a526650','fullsnapshot','2025-05-06 03:09:21',2),('2403a329-ea1e-4c8f-a221-2631647f831e','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',577),('267a4cc2-ea4f-4c6e-ae5b-22663a27de00','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1400),('286c4cf9-8835-420d-bd4c-fe1bca81df5f','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',160),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4908),('2a643bab-50e7-41bb-8e99-9b72f49fe8cd','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',2297),('2bd1550c-acca-4026-ad08-e366595ff6f3','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1052),('2c898c3d-f6bd-4bd1-883f-77a097af824c','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',4310),('2c94facb-a3f6-4164-a287-114f58ed6cbe','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3244),('31037e7c-f576-4f7a-94f4-cc46a17e3cbe','c1affc40-cb6d-4b55-afb5-d1467a526650','meta','2025-05-06 03:09:21',0),('362f90da-ff70-47c7-9a8d-9c9ae35fbf0e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:49',6458),('3af55354-922b-46ac-8951-f4f46c8a3d05','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',3877),('3afea630-f0c0-4e57-baf6-132c50d863d1','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:49',7236),('3c944262-11c2-4605-978e-58b38173391d','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1729),('3d142c46-d38a-47e2-93bd-92c55b739ea7','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3395),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',924),('3e3b5c71-4c1b-4aa1-be9d-f350796a9c85','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2803),('3e666c94-6193-4961-ae7a-17ef96d66cad','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','fullsnapshot','2025-05-06 02:47:42',1),('403652c7-b812-4a72-89b4-77ed01f1477b','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4700),('41209881-7b51-4463-9f3f-df3ac0c8e499','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',1995),('41c49762-981e-45f4-b251-16e042f4b312','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1051),('41dd566e-27c7-43a3-bfb5-1ea905086aa7','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',2297),('422192d1-9415-48fc-8be6-01dd50b307d3','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2803),('429981a4-2e46-4c4e-a143-8a3fe39e4136','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:48',6316),('45c23492-5178-4615-a5ec-deaaaee19663','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',111),('48c3beca-704c-4a6e-8f75-6c252de4e933','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4107),('493e15b9-493e-4f10-a6da-6338910b6b93','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',2068),('4f57d809-dfcb-4460-8ead-9ba22a076cdf','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',978),('4fb1099d-b4a8-437f-8ea8-195531da0693','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4188),('506bcf6a-ce2d-4251-81e4-59f93fe385de','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',3558),('52d28c73-fe39-46a6-9c80-2c77947d5af5','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',3976),('546b70e1-4fb2-4b1f-993e-7d4c447bf8eb','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',978),('55991f81-167c-48a0-96be-2139cb025041','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4283),('57174b8b-7afc-415f-93a3-314f9b0df030','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7644),('57a44813-7991-4dbe-bd75-baf8ecf69fbe','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1272),('5c3c2a07-2906-433a-997c-4d40cad3c028','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4283),('5e654eb6-97d7-4b5e-a859-89536eb49f9a','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',3746),('5f1a0c83-a0bd-44fe-a26d-199839f819d9','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4491),('613ee32f-a62f-4c39-abd1-88db4cf904e3','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1834),('63eb2a8d-ad98-4494-9c89-246342347b48','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',4077),('65678a0f-c6bc-4c72-91af-ae109c049e77','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',2407),('67ed7d62-5129-4ea3-be61-d2ef6227362d','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',5371),('6870b7e0-bb44-4e4d-b03d-460d798d93f9','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',1940),('6acb6453-68da-4fc2-9617-32dfdc056f0c','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',644),('7099f381-ec9e-4217-bcdd-be9a9a23aa16','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4807),('7123e805-a5d6-413e-bd39-238bfdbb1677','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2714),('72a77ac2-0c65-40f1-a71d-b04e1faa0072','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:24',3728),('75fd1484-2636-4e3c-af2f-6e6720e06757','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',644),('77fd750d-a1ad-45d1-b800-c86f6f2aacca','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:51',7507),('797d963c-5eb5-4487-8e96-dec56db90d3c','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1128),('798f237a-578f-48b3-a4c1-0b2188bafd6e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3395),('7e631b25-f03e-4739-90f3-ed0c56d98cd7','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1272),('7ec8e4d6-562b-4a3f-b523-93e1b39cedf1','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',2078),('7f7754a9-b2a1-488e-b723-3f84b247a000','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',177),('802e0941-f3a4-4ddc-84a3-ad2c7bf8543e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7643),('8041d4b5-8c84-4675-b185-a2dff75c8951','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',377),('828778e9-28dd-466f-b7a8-660f3db6fe23','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',350),('83945eda-8602-4596-afe6-a6d00d83b553','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:51',8831),('84067d62-1d8f-4126-8189-92f702a81b9e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3172),('843c6c32-2022-4275-8bb1-671188e2889f','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',277),('8ce8e33b-7caa-4ce1-bde8-9e9767bc1c24','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3395),('8d46297a-f695-496f-a862-e3c50b9dbf47','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7330),('8da4a131-593e-4b1c-b21f-b71626460499','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7643),('8db1e89f-450a-45bd-811e-00956af882f8','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2824),('8e1f946d-ba78-45b6-b1e7-6cf1c7dd4dde','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',646),('8e72de4f-4511-4b05-a362-8267cc7cc26d','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4212),('8ea4956f-337e-4e34-909e-e2c0d598f4b1','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',1995),('91f036d1-92b1-4f72-b171-0c1dbab08473','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1553),('97887041-66ea-4402-8298-3611a7303c08','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',3854),('988c9d08-c5da-4d80-b948-0cedf9958d25','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',2407),('98d26d94-f798-4ab1-bfdc-00f301331da5','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4598),('a1bc0dd9-3b69-44d9-b261-d854409920b3','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3245),('a35ac020-9b8b-4bfb-9fab-18261bca5f04','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',1995),('a4dca148-a495-47f0-8715-7d88d36f6530','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',1841),('a9073e46-2c50-41cd-a276-18fe7fdbfa6c','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4187),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:23',1643),('ac04b0a2-8d41-4680-92b6-f7725922466b','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:24',2143),('b14b3bfe-cd3f-417d-8658-9cb1a2687489','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1625),('b5cf0753-d4c8-4110-b830-554703d8b1be','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','meta','2025-05-06 02:47:42',0),('b64c88b9-459e-4a77-aa8c-d4bd83a1549c','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1552),('b8df30f3-d890-4cd9-ab00-1828a26789a8','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',4408),('b9c3286f-f014-4772-9c59-cdfbb3d46956','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4320),('bb591242-108e-4634-8c55-380eceda798c','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',5371),('bb90197b-e5bc-4c85-bf0c-188f1d881741','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',634),('be1c489b-39f6-459d-8908-b9c38431c48d','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',891),('bf0ed483-db44-4fe8-9d27-58e1664eb1b3','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',525),('c5c75a06-460e-4c85-b54f-1bb388ad9e21','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:52',9357),('c76e6cbe-125e-4a32-b35d-371fa9b52a2b','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',891),('c7efe748-c00c-4fa7-b5cc-c46f3699f55e','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3395),('c836cbf5-1784-4b5c-9d0b-98dfeb580900','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',3315),('c9ef1ece-92aa-4dc8-9e91-5d84c6690c15','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',611),('ca52fbf9-276c-4f88-a233-32e5eaff8080','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1552),('cd515eec-6033-4d69-8628-3cc2250133a8','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:26',5130),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',1424),('cf7d8915-39c7-4ff4-be32-bcdfaf28894a','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',5293),('cfc565e9-bc9e-4cb2-a498-91c0f539f71f','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',979),('d1bc0c83-d56b-4147-8e5c-939ec724a086','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',1209),('d26bf5f4-3457-4703-9aa5-137b7bdccbfe','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:47',5293),('e39d33c1-6dbd-4a2b-a505-103a388aa4b7','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:50',7716),('e4c8fc64-6c56-4069-84e7-e56303f88080','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:22',979),('f04ff43d-5edb-437a-9715-7da7590ddf00','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:52',9779),('f08c1b4a-abb7-4c82-ac58-40f8b1367ca3','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:44',2067),('f10e384a-db97-4c6b-96bd-3070ad237e83','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2714),('f1ddc98b-380c-426d-95ca-e5940c1a956a','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2802),('f272afc0-6f4c-42dc-b861-7f16a4046084','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:51',9207),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',4041),('f534da47-509b-411e-aa30-f50873f224e1','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:49',7340),('f5bc2b9f-29de-4d6f-9699-a9904c6cb5d4','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:25',4177),('f70dc373-caa3-49d5-a07d-72f111d66222','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:42',285),('f928c85c-ab0f-4f16-adb1-706f4e6cdfe4','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:21',577),('fdf9a88a-b673-4421-8742-833577a96c1a','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:43',611),('fef7795a-9826-4585-a369-d90f87bd445e','c1affc40-cb6d-4b55-afb5-d1467a526650','incrementalsnapshot','2025-05-06 03:09:24',3728),('ff202f18-822b-4e27-b671-d016cdceb704','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:45',2324),('ff47bec2-e79f-4e93-b14c-f1368d6757a8','b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','incrementalsnapshot','2025-05-06 02:47:46',3641);
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export/console_log.csv`
--

DROP TABLE IF EXISTS `export/console_log.csv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export/console_log.csv` (
  `log_id` text,
  `replay_id` text,
  `level` text,
  `payload` text,
  `delay` text,
  `timestamp` text,
  `trace` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export/console_log.csv`
--

LOCK TABLES `export/console_log.csv` WRITE;
/*!40000 ALTER TABLE `export/console_log.csv` DISABLE KEYS */;
INSERT INTO `export/console_log.csv` VALUES ('log_id','replay_id','level','payload','delay','timestamp','trace'),('a7f5ea73-dadb-42ab-b188-10d6aba13dbf','4f63ab19-79d1-4279-9094-9a5a4acce517','log','PerformanceObserver started for network resources.','0','2025-05-06T01:57:00.000Z',NULL),('acba79bb-3231-44f4-af3f-8542ba8ae8e2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','rrweb recording started.','2','2025-05-06T01:57:00.000Z',NULL),('b3e595a9-5fe6-4feb-b943-8e6007dac3a2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','Changed color to:,#2da83d','1090','2025-05-06T01:57:01.000Z',NULL),('c76b8be5-2ae1-43b6-b4a6-bfc69f1a0343','4f63ab19-79d1-4279-9094-9a5a4acce517','log','XHR and Fetch APIs intercepted for network logging.','0','2025-05-06T01:57:00.000Z',NULL),('acba79bb-3231-44f4-af3f-8542ba8ae8e2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','rrweb recording started.','2','2025-05-06T01:57:00.000Z',NULL),('b3e595a9-5fe6-4feb-b943-8e6007dac3a2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','Changed color to:,#2da83d','1090','2025-05-06T01:57:01.000Z',NULL),('c76b8be5-2ae1-43b6-b4a6-bfc69f1a0343','4f63ab19-79d1-4279-9094-9a5a4acce517','log','XHR and Fetch APIs intercepted for network logging.','0','2025-05-06T01:57:00.000Z',NULL),('a7f5ea73-dadb-42ab-b188-10d6aba13dbf','4f63ab19-79d1-4279-9094-9a5a4acce517','log','PerformanceObserver started for network resources.','0','2025-05-06T01:57:00.000Z',NULL),('acba79bb-3231-44f4-af3f-8542ba8ae8e2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','rrweb recording started.','2','2025-05-06T01:57:00.000Z',NULL),('b3e595a9-5fe6-4feb-b943-8e6007dac3a2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','Changed color to:,#2da83d','1090','2025-05-06T01:57:01.000Z',NULL),('c76b8be5-2ae1-43b6-b4a6-bfc69f1a0343','4f63ab19-79d1-4279-9094-9a5a4acce517','log','XHR and Fetch APIs intercepted for network logging.','0','2025-05-06T01:57:00.000Z',NULL);
/*!40000 ALTER TABLE `export/console_log.csv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `export\console_log.csv`
--

DROP TABLE IF EXISTS `export\console_log.csv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `export\console_log.csv` (
  `log_id` text,
  `replay_id` text,
  `level` text,
  `payload` text,
  `delay` text,
  `timestamp` text,
  `trace` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `export\console_log.csv`
--

LOCK TABLES `export\console_log.csv` WRITE;
/*!40000 ALTER TABLE `export\console_log.csv` DISABLE KEYS */;
INSERT INTO `export\console_log.csv` VALUES ('log_id','replay_id','level','payload','delay','timestamp','trace'),('a7f5ea73-dadb-42ab-b188-10d6aba13dbf','4f63ab19-79d1-4279-9094-9a5a4acce517','log','PerformanceObserver started for network resources.','0','2025-05-06T01:57:00.000Z',NULL),('acba79bb-3231-44f4-af3f-8542ba8ae8e2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','rrweb recording started.','2','2025-05-06T01:57:00.000Z',NULL),('b3e595a9-5fe6-4feb-b943-8e6007dac3a2','4f63ab19-79d1-4279-9094-9a5a4acce517','log','Changed color to:,#2da83d','1090','2025-05-06T01:57:01.000Z',NULL),('c76b8be5-2ae1-43b6-b4a6-bfc69f1a0343','4f63ab19-79d1-4279-9094-9a5a4acce517','log','XHR and Fetch APIs intercepted for network logging.','0','2025-05-06T01:57:00.000Z',NULL);
/*!40000 ALTER TABLE `export\console_log.csv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `font_data`
--

DROP TABLE IF EXISTS `font_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `font_data` (
  `event_id` char(36) NOT NULL,
  `family` text NOT NULL,
  `font_source` text NOT NULL,
  `buffer` tinyint(1) NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_font_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `font_data`
--

LOCK TABLES `font_data` WRITE;
/*!40000 ALTER TABLE `font_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `font_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `font_descriptor`
--

DROP TABLE IF EXISTS `font_descriptor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `font_descriptor` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` char(36) NOT NULL,
  `descriptor_key` text NOT NULL,
  `descriptor_value` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_font_descriptor_event_id` (`event_id`),
  CONSTRAINT `fk_font_descriptor_event_id` FOREIGN KEY (`event_id`) REFERENCES `font_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `font_descriptor`
--

LOCK TABLES `font_descriptor` WRITE;
/*!40000 ALTER TABLE `font_descriptor` DISABLE KEYS */;
/*!40000 ALTER TABLE `font_descriptor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `full_snapshot_event`
--

DROP TABLE IF EXISTS `full_snapshot_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `full_snapshot_event` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  `initial_offset_top` int NOT NULL,
  `initial_offset_left` int NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `fk_full_snapshot_event_node_id` (`node_id`),
  CONSTRAINT `fk_full_snapshot_event_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_full_snapshot_event_node_id` FOREIGN KEY (`node_id`) REFERENCES `serialized_node` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `full_snapshot_event`
--

LOCK TABLES `full_snapshot_event` WRITE;
/*!40000 ALTER TABLE `full_snapshot_event` DISABLE KEYS */;
INSERT INTO `full_snapshot_event` VALUES ('17e4cb02-75be-4b7d-b682-33bc87d4fc8f',1,555,0),('3e666c94-6193-4961-ae7a-17ef96d66cad',1,555,0);
/*!40000 ALTER TABLE `full_snapshot_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incremental_snapshot_event`
--

DROP TABLE IF EXISTS `incremental_snapshot_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incremental_snapshot_event` (
  `event_id` char(36) NOT NULL,
  `t` enum('mutation','mousemove','mouseinteraction','scroll','viewportresize','input','touchmove','mediainteraction','stylesheetrule','canvasmutation','font','log','drag','styledeclaration','selection','adoptedstylesheet','customelement') NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_incremental_snapshot_event_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incremental_snapshot_event`
--

LOCK TABLES `incremental_snapshot_event` WRITE;
/*!40000 ALTER TABLE `incremental_snapshot_event` DISABLE KEYS */;
INSERT INTO `incremental_snapshot_event` VALUES ('01c7c03d-d7cf-4914-a5d8-a60223973dc9','mouseinteraction'),('04e023b8-74f7-446d-abb0-576ad6398b41','mouseinteraction'),('05271424-f969-41c2-be24-3d9d86dfa6aa','mouseinteraction'),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410','mousemove'),('10135461-b750-4348-9a76-2d1264095fb1','scroll'),('10932bef-476c-4df4-af88-58caa7b8e47e','mouseinteraction'),('11591f1e-e85d-4a3a-8cd9-537868d0a4eb','scroll'),('146457bf-5207-4865-b2bb-0f3d8c567317','mouseinteraction'),('1666ca7e-45a8-4638-9f9e-9cf4bf847882','mouseinteraction'),('2403a329-ea1e-4c8f-a221-2631647f831e','mouseinteraction'),('267a4cc2-ea4f-4c6e-ae5b-22663a27de00','mouseinteraction'),('286c4cf9-8835-420d-bd4c-fe1bca81df5f','mousemove'),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889','mousemove'),('2a643bab-50e7-41bb-8e99-9b72f49fe8cd','mouseinteraction'),('2bd1550c-acca-4026-ad08-e366595ff6f3','mouseinteraction'),('2c898c3d-f6bd-4bd1-883f-77a097af824c','mousemove'),('2c94facb-a3f6-4164-a287-114f58ed6cbe','mouseinteraction'),('362f90da-ff70-47c7-9a8d-9c9ae35fbf0e','mousemove'),('3af55354-922b-46ac-8951-f4f46c8a3d05','mousemove'),('3afea630-f0c0-4e57-baf6-132c50d863d1','scroll'),('3c944262-11c2-4605-978e-58b38173391d','scroll'),('3d142c46-d38a-47e2-93bd-92c55b739ea7','mutation'),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6','mousemove'),('3e3b5c71-4c1b-4aa1-be9d-f350796a9c85','mouseinteraction'),('403652c7-b812-4a72-89b4-77ed01f1477b','scroll'),('41209881-7b51-4463-9f3f-df3ac0c8e499','mouseinteraction'),('41c49762-981e-45f4-b251-16e042f4b312','mouseinteraction'),('41dd566e-27c7-43a3-bfb5-1ea905086aa7','mouseinteraction'),('422192d1-9415-48fc-8be6-01dd50b307d3','mutation'),('429981a4-2e46-4c4e-a143-8a3fe39e4136','input'),('45c23492-5178-4615-a5ec-deaaaee19663','mousemove'),('48c3beca-704c-4a6e-8f75-6c252de4e933','scroll'),('493e15b9-493e-4f10-a6da-6338910b6b93','mouseinteraction'),('4f57d809-dfcb-4460-8ead-9ba22a076cdf','mouseinteraction'),('4fb1099d-b4a8-437f-8ea8-195531da0693','mouseinteraction'),('506bcf6a-ce2d-4251-81e4-59f93fe385de','mousemove'),('52d28c73-fe39-46a6-9c80-2c77947d5af5','scroll'),('546b70e1-4fb2-4b1f-993e-7d4c447bf8eb','mouseinteraction'),('55991f81-167c-48a0-96be-2139cb025041','mouseinteraction'),('57174b8b-7afc-415f-93a3-314f9b0df030','mouseinteraction'),('57a44813-7991-4dbe-bd75-baf8ecf69fbe','mouseinteraction'),('5c3c2a07-2906-433a-997c-4d40cad3c028','mouseinteraction'),('5e654eb6-97d7-4b5e-a859-89536eb49f9a','scroll'),('5f1a0c83-a0bd-44fe-a26d-199839f819d9','scroll'),('613ee32f-a62f-4c39-abd1-88db4cf904e3','scroll'),('63eb2a8d-ad98-4494-9c89-246342347b48','scroll'),('65678a0f-c6bc-4c72-91af-ae109c049e77','mouseinteraction'),('67ed7d62-5129-4ea3-be61-d2ef6227362d','mouseinteraction'),('6870b7e0-bb44-4e4d-b03d-460d798d93f9','scroll'),('6acb6453-68da-4fc2-9617-32dfdc056f0c','mouseinteraction'),('7099f381-ec9e-4217-bcdd-be9a9a23aa16','scroll'),('7123e805-a5d6-413e-bd39-238bfdbb1677','mouseinteraction'),('72a77ac2-0c65-40f1-a71d-b04e1faa0072','mouseinteraction'),('75fd1484-2636-4e3c-af2f-6e6720e06757','mouseinteraction'),('77fd750d-a1ad-45d1-b800-c86f6f2aacca','mousemove'),('797d963c-5eb5-4487-8e96-dec56db90d3c','mousemove'),('798f237a-578f-48b3-a4c1-0b2188bafd6e','mouseinteraction'),('7e631b25-f03e-4739-90f3-ed0c56d98cd7','mouseinteraction'),('7ec8e4d6-562b-4a3f-b523-93e1b39cedf1','mutation'),('7f7754a9-b2a1-488e-b723-3f84b247a000','scroll'),('802e0941-f3a4-4ddc-84a3-ad2c7bf8543e','mouseinteraction'),('8041d4b5-8c84-4675-b185-a2dff75c8951','scroll'),('828778e9-28dd-466f-b7a8-660f3db6fe23','mousemove'),('83945eda-8602-4596-afe6-a6d00d83b553','mouseinteraction'),('84067d62-1d8f-4126-8189-92f702a81b9e','mouseinteraction'),('843c6c32-2022-4275-8bb1-671188e2889f','scroll'),('8ce8e33b-7caa-4ce1-bde8-9e9767bc1c24','mouseinteraction'),('8d46297a-f695-496f-a862-e3c50b9dbf47','mousemove'),('8da4a131-593e-4b1c-b21f-b71626460499','mouseinteraction'),('8db1e89f-450a-45bd-811e-00956af882f8','mousemove'),('8e1f946d-ba78-45b6-b1e7-6cf1c7dd4dde','mutation'),('8e72de4f-4511-4b05-a362-8267cc7cc26d','scroll'),('8ea4956f-337e-4e34-909e-e2c0d598f4b1','mouseinteraction'),('91f036d1-92b1-4f72-b171-0c1dbab08473','mutation'),('97887041-66ea-4402-8298-3611a7303c08','scroll'),('988c9d08-c5da-4d80-b948-0cedf9958d25','mouseinteraction'),('98d26d94-f798-4ab1-bfdc-00f301331da5','scroll'),('a1bc0dd9-3b69-44d9-b261-d854409920b3','mutation'),('a35ac020-9b8b-4bfb-9fab-18261bca5f04','mouseinteraction'),('a4dca148-a495-47f0-8715-7d88d36f6530','mousemove'),('a9073e46-2c50-41cd-a276-18fe7fdbfa6c','mouseinteraction'),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54','mousemove'),('ac04b0a2-8d41-4680-92b6-f7725922466b','mousemove'),('b14b3bfe-cd3f-417d-8658-9cb1a2687489','mutation'),('b64c88b9-459e-4a77-aa8c-d4bd83a1549c','mouseinteraction'),('b8df30f3-d890-4cd9-ab00-1828a26789a8','mousemove'),('b9c3286f-f014-4772-9c59-cdfbb3d46956','scroll'),('bb591242-108e-4634-8c55-380eceda798c','mouseinteraction'),('bb90197b-e5bc-4c85-bf0c-188f1d881741','mousemove'),('be1c489b-39f6-459d-8908-b9c38431c48d','mouseinteraction'),('bf0ed483-db44-4fe8-9d27-58e1664eb1b3','mouseinteraction'),('c5c75a06-460e-4c85-b54f-1bb388ad9e21','mousemove'),('c76e6cbe-125e-4a32-b35d-371fa9b52a2b','mouseinteraction'),('c7efe748-c00c-4fa7-b5cc-c46f3699f55e','mouseinteraction'),('c836cbf5-1784-4b5c-9d0b-98dfeb580900','mouseinteraction'),('c9ef1ece-92aa-4dc8-9e91-5d84c6690c15','mouseinteraction'),('ca52fbf9-276c-4f88-a233-32e5eaff8080','mouseinteraction'),('cd515eec-6033-4d69-8628-3cc2250133a8','mouseinteraction'),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9','mousemove'),('cf7d8915-39c7-4ff4-be32-bcdfaf28894a','mouseinteraction'),('cfc565e9-bc9e-4cb2-a498-91c0f539f71f','mouseinteraction'),('d1bc0c83-d56b-4147-8e5c-939ec724a086','mouseinteraction'),('d26bf5f4-3457-4703-9aa5-137b7bdccbfe','mouseinteraction'),('e39d33c1-6dbd-4a2b-a505-103a388aa4b7','mouseinteraction'),('e4c8fc64-6c56-4069-84e7-e56303f88080','mouseinteraction'),('f04ff43d-5edb-437a-9715-7da7590ddf00','mouseinteraction'),('f08c1b4a-abb7-4c82-ac58-40f8b1367ca3','mouseinteraction'),('f10e384a-db97-4c6b-96bd-3070ad237e83','mouseinteraction'),('f1ddc98b-380c-426d-95ca-e5940c1a956a','mouseinteraction'),('f272afc0-6f4c-42dc-b861-7f16a4046084','mousemove'),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe','mousemove'),('f534da47-509b-411e-aa30-f50873f224e1','scroll'),('f5bc2b9f-29de-4d6f-9699-a9904c6cb5d4','scroll'),('f70dc373-caa3-49d5-a07d-72f111d66222','mousemove'),('f928c85c-ab0f-4f16-adb1-706f4e6cdfe4','mouseinteraction'),('fdf9a88a-b673-4421-8742-833577a96c1a','mouseinteraction'),('fef7795a-9826-4585-a369-d90f87bd445e','mouseinteraction'),('ff202f18-822b-4e27-b671-d016cdceb704','mousemove'),('ff47bec2-e79f-4e93-b14c-f1368d6757a8','scroll');
/*!40000 ALTER TABLE `incremental_snapshot_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `input_data`
--

DROP TABLE IF EXISTS `input_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `input_data` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  `text` text NOT NULL,
  `is_checked` tinyint(1) NOT NULL,
  `user_triggered` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_input_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `input_data`
--

LOCK TABLES `input_data` WRITE;
/*!40000 ALTER TABLE `input_data` DISABLE KEYS */;
INSERT INTO `input_data` VALUES ('429981a4-2e46-4c4e-a143-8a3fe39e4136',36,'*',0,0);
/*!40000 ALTER TABLE `input_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;

/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_input_data_insert_mask` BEFORE INSERT ON `input_data` FOR EACH ROW begin

    declare v_user_privacy_mask boolean default true; 

    declare v_replay_id char(36);

    declare v_html_hash char(64);

    declare v_email_domain varchar(255);

    declare v_email_name varchar(64);



    select replay_id into v_replay_id from event where event_id = new.event_id limit 1;



    if v_replay_id is not null then

        select html_hash into v_html_hash from replay where replay_id = v_replay_id limit 1;



        if v_html_hash is not null then

            select email_domain, email_name into v_email_domain, v_email_name from webstate where html_hash = v_html_hash limit 1;



            if v_email_domain is not null and v_email_name is not null then

                select privacy_mask into v_user_privacy_mask from user where email_domain = v_email_domain and email_name = v_email_name limit 1;

            end if;

        end if;

    end if;



    if v_user_privacy_mask = true then

        set new.text = repeat('*', length(new.text));

    end if;

end */;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `media_interaction_data`
--

DROP TABLE IF EXISTS `media_interaction_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_interaction_data` (
  `event_id` char(36) NOT NULL,
  `interaction_type` enum('play','pause','seeked','volumechange','ratechange') NOT NULL,
  `node_id` int NOT NULL,
  `time` decimal(8,4) DEFAULT NULL,
  `volume` decimal(8,4) DEFAULT NULL,
  `muted` tinyint(1) DEFAULT NULL,
  `isloop` tinyint(1) DEFAULT NULL,
  `playback_rate` decimal(8,4) DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_media_interaction_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_interaction_data`
--

LOCK TABLES `media_interaction_data` WRITE;
/*!40000 ALTER TABLE `media_interaction_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_interaction_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meta_event`
--

DROP TABLE IF EXISTS `meta_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meta_event` (
  `event_id` char(36) NOT NULL,
  `href` text NOT NULL,
  `width` int NOT NULL,
  `height` int NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_meta_event_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meta_event`
--

LOCK TABLES `meta_event` WRITE;
/*!40000 ALTER TABLE `meta_event` DISABLE KEYS */;
INSERT INTO `meta_event` VALUES ('31037e7c-f576-4f7a-94f4-cc46a17e3cbe','http://localhost:4321/dom/f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013.html',697,398),('b5cf0753-d4c8-4110-b830-554703d8b1be','http://localhost:4321/dom/f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013.html',697,398);
/*!40000 ALTER TABLE `meta_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `monthly_reports`
--

DROP TABLE IF EXISTS `monthly_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `monthly_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `report_month_start` date NOT NULL,
  `report_month_end` date NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `new_users_count` int unsigned NOT NULL DEFAULT '0',
  `new_webstates_count` int unsigned NOT NULL DEFAULT '0',
  `new_replays_count` int unsigned NOT NULL DEFAULT '0',
  `new_events_count` bigint unsigned NOT NULL DEFAULT '0',
  `total_users_end` int unsigned NOT NULL DEFAULT '0',
  `total_webstates_end` int unsigned NOT NULL DEFAULT '0',
  `total_replays_end` int unsigned NOT NULL DEFAULT '0',
  `total_events_end` bigint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`report_id`),
  UNIQUE KEY `uk_report_month` (`report_month_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `monthly_reports`
--

LOCK TABLES `monthly_reports` WRITE;
/*!40000 ALTER TABLE `monthly_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `monthly_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mouse_interaction_data`
--

DROP TABLE IF EXISTS `mouse_interaction_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mouse_interaction_data` (
  `event_id` char(36) NOT NULL,
  `interaction_type` enum('mouseup','mousedown','click','contextmenu','dblclick','focus','blur','touchstart','touchmove_departed','touchend','touchcancel') NOT NULL,
  `node_id` int NOT NULL,
  `x` int DEFAULT NULL,
  `y` int DEFAULT NULL,
  `pointer_type` enum('mouse','pen','touch') DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_mouse_interaction_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mouse_interaction_data`
--

LOCK TABLES `mouse_interaction_data` WRITE;
/*!40000 ALTER TABLE `mouse_interaction_data` DISABLE KEYS */;
INSERT INTO `mouse_interaction_data` VALUES ('01c7c03d-d7cf-4914-a5d8-a60223973dc9','focus',71,NULL,NULL,NULL),('04e023b8-74f7-446d-abb0-576ad6398b41','mousedown',47,83,256,NULL),('05271424-f969-41c2-be24-3d9d86dfa6aa','mousedown',57,139,164,NULL),('10932bef-476c-4df4-af88-58caa7b8e47e','focus',47,NULL,NULL,NULL),('146457bf-5207-4865-b2bb-0f3d8c567317','mouseup',47,90,261,NULL),('1666ca7e-45a8-4638-9f9e-9cf4bf847882','mouseup',71,186,221,NULL),('2403a329-ea1e-4c8f-a221-2631647f831e','mousedown',68,127,356,NULL),('267a4cc2-ea4f-4c6e-ae5b-22663a27de00','focus',57,NULL,NULL,NULL),('2a643bab-50e7-41bb-8e99-9b72f49fe8cd','focus',47,NULL,NULL,NULL),('2bd1550c-acca-4026-ad08-e366595ff6f3','click',60,128,184,NULL),('2c94facb-a3f6-4164-a287-114f58ed6cbe','click',71,186,221,NULL),('3e3b5c71-4c1b-4aa1-be9d-f350796a9c85','click',71,186,224,NULL),('41209881-7b51-4463-9f3f-df3ac0c8e499','mousedown',68,121,198,NULL),('41c49762-981e-45f4-b251-16e042f4b312','mouseup',60,128,184,NULL),('41dd566e-27c7-43a3-bfb5-1ea905086aa7','blur',57,NULL,NULL,NULL),('493e15b9-493e-4f10-a6da-6338910b6b93','click',68,121,198,NULL),('4f57d809-dfcb-4460-8ead-9ba22a076cdf','mouseup',71,240,195,NULL),('4fb1099d-b4a8-437f-8ea8-195531da0693','blur',71,NULL,NULL,NULL),('546b70e1-4fb2-4b1f-993e-7d4c447bf8eb','click',71,240,195,NULL),('55991f81-167c-48a0-96be-2139cb025041','mouseup',29,144,132,NULL),('57174b8b-7afc-415f-93a3-314f9b0df030','focus',47,NULL,NULL,NULL),('57a44813-7991-4dbe-bd75-baf8ecf69fbe','mouseup',52,133,174,NULL),('5c3c2a07-2906-433a-997c-4d40cad3c028','click',19,144,132,NULL),('65678a0f-c6bc-4c72-91af-ae109c049e77','click',47,83,256,NULL),('67ed7d62-5129-4ea3-be61-d2ef6227362d','click',36,154,228,NULL),('6acb6453-68da-4fc2-9617-32dfdc056f0c','mouseup',68,124,356,NULL),('7123e805-a5d6-413e-bd39-238bfdbb1677','mousedown',71,186,224,NULL),('72a77ac2-0c65-40f1-a71d-b04e1faa0072','focus',47,NULL,NULL,NULL),('75fd1484-2636-4e3c-af2f-6e6720e06757','click',68,124,356,NULL),('798f237a-578f-48b3-a4c1-0b2188bafd6e','dblclick',71,186,221,NULL),('7e631b25-f03e-4739-90f3-ed0c56d98cd7','click',52,133,174,NULL),('802e0941-f3a4-4ddc-84a3-ad2c7bf8543e','blur',36,NULL,NULL,NULL),('83945eda-8602-4596-afe6-a6d00d83b553','blur',47,NULL,NULL,NULL),('84067d62-1d8f-4126-8189-92f702a81b9e','mousedown',71,186,221,NULL),('8ce8e33b-7caa-4ce1-bde8-9e9767bc1c24','mouseup',71,186,221,NULL),('8da4a131-593e-4b1c-b21f-b71626460499','mousedown',47,90,261,NULL),('8ea4956f-337e-4e34-909e-e2c0d598f4b1','blur',71,NULL,NULL,NULL),('988c9d08-c5da-4d80-b948-0cedf9958d25','mouseup',47,83,256,NULL),('a35ac020-9b8b-4bfb-9fab-18261bca5f04','focus',68,NULL,NULL,NULL),('a9073e46-2c50-41cd-a276-18fe7fdbfa6c','mousedown',54,144,132,NULL),('b64c88b9-459e-4a77-aa8c-d4bd83a1549c','click',57,139,164,NULL),('bb591242-108e-4634-8c55-380eceda798c','mouseup',36,154,228,NULL),('be1c489b-39f6-459d-8908-b9c38431c48d','focus',71,NULL,NULL,NULL),('bf0ed483-db44-4fe8-9d27-58e1664eb1b3','mousedown',65,242,164,NULL),('c76e6cbe-125e-4a32-b35d-371fa9b52a2b','mousedown',71,240,194,NULL),('c7efe748-c00c-4fa7-b5cc-c46f3699f55e','click',71,186,221,NULL),('c836cbf5-1784-4b5c-9d0b-98dfeb580900','mousedown',71,186,221,NULL),('c9ef1ece-92aa-4dc8-9e91-5d84c6690c15','click',65,242,164,NULL),('ca52fbf9-276c-4f88-a233-32e5eaff8080','mouseup',57,139,164,NULL),('cd515eec-6033-4d69-8628-3cc2250133a8','blur',47,NULL,NULL,NULL),('cf7d8915-39c7-4ff4-be32-bcdfaf28894a','focus',36,NULL,NULL,NULL),('cfc565e9-bc9e-4cb2-a498-91c0f539f71f','mousedown',60,128,189,NULL),('d1bc0c83-d56b-4147-8e5c-939ec724a086','mousedown',52,133,174,NULL),('d26bf5f4-3457-4703-9aa5-137b7bdccbfe','mousedown',36,154,228,NULL),('e39d33c1-6dbd-4a2b-a505-103a388aa4b7','click',47,90,261,NULL),('e4c8fc64-6c56-4069-84e7-e56303f88080','blur',68,NULL,NULL,NULL),('f04ff43d-5edb-437a-9715-7da7590ddf00','blur',47,NULL,NULL,NULL),('f08c1b4a-abb7-4c82-ac58-40f8b1367ca3','mouseup',68,121,198,NULL),('f10e384a-db97-4c6b-96bd-3070ad237e83','blur',68,NULL,NULL,NULL),('f1ddc98b-380c-426d-95ca-e5940c1a956a','mouseup',71,186,224,NULL),('f928c85c-ab0f-4f16-adb1-706f4e6cdfe4','focus',68,NULL,NULL,NULL),('fdf9a88a-b673-4421-8742-833577a96c1a','mouseup',65,242,164,NULL),('fef7795a-9826-4585-a369-d90f87bd445e','blur',47,NULL,NULL,NULL);
/*!40000 ALTER TABLE `mouse_interaction_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mouse_position`
--

DROP TABLE IF EXISTS `mouse_position`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mouse_position` (
  `event_id` char(36) NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  `node_id` int NOT NULL,
  `time_offset` int NOT NULL,
  PRIMARY KEY (`event_id`,`node_id`,`time_offset`),
  CONSTRAINT `fk_mouse_position_event_id` FOREIGN KEY (`event_id`) REFERENCES `mousemove_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mouse_position`
--

LOCK TABLES `mouse_position` WRITE;
/*!40000 ALTER TABLE `mouse_position` DISABLE KEYS */;
INSERT INTO `mouse_position` VALUES ('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',152,233,36,-400),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',92,304,44,-334),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',74,326,44,-284),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',80,328,44,-200),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',108,328,44,-150),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',112,328,44,-84),('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410',112,329,44,0),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',159,322,63,-224),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',140,344,68,-174),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',132,351,68,-124),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',127,356,68,-73),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',159,321,71,-283),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',156,323,74,-457),('286c4cf9-8835-420d-bd4c-fe1bca81df5f',159,320,74,-350),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',158,163,26,-447),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',159,166,26,-381),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',159,186,31,-331),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',159,191,31,-281),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',158,200,31,-231),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',154,214,36,-181),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',154,228,36,-123),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889',154,228,36,-31),('2c898c3d-f6bd-4bd1-883f-77a097af824c',323,184,24,-424),('2c898c3d-f6bd-4bd1-883f-77a097af824c',318,188,31,-374),('2c898c3d-f6bd-4bd1-883f-77a097af824c',316,188,31,-324),('2c898c3d-f6bd-4bd1-883f-77a097af824c',304,200,31,-258),('2c898c3d-f6bd-4bd1-883f-77a097af824c',293,224,36,-208),('2c898c3d-f6bd-4bd1-883f-77a097af824c',274,273,39,-158),('2c898c3d-f6bd-4bd1-883f-77a097af824c',254,330,44,-104),('2c898c3d-f6bd-4bd1-883f-77a097af824c',239,368,44,-41),('362f90da-ff70-47c7-9a8d-9c9ae35fbf0e',154,230,36,0),('3af55354-922b-46ac-8951-f4f46c8a3d05',637,137,44,-357),('3af55354-922b-46ac-8951-f4f46c8a3d05',427,176,44,-306),('3af55354-922b-46ac-8951-f4f46c8a3d05',324,184,44,-230),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6',240,195,71,-374),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6',240,196,71,-240),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6',240,198,71,-141),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6',240,202,71,-84),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6',238,203,71,-7),('45c23492-5178-4615-a5ec-deaaaee19663',110,396,19,0),('506bcf6a-ce2d-4251-81e4-59f93fe385de',186,219,71,-279),('77fd750d-a1ad-45d1-b800-c86f6f2aacca',96,289,29,-1325),('77fd750d-a1ad-45d1-b800-c86f6f2aacca',92,271,47,-1275),('797d963c-5eb5-4487-8e96-dec56db90d3c',134,174,52,-331),('797d963c-5eb5-4487-8e96-dec56db90d3c',138,166,52,-280),('797d963c-5eb5-4487-8e96-dec56db90d3c',131,181,60,-496),('828778e9-28dd-466f-b7a8-660f3db6fe23',242,170,65,-151),('828778e9-28dd-466f-b7a8-660f3db6fe23',239,200,71,-391),('828778e9-28dd-466f-b7a8-660f3db6fe23',240,194,71,-85),('828778e9-28dd-466f-b7a8-660f3db6fe23',235,272,74,-442),('8d46297a-f695-496f-a862-e3c50b9dbf47',110,328,19,-57),('8d46297a-f695-496f-a862-e3c50b9dbf47',104,320,19,-2),('8d46297a-f695-496f-a862-e3c50b9dbf47',111,328,29,-129),('8db1e89f-450a-45bd-811e-00956af882f8',186,222,71,-505),('8db1e89f-450a-45bd-811e-00956af882f8',186,221,71,-238),('a4dca148-a495-47f0-8715-7d88d36f6530',124,200,68,-464),('a4dca148-a495-47f0-8715-7d88d36f6530',122,199,68,-414),('a4dca148-a495-47f0-8715-7d88d36f6530',123,198,68,-181),('a4dca148-a495-47f0-8715-7d88d36f6530',124,198,68,-131),('a4dca148-a495-47f0-8715-7d88d36f6530',125,199,68,-81),('a4dca148-a495-47f0-8715-7d88d36f6530',128,201,68,-31),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',149,229,39,-33),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',173,163,44,-243),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',177,168,44,-183),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',180,185,44,-133),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',177,203,44,-83),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',140,163,57,-483),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',142,162,57,-433),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54',164,162,57,-375),('ac04b0a2-8d41-4680-92b6-f7725922466b',110,247,47,-1585),('ac04b0a2-8d41-4680-92b6-f7725922466b',94,252,47,-1535),('ac04b0a2-8d41-4680-92b6-f7725922466b',83,256,47,-1485),('b8df30f3-d890-4cd9-ab00-1828a26789a8',149,156,19,-441),('b8df30f3-d890-4cd9-ab00-1828a26789a8',149,156,19,-391),('b8df30f3-d890-4cd9-ab00-1828a26789a8',151,158,26,-58),('bb90197b-e5bc-4c85-bf0c-188f1d881741',127,196,52,-257),('bb90197b-e5bc-4c85-bf0c-188f1d881741',128,186,60,-77),('bb90197b-e5bc-4c85-bf0c-188f1d881741',125,248,63,-310),('bb90197b-e5bc-4c85-bf0c-188f1d881741',126,356,68,-486),('bb90197b-e5bc-4c85-bf0c-188f1d881741',124,344,68,-427),('bb90197b-e5bc-4c85-bf0c-188f1d881741',123,331,68,-375),('c5c75a06-460e-4c85-b54f-1bb388ad9e21',349,327,19,-384),('c5c75a06-460e-4c85-b54f-1bb388ad9e21',369,308,24,-434),('c5c75a06-460e-4c85-b54f-1bb388ad9e21',384,284,29,-484),('c5c75a06-460e-4c85-b54f-1bb388ad9e21',332,357,52,-334),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',148,212,63,-109),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',132,207,68,-58),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',128,205,68,-8),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',228,208,71,-375),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',208,216,71,-275),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',197,216,71,-225),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9',185,214,71,-173),('f272afc0-6f4c-42dc-b861-7f16a4046084',652,145,24,-132),('f272afc0-6f4c-42dc-b861-7f16a4046084',396,264,29,-32),('f272afc0-6f4c-42dc-b861-7f16a4046084',456,236,44,-81),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe',144,140,24,0),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe',187,208,52,-300),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe',148,140,57,-243),('f70dc373-caa3-49d5-a07d-72f111d66222',204,377,19,0),('ff202f18-822b-4e27-b671-d016cdceb704',150,216,63,-434),('ff202f18-822b-4e27-b671-d016cdceb704',159,230,63,-384),('ff202f18-822b-4e27-b671-d016cdceb704',162,233,63,-284),('ff202f18-822b-4e27-b671-d016cdceb704',180,233,63,-218),('ff202f18-822b-4e27-b671-d016cdceb704',136,206,68,-484),('ff202f18-822b-4e27-b671-d016cdceb704',184,226,71,-168);
/*!40000 ALTER TABLE `mouse_position` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mousemove_data`
--

DROP TABLE IF EXISTS `mousemove_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mousemove_data` (
  `event_id` char(36) NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_mousemove_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mousemove_data`
--

LOCK TABLES `mousemove_data` WRITE;
/*!40000 ALTER TABLE `mousemove_data` DISABLE KEYS */;
INSERT INTO `mousemove_data` VALUES ('0d1cf379-fda2-4d7f-a28b-2bf4dd48d410'),('286c4cf9-8835-420d-bd4c-fe1bca81df5f'),('2973ff4d-e8f8-42ee-9ef2-b8bfbbeff889'),('2c898c3d-f6bd-4bd1-883f-77a097af824c'),('362f90da-ff70-47c7-9a8d-9c9ae35fbf0e'),('3af55354-922b-46ac-8951-f4f46c8a3d05'),('3d4caecd-7d08-4ceb-9faf-5d578d1b97c6'),('45c23492-5178-4615-a5ec-deaaaee19663'),('506bcf6a-ce2d-4251-81e4-59f93fe385de'),('77fd750d-a1ad-45d1-b800-c86f6f2aacca'),('797d963c-5eb5-4487-8e96-dec56db90d3c'),('828778e9-28dd-466f-b7a8-660f3db6fe23'),('8d46297a-f695-496f-a862-e3c50b9dbf47'),('8db1e89f-450a-45bd-811e-00956af882f8'),('a4dca148-a495-47f0-8715-7d88d36f6530'),('aa52fcd1-43de-462b-a8f0-35c04f2c4e54'),('ac04b0a2-8d41-4680-92b6-f7725922466b'),('b8df30f3-d890-4cd9-ab00-1828a26789a8'),('bb90197b-e5bc-4c85-bf0c-188f1d881741'),('c5c75a06-460e-4c85-b54f-1bb388ad9e21'),('cf2b4c7e-09bf-4f54-9dc6-54daeeadebb9'),('f272afc0-6f4c-42dc-b861-7f16a4046084'),('f51b8f3f-bc9d-4a50-b10e-27f5d0a78afe'),('f70dc373-caa3-49d5-a07d-72f111d66222'),('ff202f18-822b-4e27-b671-d016cdceb704');
/*!40000 ALTER TABLE `mousemove_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mutation_data`
--

DROP TABLE IF EXISTS `mutation_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mutation_data` (
  `event_id` char(36) NOT NULL,
  `is_attach_iframe` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_mutation_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mutation_data`
--

LOCK TABLES `mutation_data` WRITE;
/*!40000 ALTER TABLE `mutation_data` DISABLE KEYS */;
INSERT INTO `mutation_data` VALUES ('3d142c46-d38a-47e2-93bd-92c55b739ea7',0),('422192d1-9415-48fc-8be6-01dd50b307d3',0),('7ec8e4d6-562b-4a3f-b523-93e1b39cedf1',0),('8e1f946d-ba78-45b6-b1e7-6cf1c7dd4dde',0),('91f036d1-92b1-4f72-b171-0c1dbab08473',0),('a1bc0dd9-3b69-44d9-b261-d854409920b3',0),('b14b3bfe-cd3f-417d-8658-9cb1a2687489',0);
/*!40000 ALTER TABLE `mutation_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `network_request`
--

DROP TABLE IF EXISTS `network_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `network_request` (
  `request_log_id` char(36) NOT NULL,
  `replay_id` char(36) NOT NULL,
  `request_session_id` varchar(64) NOT NULL,
  `url` text NOT NULL,
  `method` varchar(16) NOT NULL,
  `status_code` smallint unsigned DEFAULT NULL,
  `status_text` varchar(255) DEFAULT NULL,
  `request_type` varchar(32) DEFAULT NULL,
  `initiator_type` varchar(32) DEFAULT NULL,
  `start_time_offset` int unsigned NOT NULL,
  `end_time_offset` int unsigned DEFAULT NULL,
  `duration_ms` int unsigned DEFAULT NULL,
  `absolute_timestamp` timestamp NOT NULL,
  `request_headers` json DEFAULT NULL,
  `response_headers` json DEFAULT NULL,
  `response_size_bytes` int unsigned DEFAULT NULL,
  `performance_data` json DEFAULT NULL,
  `is_fetch_complete` tinyint(1) DEFAULT NULL,
  `is_perf_complete` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`request_log_id`),
  KEY `idx_network_request_replay_id` (`replay_id`),
  CONSTRAINT `fk_network_request_replay` FOREIGN KEY (`replay_id`) REFERENCES `replay` (`replay_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `network_request`
--

LOCK TABLES `network_request` WRITE;
/*!40000 ALTER TABLE `network_request` DISABLE KEYS */;
INSERT INTO `network_request` VALUES ('c9c2797f-8e90-4487-8a37-7e7fc28715b4','c1affc40-cb6d-4b55-afb5-d1467a526650','fetch-1746529762637-b0s3h10sa','https://jsonplaceholder.typicode.com/todos/1','GET',200,'','fetch','fetch',4296,4367,70,'2025-05-06 03:09:22','{}','{\"pragma\": \"no-cache\", \"expires\": \"Tue, 06 May 2025 23:09:22 GMT\", \"content-type\": \"application/json; charset=utf-8\", \"cache-control\": \"public, max-age=43200\"}',83,'{\"size\": 0, \"duration\": 69.80000001192093, \"startTime\": 4296.600000023842, \"responseEnd\": 4366.400000035763, \"initiatorType\": \"fetch\"}',1,1);
/*!40000 ALTER TABLE `network_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `removed_node_mutation`
--

DROP TABLE IF EXISTS `removed_node_mutation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `removed_node_mutation` (
  `event_id` char(36) NOT NULL,
  `parent_id` int NOT NULL,
  `node_id` int NOT NULL,
  `is_shadow` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`event_id`,`node_id`),
  CONSTRAINT `fk_removed_node_mutation_node_id` FOREIGN KEY (`event_id`) REFERENCES `mutation_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `removed_node_mutation`
--

LOCK TABLES `removed_node_mutation` WRITE;
/*!40000 ALTER TABLE `removed_node_mutation` DISABLE KEYS */;
INSERT INTO `removed_node_mutation` VALUES ('b14b3bfe-cd3f-417d-8658-9cb1a2687489',60,84,0);
/*!40000 ALTER TABLE `removed_node_mutation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `replay`
--

DROP TABLE IF EXISTS `replay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replay` (
  `replay_id` char(36) NOT NULL,
  `html_hash` char(64) NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `product` varchar(24) DEFAULT NULL,
  `product_version` varchar(24) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `device_type` varchar(24) DEFAULT NULL,
  `os_type` varchar(24) DEFAULT NULL,
  `os_version` varchar(16) DEFAULT NULL,
  `network_id` varchar(15) DEFAULT NULL,
  `host_id` varchar(4096) DEFAULT NULL,
  `d_viewport_height` int DEFAULT NULL,
  `d_viewport_width` int DEFAULT NULL,
  PRIMARY KEY (`replay_id`),
  KEY `fk_replay_webstate` (`html_hash`),
  CONSTRAINT `fk_replay_webstate` FOREIGN KEY (`html_hash`) REFERENCES `webstate` (`html_hash`),
  CONSTRAINT `chk_viewport_height` CHECK ((`d_viewport_height` > 0)),
  CONSTRAINT `chk_viewport_width` CHECK ((`d_viewport_width` > 0)),
  CONSTRAINT `correct_times` CHECK ((`start_time` <= `end_time`)),
  CONSTRAINT `replay_chk_1` CHECK ((`product` in (_utf8mb4'chrome',_utf8mb4'mozilla',_utf8mb4'applewebkit',_utf8mb4'safari',_utf8mb4'edge'))),
  CONSTRAINT `replay_chk_2` CHECK (regexp_like(`product_version`,_utf8mb4'^[0-9]+(\\.[0-9]+)*$')),
  CONSTRAINT `replay_chk_3` CHECK ((`device_type` in (_utf8mb4'desktop',_utf8mb4'mobile',_utf8mb4'tablet',_utf8mb4'unknown'))),
  CONSTRAINT `replay_chk_4` CHECK ((`os_type` in (_utf8mb4'windows nt',_utf8mb4'macintosh',_utf8mb4'linux',_utf8mb4'ios',_utf8mb4'android'))),
  CONSTRAINT `replay_chk_5` CHECK (regexp_like(`os_version`,_utf8mb4'^[0-9]+(_[0-9]+)*(\\.?[0-9]+)*$')),
  CONSTRAINT `replay_chk_6` CHECK (regexp_like(`network_id`,_utf8mb4'^[0-9]{1,3}(\\.[0-9]{1,3}){3}$')),
  CONSTRAINT `replay_chk_7` CHECK (regexp_like(`host_id`,_utf8mb4'^[a-za-z0-9-]+(\\.[a-za-z0-9-]+)+$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `replay`
--

LOCK TABLES `replay` WRITE;
/*!40000 ALTER TABLE `replay` DISABLE KEYS */;
INSERT INTO `replay` VALUES ('b4d2c582-c18f-4dc6-9b1c-d2e522f92e00','f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013','2025-05-06 02:47:42','2025-05-06 02:47:52',NULL,NULL,NULL,'Unknown',NULL,NULL,NULL,NULL,697,398),('c1affc40-cb6d-4b55-afb5-d1467a526650','f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013','2025-05-06 03:09:21','2025-05-06 03:09:26',NULL,NULL,NULL,'Unknown',NULL,NULL,NULL,NULL,697,398);
/*!40000 ALTER TABLE `replay` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `replay_summary`
--

DROP TABLE IF EXISTS `replay_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `replay_summary` (
  `replay_id` char(36) NOT NULL,
  `html_hash` char(64) NOT NULL,
  `click_count` int NOT NULL DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`replay_id`),
  KEY `fk_replay_summary_webstate` (`html_hash`),
  CONSTRAINT `fk_replay_summary_replay` FOREIGN KEY (`replay_id`) REFERENCES `replay` (`replay_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_replay_summary_webstate` FOREIGN KEY (`html_hash`) REFERENCES `webstate` (`html_hash`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `replay_summary`
--

LOCK TABLES `replay_summary` WRITE;
/*!40000 ALTER TABLE `replay_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `replay_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scroll_data`
--

DROP TABLE IF EXISTS `scroll_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scroll_data` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  `x` int NOT NULL,
  `y` int NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_scroll_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scroll_data`
--

LOCK TABLES `scroll_data` WRITE;
/*!40000 ALTER TABLE `scroll_data` DISABLE KEYS */;
INSERT INTO `scroll_data` VALUES ('10135461-b750-4348-9a76-2d1264095fb1',1,0,134),('11591f1e-e85d-4a3a-8cd9-537868d0a4eb',1,0,0),('3afea630-f0c0-4e57-baf6-132c50d863d1',1,0,2),('3c944262-11c2-4605-978e-58b38173391d',1,0,419),('403652c7-b812-4a72-89b4-77ed01f1477b',1,0,6),('48c3beca-704c-4a6e-8f75-6c252de4e933',1,0,419),('52d28c73-fe39-46a6-9c80-2c77947d5af5',1,0,153),('5e654eb6-97d7-4b5e-a859-89536eb49f9a',1,0,476),('5f1a0c83-a0bd-44fe-a26d-199839f819d9',1,0,286),('613ee32f-a62f-4c39-abd1-88db4cf904e3',1,0,270),('63eb2a8d-ad98-4494-9c89-246342347b48',1,0,79),('6870b7e0-bb44-4e4d-b03d-460d798d93f9',1,0,155),('7099f381-ec9e-4217-bcdd-be9a9a23aa16',1,0,0),('7f7754a9-b2a1-488e-b723-3f84b247a000',1,0,553),('8041d4b5-8c84-4675-b185-a2dff75c8951',1,0,422),('843c6c32-2022-4275-8bb1-671188e2889f',1,0,479),('8e72de4f-4511-4b05-a362-8267cc7cc26d',1,0,340),('97887041-66ea-4402-8298-3611a7303c08',1,0,422),('98d26d94-f798-4ab1-bfdc-00f301331da5',1,0,142),('b9c3286f-f014-4772-9c59-cdfbb3d46956',1,0,289),('f534da47-509b-411e-aa30-f50873f224e1',1,0,94),('f5bc2b9f-29de-4d6f-9699-a9904c6cb5d4',1,0,6),('ff47bec2-e79f-4e93-b14c-f1368d6757a8',1,0,553);
/*!40000 ALTER TABLE `scroll_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `selection_data`
--

DROP TABLE IF EXISTS `selection_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selection_data` (
  `event_id` char(36) NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_selection_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `selection_data`
--

LOCK TABLES `selection_data` WRITE;
/*!40000 ALTER TABLE `selection_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `selection_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `selection_range`
--

DROP TABLE IF EXISTS `selection_range`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selection_range` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_id` char(36) NOT NULL,
  `start` int NOT NULL,
  `start_offset` int NOT NULL,
  `end` int NOT NULL,
  `end_offset` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `fk_selection_range_event_id` (`event_id`),
  CONSTRAINT `fk_selection_range_event_id` FOREIGN KEY (`event_id`) REFERENCES `selection_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `selection_range`
--

LOCK TABLES `selection_range` WRITE;
/*!40000 ALTER TABLE `selection_range` DISABLE KEYS */;
/*!40000 ALTER TABLE `selection_range` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serialized_node`
--

DROP TABLE IF EXISTS `serialized_node`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serialized_node` (
  `id` int NOT NULL,
  `type` enum('document','documenttype','element','text','cdata','comment') NOT NULL,
  `root_id` int DEFAULT NULL,
  `is_shadow_host` tinyint(1) NOT NULL DEFAULT '0',
  `is_shadow` tinyint(1) NOT NULL DEFAULT '0',
  `compat_mode` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `public_id` varchar(255) DEFAULT NULL,
  `system_id` varchar(255) DEFAULT NULL,
  `tag` varchar(24) DEFAULT NULL,
  `is_svg` tinyint(1) NOT NULL DEFAULT '0',
  `need_block` tinyint(1) NOT NULL DEFAULT '0',
  `is_custom` tinyint(1) NOT NULL DEFAULT '0',
  `text_content` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serialized_node`
--

LOCK TABLES `serialized_node` WRITE;
/*!40000 ALTER TABLE `serialized_node` DISABLE KEYS */;
INSERT INTO `serialized_node` VALUES (1,'document',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,NULL),(2,'documenttype',NULL,0,0,NULL,'html',NULL,NULL,NULL,0,0,0,NULL),(3,'element',NULL,0,0,NULL,NULL,NULL,NULL,'html',0,0,0,NULL),(4,'element',NULL,0,0,NULL,NULL,NULL,NULL,'head',0,0,0,NULL),(5,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(6,'element',NULL,0,0,NULL,NULL,NULL,NULL,'meta',0,0,0,NULL),(7,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(8,'element',NULL,0,0,NULL,NULL,NULL,NULL,'meta',0,0,0,NULL),(9,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(10,'element',NULL,0,0,NULL,NULL,NULL,NULL,'title',0,0,0,NULL),(11,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Sample HTML for Testing'),(12,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(13,'element',NULL,0,0,NULL,NULL,NULL,NULL,'style',0,0,0,NULL),(14,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'body { font-family: Arial, sans-serif; max-width: 800px; margin: 0px auto; padding: 20px; }.container { border: 1px solid rgb(204, 204, 204); padding: 20px; border-radius: 5px; margin-bottom: 20px; }button { padding: 10px 15px; background-color: rgb(76, 175, 80); color: white; border: none; border-radius: 4px; cursor: pointer; }button:hover { background-color: rgb(69, 160, 73); }input, textarea { width: 100%; padding: 10px; margin: 10px 0px; border: 1px solid rgb(221, 221, 221); border-radius: 4px; }'),(15,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n  '),(16,'element',NULL,0,0,NULL,NULL,NULL,NULL,'script',0,0,0,NULL),(17,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n'),(18,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n'),(19,'element',NULL,0,0,NULL,NULL,NULL,NULL,'body',0,0,0,NULL),(20,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(21,'element',NULL,0,0,NULL,NULL,NULL,NULL,'h1',0,0,0,NULL),(22,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Test Page for RRWeb Recording'),(23,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    \n    '),(24,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(25,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(26,'element',NULL,0,0,NULL,NULL,NULL,NULL,'h2',0,0,0,NULL),(27,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Form Interactions'),(28,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(29,'element',NULL,0,0,NULL,NULL,NULL,NULL,'form',0,0,0,NULL),(30,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n            '),(31,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(32,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n                '),(33,'element',NULL,0,0,NULL,NULL,NULL,NULL,'label',0,0,0,NULL),(34,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Name:'),(35,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n                '),(36,'element',NULL,0,0,NULL,NULL,NULL,NULL,'input',0,0,0,NULL),(37,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n            '),(38,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n            '),(39,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(40,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n                '),(41,'element',NULL,0,0,NULL,NULL,NULL,NULL,'label',0,0,0,NULL),(42,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Message:'),(43,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n                '),(44,'element',NULL,0,0,NULL,NULL,NULL,NULL,'textarea',0,0,0,NULL),(45,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n            '),(46,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n            '),(47,'element',NULL,0,0,NULL,NULL,NULL,NULL,'button',0,0,0,NULL),(48,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Submit'),(49,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(50,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(51,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    \n    '),(52,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(53,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(54,'element',NULL,0,0,NULL,NULL,NULL,NULL,'h2',0,0,0,NULL),(55,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'API Interaction'),(56,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(57,'element',NULL,0,0,NULL,NULL,NULL,NULL,'button',0,0,0,NULL),(58,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Fetch Sample Data'),(59,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(60,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(61,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(62,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    \n    '),(63,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(64,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(65,'element',NULL,0,0,NULL,NULL,NULL,NULL,'h2',0,0,0,NULL),(66,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'DOM Manipulation'),(67,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(68,'element',NULL,0,0,NULL,NULL,NULL,NULL,'button',0,0,0,NULL),(69,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Add Element'),(70,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(71,'element',NULL,0,0,NULL,NULL,NULL,NULL,'button',0,0,0,NULL),(72,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Change Colors'),(73,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n        '),(74,'element',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(75,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    '),(76,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n    \n    '),(77,'element',NULL,0,0,NULL,NULL,NULL,NULL,'script',0,0,0,NULL),(78,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'SCRIPT_PLACEHOLDER'),(79,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n  '),(80,'element',NULL,0,0,NULL,NULL,NULL,NULL,'script',0,0,0,NULL),(81,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'\n\n '),(82,'element',NULL,0,0,NULL,NULL,NULL,NULL,'span',0,0,0,NULL),(83,'text',NULL,0,0,NULL,NULL,NULL,NULL,'div',0,0,0,NULL),(84,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'Element #1'),(85,'element',NULL,0,0,NULL,NULL,NULL,NULL,'pre',0,0,0,NULL),(86,'text',NULL,0,0,NULL,NULL,NULL,NULL,NULL,0,0,0,'{\n  \"userId\": 1,\n  \"id\": 1,\n  \"title\": \"delectus aut autem\",\n  \"completed\": false\n}');
/*!40000 ALTER TABLE `serialized_node` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serialized_node_attribute`
--

DROP TABLE IF EXISTS `serialized_node_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serialized_node_attribute` (
  `node_id` int NOT NULL,
  `attribute_key` varchar(32) NOT NULL,
  `string_value` text,
  `number_value` decimal(10,0) DEFAULT NULL,
  `is_true` tinyint(1) NOT NULL DEFAULT '0',
  `is_null` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`node_id`,`attribute_key`),
  CONSTRAINT `fk_serialized_node_attribute_node_id` FOREIGN KEY (`node_id`) REFERENCES `serialized_node` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serialized_node_attribute`
--

LOCK TABLES `serialized_node_attribute` WRITE;
/*!40000 ALTER TABLE `serialized_node_attribute` DISABLE KEYS */;
INSERT INTO `serialized_node_attribute` VALUES (3,'lang','en',NULL,0,0),(3,'rr_scrollTop',NULL,555,0,0),(6,'charset','UTF-8',NULL,0,0),(8,'content','width=device-width, initial-scale=1.0',NULL,0,0),(8,'name','viewport',NULL,0,0),(16,'src','https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js',NULL,0,0),(24,'class','container',NULL,0,0),(29,'id','testForm',NULL,0,0),(33,'for','name',NULL,0,0),(36,'fdprocessedid','jy1dbn',NULL,0,0),(36,'id','name',NULL,0,0),(36,'placeholder','Enter your name',NULL,0,0),(36,'type','text',NULL,0,0),(41,'for','message',NULL,0,0),(44,'id','message',NULL,0,0),(44,'placeholder','Type your message here',NULL,0,0),(44,'rows','4',NULL,0,0),(47,'fdprocessedid','fu3hoj',NULL,0,0),(47,'id','submitBtn',NULL,0,0),(47,'type','button',NULL,0,0),(52,'class','container',NULL,0,0),(57,'fdprocessedid','32avj',NULL,0,0),(57,'id','fetchDataBtn',NULL,0,0),(60,'id','apiResult',NULL,0,0),(60,'style','margin-top: 10px; padding: 10px; background-color: #f5f5f5;',NULL,0,0),(63,'class','container',NULL,0,0),(68,'fdprocessedid','sjc1mq',NULL,0,0),(68,'id','addElementBtn',NULL,0,0),(71,'fdprocessedid','a7haov',NULL,0,0),(71,'id','changeColorBtn',NULL,0,0),(74,'id','elementsContainer',NULL,0,0),(74,'style','margin-top: 10px; min-height: 100px;',NULL,0,0),(80,'src','http://localhost:4321/dom/rrweb_loader.js',NULL,0,0),(82,'id','PING_IFRAME_FORM_DETECTION',NULL,0,0),(82,'style','padding: 10px; margin: 5px 0px; background-color: rgb(240, 240, 240);',NULL,0,0),(83,'style','padding: 10px; margin: 5px 0px; background-color: rgb(219, 61, 247);',NULL,0,0);
/*!40000 ALTER TABLE `serialized_node_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serialized_node_child`
--

DROP TABLE IF EXISTS `serialized_node_child`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serialized_node_child` (
  `parent_id` int NOT NULL,
  `child_id` int NOT NULL,
  PRIMARY KEY (`parent_id`,`child_id`),
  KEY `fk_serialized_node_child_child_id` (`child_id`),
  CONSTRAINT `fk_serialized_node_child_child_id` FOREIGN KEY (`child_id`) REFERENCES `serialized_node` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_serialized_node_child_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `serialized_node` (`id`) ON DELETE CASCADE,
  CONSTRAINT `serialized_node_child_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `serialized_node` (`id`),
  CONSTRAINT `serialized_node_child_ibfk_2` FOREIGN KEY (`child_id`) REFERENCES `serialized_node` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serialized_node_child`
--

LOCK TABLES `serialized_node_child` WRITE;
/*!40000 ALTER TABLE `serialized_node_child` DISABLE KEYS */;
INSERT INTO `serialized_node_child` VALUES (1,2),(1,3),(3,4),(4,5),(4,6),(4,7),(4,8),(4,9),(4,10),(10,11),(4,12),(4,13),(13,14),(4,15),(4,16),(4,17),(3,18),(3,19),(19,20),(19,21),(21,22),(19,23),(19,24),(24,25),(24,26),(26,27),(24,28),(24,29),(29,30),(29,31),(31,32),(31,33),(33,34),(31,35),(31,36),(31,37),(29,38),(29,39),(39,40),(39,41),(41,42),(39,43),(39,44),(39,45),(29,46),(29,47),(47,48),(29,49),(24,50),(19,51),(19,52),(52,53),(52,54),(54,55),(52,56),(52,57),(57,58),(52,59),(52,60),(52,61),(19,62),(19,63),(63,64),(63,65),(65,66),(63,67),(63,68),(68,69),(63,70),(63,71),(71,72),(63,73),(63,74),(63,75),(19,76),(19,77),(77,78),(19,79),(19,80),(19,81),(19,82);
/*!40000 ALTER TABLE `serialized_node_child` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_om_value`
--

DROP TABLE IF EXISTS `style_om_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_om_value` (
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_om_value`
--

LOCK TABLES `style_om_value` WRITE;
/*!40000 ALTER TABLE `style_om_value` DISABLE KEYS */;
/*!40000 ALTER TABLE `style_om_value` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `style_om_value_entry`
--

DROP TABLE IF EXISTS `style_om_value_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `style_om_value_entry` (
  `id` int NOT NULL,
  `property` char(32) NOT NULL,
  `value_string` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`,`property`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `style_om_value_entry`
--

LOCK TABLES `style_om_value_entry` WRITE;
/*!40000 ALTER TABLE `style_om_value_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `style_om_value_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `text_mutation`
--

DROP TABLE IF EXISTS `text_mutation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `text_mutation` (
  `event_id` char(36) NOT NULL,
  `node_id` int NOT NULL,
  `value` text,
  PRIMARY KEY (`event_id`,`node_id`),
  CONSTRAINT `fk_text_mutation_event_id` FOREIGN KEY (`event_id`) REFERENCES `mutation_data` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `text_mutation`
--

LOCK TABLES `text_mutation` WRITE;
/*!40000 ALTER TABLE `text_mutation` DISABLE KEYS */;
/*!40000 ALTER TABLE `text_mutation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `email_domain` varchar(255) NOT NULL,
  `email_name` varchar(64) NOT NULL,
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(4096) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` varchar(16) DEFAULT NULL,
  `first_name` varchar(128) DEFAULT NULL,
  `middle_name` varchar(128) DEFAULT NULL,
  `last_name` varchar(128) DEFAULT NULL,
  `phone_num` char(11) DEFAULT NULL,
  `role` varchar(16) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `fail_login` int NOT NULL DEFAULT '0',
  `twofa` tinyint(1) NOT NULL DEFAULT '0',
  `privacy_mask` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`email_name`,`email_domain`),
  UNIQUE KEY `uk_user_email` (`email_domain`,`email_name`),
  CONSTRAINT `user_chk_1` CHECK (regexp_like(`email_domain`,_utf8mb4'^[a-za-z0-9\\.\\!\\#\\$\\%\\&\\*\\+\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~\\-]+$')),
  CONSTRAINT `user_chk_2` CHECK (regexp_like(`email_name`,_utf8mb4'^[a-za-z0-9!#$%&\'*+/=?^_`{|}~-]+(\\.[a-za-z0-9!#$%&\'*+/=?^_`{|}~-]+)*(\\+[a-za-z0-9-]+)?$')),
  CONSTRAINT `user_chk_3` CHECK ((regexp_like(`username`,_utf8mb4'^(?=.*[a-za-z])[a-z0-9_\\-\\.\']{3,30}$') and (`username` not in (_utf8mb4'admin',_utf8mb4'root',_utf8mb4'system',_utf8mb4'administrator')))),
  CONSTRAINT `user_chk_4` CHECK ((length(`password`) >= 6)),
  CONSTRAINT `user_chk_5` CHECK ((`status` in (_utf8mb4'enabled',_utf8mb4'disabled'))),
  CONSTRAINT `user_chk_6` CHECK ((`role` in (_utf8mb4'user',_utf8mb4'admin'))),
  CONSTRAINT `user_chk_7` CHECK ((`fail_login` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('email.com','email','user','8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92','2025-05-06 11:04:54',NULL,'enabled',NULL,NULL,NULL,NULL,'user',0,0,0,1),('email.com','email1','abc','5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8','2025-05-06 10:49:49',NULL,'enabled',NULL,NULL,NULL,NULL,'user',0,0,0,1),('gmail.com','picokatx','theo','3a4b52fc88795615c55066100afbba60bea938b976fd40f13def78369a209f50','2024-02-04 23:30:25','2024-05-28 18:45:55','enabled','theo','weibin','1','1832555445','admin',1,0,1,1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `viewport_resize_data`
--

DROP TABLE IF EXISTS `viewport_resize_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `viewport_resize_data` (
  `event_id` char(36) NOT NULL,
  `width` int NOT NULL,
  `height` int NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_viewport_resize_data_event_id` FOREIGN KEY (`event_id`) REFERENCES `incremental_snapshot_event` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viewport_resize_data`
--

LOCK TABLES `viewport_resize_data` WRITE;
/*!40000 ALTER TABLE `viewport_resize_data` DISABLE KEYS */;
/*!40000 ALTER TABLE `viewport_resize_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `webstate`
--

DROP TABLE IF EXISTS `webstate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `webstate` (
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `html_hash` char(64) NOT NULL,
  `email_domain` varchar(255) DEFAULT NULL,
  `email_name` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`html_hash`),
  KEY `fk_webstate_user` (`email_domain`,`email_name`),
  KEY `idx_webstate_created_at` (`created_at`),
  CONSTRAINT `fk_webstate_user` FOREIGN KEY (`email_domain`, `email_name`) REFERENCES `user` (`email_domain`, `email_name`),
  CONSTRAINT `webstate_chk_1` CHECK (regexp_like(`html_hash`,_utf8mb4'^[a-f0-9]{64}$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `webstate`
--

LOCK TABLES `webstate` WRITE;
/*!40000 ALTER TABLE `webstate` DISABLE KEYS */;
INSERT INTO `webstate` VALUES ('2025-05-06 11:14:10','1b21501ffe1ed178c204f05843ee862a6a87f8a1851894272b5f63ba20d0eb09',NULL,NULL),('2025-05-06 11:14:03','3747ff60b37c232db4a55f85e203566f8d1da1096f8b2dde78306f51d18fd688',NULL,NULL),('2025-05-06 11:16:27','3d33ce6a1ecb0594e73335fd1018fd669392a8c60d7da8af85d75abcd8c8bc96',NULL,NULL),('2025-05-06 11:14:16','ee9abbe0bfe94123c45d6370e023699c441f4925d205c638e3747423f659bc24',NULL,NULL),('2025-05-06 10:16:44','f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013','gmail.com','picokatx'),('2025-05-06 11:14:20','f684c246098a4b5a103e2504fa1d72a04cdf135c079943b9ecac9813bf01c363',NULL,NULL);
/*!40000 ALTER TABLE `webstate` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-06 19:19:26
