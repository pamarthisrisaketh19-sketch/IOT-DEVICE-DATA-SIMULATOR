# Comprehensive Test Plan: IoT Device Data Simulator

## Feature 1: Sensor Simulator Form (Frontend)
* **Testing Focus:** Client-side validation and UI responsiveness.
* **Key Tests:**
    * Verify form cannot be submitted if Device ID is blank.
    * Verify Temperature and Humidity fields only accept numeric values.
    * Test layout on mobile and desktop screen sizes.

## Feature 2: Data Ingestion API (Backend)
* **Testing Focus:** Server-side validation and database storage.
* **Key Tests:**
    * Send a valid POST request via Postman and verify a `200 OK` or `201 Created` status.
    * Send a POST request missing the `status` payload and verify a `400 Bad Request` error.
    * Verify the data is accurately inserted into the database table.

## Feature 3: IoT Admin Dashboard (Frontend/Backend Integration)
* **Testing Focus:** Data retrieval, rendering, and filtering accuracy.
* **Key Tests:**
    * Verify the GET API returns JSON data matching the expected schema.
    * Test the "Active/Inactive" filter dropdown to ensure only matching records appear.