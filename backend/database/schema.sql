/* ==========================================================
HEALTHCARE MAPPING DATABASE SCHEMA
PostgreSQL + PostGIS
========================================================== */

/* ==========================================================
TABLE: users

Purpose:
Stores user account information.
========================================================== */

CREATE TABLE IF NOT EXISTS public.users
(
user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
name character varying(100) NOT NULL,
email character varying(255) NOT NULL,
password_hash character varying(255) NOT NULL,
phone character varying(20),
created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,

```
CONSTRAINT users_pkey PRIMARY KEY (user_id),
CONSTRAINT users_email_key UNIQUE (email)
```

);

/* ==========================================================
TABLE: hospitals

Purpose:
Stores hospital details and geospatial location.
PostGIS geography field enables distance calculations.
========================================================== */

CREATE TABLE IF NOT EXISTS public.hospitals
(
hospital_id integer NOT NULL DEFAULT nextval('hospitals_hospital_id_seq'::regclass),
name character varying(255) NOT NULL,
hospital_type character varying(50) NOT NULL,
address text,
latitude numeric(10,8),
longitude numeric(11,8),
contact_number character varying(20),
rating numeric(2,1),
emergency_available boolean DEFAULT false,
location geography(Point,4326),

```
CONSTRAINT hospitals_pkey PRIMARY KEY (hospital_id)
```

);

/* ==========================================================
TABLE: specialties

Purpose:
Stores medical specialties.
Examples:
Cardiologist, Neurologist, Dermatologist
========================================================== */

CREATE TABLE IF NOT EXISTS public.specialties
(
specialty_id integer NOT NULL DEFAULT nextval('specialties_specialty_id_seq'::regclass),
specialty_name character varying(100) NOT NULL,

```
CONSTRAINT specialties_pkey PRIMARY KEY (specialty_id),
CONSTRAINT specialties_specialty_name_key UNIQUE (specialty_name)
```

);

/* ==========================================================
TABLE: symptoms

Purpose:
Stores symptoms entered by users.
Examples:
skin_rash, itching, shivering
========================================================== */

CREATE TABLE IF NOT EXISTS public.symptoms
(
symptom_id integer NOT NULL DEFAULT nextval('symptoms_symptom_id_seq'::regclass),
symptom_name character varying(100) NOT NULL,

```
CONSTRAINT symptoms_pkey PRIMARY KEY (symptom_id),
CONSTRAINT symptoms_symptom_name_key UNIQUE (symptom_name)
```

);

/* ==========================================================
TABLE: pharmacies

Purpose:
Stores nearby pharmacy information.
Uses PostGIS location field.
========================================================== */

CREATE TABLE IF NOT EXISTS public.pharmacies
(
pharmacy_id integer NOT NULL DEFAULT nextval('pharmacies_pharmacy_id_seq'::regclass),
name character varying(255) NOT NULL,
address text,
latitude numeric(10,8),
longitude numeric(11,8),
contact_number character varying(20),
open_24x7 boolean DEFAULT false,
location geography(Point,4326),

```
CONSTRAINT pharmacies_pkey PRIMARY KEY (pharmacy_id)
```

);

/* ==========================================================
TABLE: hospital_specialties

Purpose:
Many-to-Many relationship between
hospitals and specialties.

Example:
AIIMS -> Cardiologist
AIIMS -> Neurologist
========================================================== */

CREATE TABLE IF NOT EXISTS public.hospital_specialties
(
hospital_id integer NOT NULL,
specialty_id integer NOT NULL,

```
CONSTRAINT hospital_specialties_pkey
    PRIMARY KEY (hospital_id, specialty_id),

CONSTRAINT hospital_specialties_hospital_id_fkey
    FOREIGN KEY (hospital_id)
    REFERENCES public.hospitals (hospital_id)
    ON DELETE CASCADE,

CONSTRAINT hospital_specialties_specialty_id_fkey
    FOREIGN KEY (specialty_id)
    REFERENCES public.specialties (specialty_id)
    ON DELETE CASCADE
```

);

/* ==========================================================
TABLE: symptom_specialties

Purpose:
Many-to-Many relationship between
symptoms and specialties.

Example:
skin_rash -> Dermatologist
shivering -> General Physician
========================================================== */

CREATE TABLE IF NOT EXISTS public.symptom_specialties
(
symptom_id integer NOT NULL,
specialty_id integer NOT NULL,
severity_score integer,

```
CONSTRAINT symptom_specialties_pkey
    PRIMARY KEY (symptom_id, specialty_id),

CONSTRAINT symptom_specialties_symptom_id_fkey
    FOREIGN KEY (symptom_id)
    REFERENCES public.symptoms (symptom_id)
    ON DELETE CASCADE,

CONSTRAINT symptom_specialties_specialty_id_fkey
    FOREIGN KEY (specialty_id)
    REFERENCES public.specialties (specialty_id)
    ON DELETE CASCADE
```

);

/* ==========================================================
TABLE: search_history

Purpose:
Tracks user searches for analytics and history.
========================================================== */

CREATE TABLE IF NOT EXISTS public.search_history
(
search_id integer NOT NULL DEFAULT nextval('search_history_search_id_seq'::regclass),
user_id integer,
symptom_id integer,
hospital_id integer,
searched_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,

```
CONSTRAINT search_history_pkey PRIMARY KEY (search_id),

CONSTRAINT search_history_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.users (user_id),

CONSTRAINT search_history_symptom_id_fkey
    FOREIGN KEY (symptom_id)
    REFERENCES public.symptoms (symptom_id),

CONSTRAINT search_history_hospital_id_fkey
    FOREIGN KEY (hospital_id)
    REFERENCES public.hospitals (hospital_id)
```

);
