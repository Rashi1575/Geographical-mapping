/* =========================================
   SPECIALTIES DATA
   ========================================= */

INSERT INTO specialties (specialty_name)
VALUES
('Cardiologist'),
('Neurologist'),
('Orthopedic'),
('Dermatologist'),
('General Physician'),
('Pediatrician'),
('ENT Specialist');


/* =========================================
   SYMPTOMS DATA
   ========================================= */

INSERT INTO symptoms (symptom_name)
VALUES
('shivering'),
('continuous_sneezing'),
('skin_rash'),
('itching'),
('nodal_skin_eruptions');


/* =========================================
   HOSPITAL-SPECIALTY MAPPING
   ========================================= */

INSERT INTO hospital_specialties (hospital_id, specialty_id)
VALUES
(1,1), (1,2), (1,5),
(2,1), (2,3), (2,6),
(3,1), (3,2), (3,4),
(4,2), (4,5), (4,7),
(5,3), (5,5), (5,6),
(6,1), (6,4), (6,7);


/* =========================================
   SYMPTOM-SPECIALTY MAPPING
   ========================================= */

INSERT INTO symptom_specialties (symptom_id, specialty_id)
VALUES
(1,5), -- shivering -> General Physician
(2,7), -- continuous_sneezing -> ENT Specialist
(3,4), -- skin_rash -> Dermatologist
(4,4), -- itching -> Dermatologist
(5,4); -- nodal_skin_eruptions -> Dermatologist