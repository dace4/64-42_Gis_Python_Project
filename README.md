# 64-42_Gis_Python_Project

A full-stack **GeoDjango** web application that visualizes power network risks and simulates outages in the city of Sion, Switzerland.  
Uses **PostGIS** for spatial data, **Leaflet.js** for interactive mapping, and **Docker** for reproducible development.

---

## Features

- Interactive web map (Leaflet + Django)
- Visualizes:
  - Swiss cantons
  - Power network lines and nodes
  - Houses (MultiPolygon buildings in Sion)
  - Simulated outage incidents
- **Simulate a power outage:** Click any network node to see which houses are affected (highlighted on the map)
- Export and reset simulated incidents
- Data managed in a **PostGIS** spatial database, accessible via **pgAdmin**

---

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose installed on your system.

---

## Setup and Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/dace4/64-42_Gis_Python_Project
    cd 64-42_Gis_Python_Project/django
    ```

2. **Build and start all Docker containers:**
    ```bash
    docker-compose up --build
    ```
    - This starts Django (GeoDjango), PostGIS, and pgAdmin4.

3. **Access the application:**
    - **Django web app:** [http://localhost:8000/swissgeo/cantons](http://localhost:8000/swissgeo/cantons)
    - **pgAdmin:** [http://localhost:5050](http://localhost:5050)

---

## How to Use

- **Map controls:** Explore power lines, nodes and houses on the map.
- **Simulate outage:** Click on a green node to simulate a network failure. Houses within 100 meters will be highlighted in red.
- **Reset:** Use the Reset button to clear the simulation and restore house colors.

---

## Data

- GeoJSON and shapefile data can be found in the `django/data` folder.
- Database is initialized with scripts in `postgis/`.

---

## Development notes

- Main Django app: `django/geoweb/swissgeo`
- Main template for the interactive map: `cantons.html`
- Frontend uses [Leaflet.js](https://leafletjs.com/) for mapping and interactivity.
- Static assets (icons, custom JS) are in `django/geoweb/swissgeo/static/`.

---

## Credits

- OpenStreetMap contributors for map tiles
- [Leaflet.js](https://leafletjs.com/)
- Django, GeoDjango, and PostGIS
