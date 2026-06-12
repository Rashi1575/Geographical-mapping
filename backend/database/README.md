# Healthcare Mapping Database

## Project Overview

The Healthcare Mapping Database is designed to help users identify appropriate healthcare facilities based on their symptoms and medical needs. The system maps symptoms to medical specialties and then identifies hospitals that provide those specialties. It also supports geospatial queries using PostGIS to find nearby hospitals and pharmacies.

---

## Technology Stack

* PostgreSQL 18
* PostGIS 3.6
* pgAdmin 4

---

## Database Tables

### 1. users

Stores user account information.

**Fields:**

* user_id
* name
* email
* password_hash
* phone
* created_at

---

### 2. hospitals

Stores hospital details and location information.

**Fields:**

* hospital_id
* name
* hospital_type
* address
* latitude
* longitude
* contact_number
* rating
* emergency_available
* location (PostGIS Geography Point)

---

### 3. specialties

Stores medical specialties available in the system.

**Examples:**

* Cardiologist
* Neurologist
* Dermatologist
* Orthopedic
* General Physician

---

### 4. symptoms

Stores symptoms entered by users.

**Examples:**

* skin_rash
* itching
* shivering
* continuous_sneezing

---

### 5. pharmacies

Stores pharmacy information and location data.

**Fields:**

* pharmacy_id
* name
* address
* latitude
* longitude
* contact_number
* open_24x7
* location

---

### 6. hospital_specialties

Junction table that maps hospitals to specialties.

**Purpose:**
A hospital can provide multiple specialties and a specialty can be available in multiple hospitals.

---

### 7. symptom_specialties

Junction table that maps symptoms to medical specialties.

**Examples:**

* skin_rash → Dermatologist
* shivering → General Physician
* continuous_sneezing → ENT Specialist

---

### 8. search_history

Stores user search activity.

**Purpose:**
Tracks user searches for analysis and future recommendations.

---

## Entity Relationship Overview

Users
↓
Search History
↓
Symptoms
↓
Symptom Specialties
↓
Specialties
↓
Hospital Specialties
↓
Hospitals

---

## Core Workflow

### Symptom → Specialty Mapping

Example:

skin_rash
→ Dermatologist

continuous_sneezing
→ ENT Specialist

---

### Symptom → Specialty → Hospital Mapping

Example:

skin_rash
→ Dermatologist
→ Apollo Delhi
→ Kailash Hospital

---

### Nearest Hospital Search

Using PostGIS, the system can calculate the nearest hospitals based on user coordinates.

Example:

User Location
→ Find Hospitals
→ Calculate Distance
→ Return Nearest Hospitals

---

## PostGIS Features

The project uses PostGIS for geospatial operations.

### Supported Features

* Geographic point storage
* Distance calculation
* Nearest hospital search
* Location-based healthcare recommendations
* Pharmacy location search

---

## Important Queries

### Find Specialty for a Symptom

Maps user symptoms to medical specialties.

### Find Hospitals for a Specialty

Identifies hospitals offering a specific specialty.

### Symptom → Specialty → Hospital Workflow

Main business logic query used by the application.

### Nearest Hospital Search

Returns nearby hospitals ordered by distance.

---

## Project Status

### Completed Features

* Database Design
* Table Creation
* Relationship Mapping
* Foreign Key Constraints
* Symptom to Specialty Mapping
* Hospital to Specialty Mapping
* Search History Tracking
* PostGIS Integration
* Distance-Based Hospital Search
* Query Documentation
* Sample Data Population

---

## Future Enhancements

* Disease Prediction Integration
* Doctor Recommendation System
* Appointment Scheduling
* Real-Time Hospital Availability
* Pharmacy Recommendation Engine
* User Health Analytics

---

## Authors

Healthcare Mapping Project Team

Database Module:
PostgreSQL + PostGIS Implementation
