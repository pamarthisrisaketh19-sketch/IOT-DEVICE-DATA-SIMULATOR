# UI/UX Existing System Analysis: IoT Dashboards

## Product 1: ThingsBoard (Open-Source IoT Platform)
* **Layout:** Utilizes a persistent left-hand navigation sidebar with a large, grid-based main content area. Data is displayed using modular, card-based widgets (gauges, charts, and tables).
* **Filters:** Features global dashboard filters at the top of the screen. Device tables include built-in search bars and column-header sorting (e.g., sorting devices by active/inactive status).
* **Status Indicators:** Relies heavily on visual color coding. Uses bold green icons for "Active," red for "Offline/Error," and yellow/orange for "Alarms."
* **Limitations:** The interface is highly complex and can be overwhelming for a new user. There are often too many configuration buttons visible on a single screen, making basic navigation confusing.

## Product 2: Azure IoT Central 
* **Layout:** Very clean, enterprise-focused UI. Uses a top navigation bar with breadcrumbs for deep navigation. Device lists are displayed in wide, spacious data tables rather than dense cards.
* **Filters:** Uses a clean, slide-out filtering panel on the right side of the screen, keeping the main view uncluttered until the user specifically wants to search for something.
* **Status Indicators:** Minimalist approach. Instead of coloring entire rows or using massive icons, it uses small, colored status badges (e.g., a simple green dot or a red 'X' next to the device name).
* **Limitations:** The terminology is highly technical. Getting to the actual telemetry data (temperature/humidity history) requires clicking through 2-3 different nested pages, which slows down the user experience.

## My Plan for Our Project (IoT Device Data Simulator)
1. **Layout Strategy:** I will adopt the card-based grid layout for the main dashboard overview (similar to ThingsBoard) to make data easily digestible, but I will keep the navigation simple with a top-bar layout.
2. **Status Indicators:** I will use the minimalist status badges (colored dots/pills) from Azure. This will prevent our dashboard from looking chaotic or overly colorful, making it easier for Admins to spot critical errors quickly.
3. **Filtering:** To avoid the complexity of both systems, I will implement a single, unified search bar and a simple "Status" dropdown filter directly above the device table.