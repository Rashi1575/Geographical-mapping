/* ==========================================================
   HEALTHCARE MAPPING DATABASE - USEFUL QUERIES
   ========================================================== */


/* ==========================================================
   1. VIEW ALL HOSPITALS
   Purpose:
   Verify hospital data is loaded correctly.
   ========================================================== */

SELECT * FROM hospitals;


/* ==========================================================
   2. VIEW ALL SPECIALTIES
   Purpose:
   Verify medical specialties exist.
   ========================================================== */

SELECT * FROM specialties;


/* ==========================================================
   3. VIEW ALL SYMPTOMS
   Purpose:
   Verify symptom data is loaded.
   ========================================================== */

SELECT * FROM symptoms;


/* ==========================================================
   4. VIEW HOSPITAL-SPECIALTY MAPPING
   Purpose:
   Shows which hospital provides which specialty.
   ========================================================== */

SELECT
    h.name AS hospital_name,
    s.specialty_name
FROM hospitals h
JOIN hospital_specialties hs
    ON h.hospital_id = hs.hospital_id
JOIN specialties s
    ON hs.specialty_id = s.specialty_id;


/* ==========================================================
   5. VIEW SYMPTOM-SPECIALTY MAPPING
   Purpose:
   Shows which specialty should handle a symptom.
   ========================================================== */

SELECT
    sym.symptom_name,
    sp.specialty_name
FROM symptoms sym
JOIN symptom_specialties ss
    ON sym.symptom_id = ss.symptom_id
JOIN specialties sp
    ON ss.specialty_id = sp.specialty_id;


/* ==========================================================
   6. COMPLETE WORKFLOW
   Symptom -> Specialty -> Hospital

   Purpose:
   Core project query.
   Determines which hospitals can treat a symptom.
   ========================================================== */

SELECT
    sym.symptom_name,
    sp.specialty_name,
    h.name AS hospital_name
FROM symptoms sym
JOIN symptom_specialties ss
    ON sym.symptom_id = ss.symptom_id
JOIN specialties sp
    ON ss.specialty_id = sp.specialty_id
JOIN hospital_specialties hs
    ON sp.specialty_id = hs.specialty_id
JOIN hospitals h
    ON hs.hospital_id = h.hospital_id
ORDER BY sym.symptom_name;


/* ==========================================================
   7. COUNT RECORDS
   Purpose:
   Quick database validation.
   ========================================================== */

SELECT COUNT(*) AS hospital_count
FROM hospitals;

SELECT COUNT(*) AS specialty_count
FROM specialties;

SELECT COUNT(*) AS symptom_count
FROM symptoms;


/* ==========================================================
   8. NEAREST HOSPITALS USING POSTGIS
   Purpose:
   Find hospitals closest to a user location.

   Coordinates:
   Longitude = 77.2090
   Latitude  = 28.6139
   ========================================================== */

SELECT
    name,
    hospital_type,
    ROUND(
        (
            ST_Distance(
                location,
                ST_SetSRID(
                    ST_MakePoint(77.2090, 28.6139),
                    4326
                )::geography
            ) / 1000
        )::numeric,
        2
    ) AS distance_km
FROM hospitals
ORDER BY distance_km
LIMIT 5;


/* ==========================================================
   9. NEAREST HOSPITALS FOR A SYMPTOM
   Purpose:
   Real-world project query.

   Example:
   User enters 'skin_rash'
   System returns nearest hospitals capable of treatment.
   ========================================================== */

SELECT
    sym.symptom_name,
    sp.specialty_name,
    h.name AS hospital_name,
    ROUND(
        (
            ST_Distance(
                h.location,
                ST_SetSRID(
                    ST_MakePoint(77.2090, 28.6139),
                    4326
                )::geography
            ) / 1000
        )::numeric,
        2
    ) AS distance_km
FROM symptoms sym
JOIN symptom_specialties ss
    ON sym.symptom_id = ss.symptom_id
JOIN specialties sp
    ON ss.specialty_id = sp.specialty_id
JOIN hospital_specialties hs
    ON sp.specialty_id = hs.specialty_id
JOIN hospitals h
    ON hs.hospital_id = h.hospital_id
WHERE sym.symptom_name = 'skin_rash'
ORDER BY distance_km;


/* ==========================================================
   10. CHECK POSTGIS VERSION
   Purpose:
   Verify PostGIS installation.
   ========================================================== */

SELECT PostGIS_Version();


/* ==========================================================
   11. LIST ALL DATABASE EXTENSIONS
   Purpose:
   Verify PostGIS is enabled.
   ========================================================== */

SELECT * FROM pg_extension;


/* ==========================================================
   12. TEST GEOMETRY FUNCTIONS
   Purpose:
   Verify spatial functions are working.
   ========================================================== */

SELECT ST_Point(77.1025, 28.7041);