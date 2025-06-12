// Oiken – Simulation locale d’incidents électriques

const mapRef = window.map;
const linesLayer = window.networkLinesLayer;
const nodesLayer = window.nodesLayer;
const incidentsLayer = window.incidentsLayer;
const housesLayer = window.housesLayer;

/* ─── Icônes ───────────────────────────────────────────────────────── */
const iconNode = L.icon({
  iconUrl: "/static/icons/node.png",
  iconSize: [25, 25],
});
const iconIncident = L.icon({
  iconUrl: "/static/icons/incident.png",
  iconSize: [25, 25],
});
const iconAffected = L.icon({
  iconUrl: "/static/icons/node_affected.png",
  iconSize: [25, 25],
});

/* ─── Variables runtime ───────────────────────────────────────────── */
let incidentFeatures = [];
let nodeCoords = {}; 
const nodeGraph = {};

/* ─── Fonctions utilitaires ───────────────────────────────────────── */
const haversine = (a, b) => {
  const R = 6371000,
    rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]),
    dLon = rad(b[0] - a[0]);
  return (
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) ** 2 +
          Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLon / 2) ** 2
      )
    )
  );
};

const nearLine = (ll, coords, th = 20) =>
  coords.some((c) => haversine([ll.lng, ll.lat], c) < th);

/* ─── Construction du graphe ──────────────────────────────────────── */
function buildNodeGraph() {
  nodeCoords = {};

  nodesLayer.eachLayer((n) => {
    const rawId = n.feature?.properties?.id ?? n.feature?.properties?.node_id;
    const id = parseInt(rawId);
    if (isNaN(id)) return;

    const latlng = n.getLatLng();
    nodeCoords[id] = [latlng.lng, latlng.lat];
    nodeGraph[id] = [];
  });

  linesLayer.eachLayer((l) => {
    const coords = l.feature.geometry.coordinates[0];
    const endpoints = [coords[0], coords[coords.length - 1]];
    const nearNodes = [];

    endpoints.forEach((pt) => {
      let closest = null;
      let minDist = Infinity;
      for (const [id, coord] of Object.entries(nodeCoords)) {
        const dist = haversine(coord, pt);
        const parsedId = parseInt(id);
        if (!isNaN(parsedId) && dist < 20 && dist < minDist) {
          closest = parsedId;
          minDist = dist;
        }
      }
      if (closest !== null) nearNodes.push(closest);
    });

    if (nearNodes.length === 2) {
      const [a, b] = nearNodes;
      if (!nodeGraph[a]) nodeGraph[a] = [];
      if (!nodeGraph[b]) nodeGraph[b] = [];
      if (!nodeGraph[a].includes(b)) nodeGraph[a].push(b);
      if (!nodeGraph[b].includes(a)) nodeGraph[b].push(a);
    }
  });

  console.log("Graphe de connexions :", nodeGraph);
}

/* ─── Simulation d'incident ───────────────────────────────────────── */
function simulateIncident(feature, layer) {
  if (feature.properties.isIncident) return;
  feature.properties.isIncident = true;

  const rawId = feature.properties?.node_id ?? feature.properties?.id;
  const nodeId = rawId !== undefined ? rawId : "inconnu";

  const ll = layer.getLatLng();
  layer.setIcon(iconIncident);

  const incident = {
    type: "Feature",
    properties: {
      node_id: nodeId,
      timestamp: new Date().toISOString(),
    },
    geometry: { type: "Point", coordinates: [ll.lng, ll.lat] },
  };

  incidentsLayer.addLayer(
    L.geoJSON(incident, {
      pointToLayer: (f, latlng) =>
        L.circleMarker(latlng, {
          radius: 10,
          fillColor: "red",
          color: "#000",
          fillOpacity: 0.9,
        }),
    })
  );
  incidentFeatures.push(incident);

  // Historique
  const log = document.getElementById("incident-log");
  const div = document.createElement("div");
  div.textContent = `Nœud ${nodeId} – ${new Date().toLocaleTimeString()}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;

  // Propagation
  propagateIncident(nodeId);
}

/* ─── Propagation intelligente ────────────────────────────────────── */
function propagateIncident(startId) {
  const visited = new Set();
  const queue = [parseInt(startId)];

  while (queue.length > 0) {
    const current = queue.shift();
    visited.add(current);

    const coords = nodeCoords[current];
    if (!coords) {
      console.warn("Coordonnées manquantes pour le nœud", current);
      continue;
    }

    nodesLayer.eachLayer((n) => {
      const id = parseInt(n.feature?.properties?.id);
      if (id === current && !n.feature.properties.isIncident) {
        n.setIcon(iconAffected);
        n.feature.properties.isIncident = true;
      }
    });

    linesLayer.eachLayer((l) => {
      const coordsData = l.feature?.geometry?.coordinates;
      if (!Array.isArray(coordsData) || !coordsData[0]) return;

      const mergedCoords = coordsData.flat();

  if (
    mergedCoords.some(
      (c) => haversine(c, coords) < 25
    )
  ) {
    l.setStyle({
      color: "#FF6600",
      weight: 6,
      dashArray: "4 4",
      opacity: 0.9,
    });
    l.bringToFront();
    l.bindTooltip("⚡ Ligne coupée").openTooltip();

    housesLayer.eachLayer((h) => {
      const center = h.getBounds().getCenter();
      if (
        mergedCoords.some(
          (c) => haversine([center.lng, center.lat], c) < 30
        )
      ) {
        h.setStyle({
          color: "#000000",
          fillColor: "#FF6666",
          weight: 2,
          fillOpacity: 1,
        });
        h.bringToFront();
        h.bindTooltip("🏠 Maison affectée").openTooltip();
      }
    });
  }
});

    const neighbors = nodeGraph[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
        visited.add(neighbor);
      }
    }
  }
}

/* ─── Bind des clics ──────────────────────────────────────────────── */
const waitForNodes = setInterval(() => {
  if (nodesLayer.getLayers().length > 0) {
    clearInterval(waitForNodes);

    nodesLayer.eachLayer((m) => {
      if (m.feature) {
        m.on("click", () => simulateIncident(m.feature, m));
      }
    });

    buildNodeGraph();
  }
}, 200);

/* ─── Export GeoJSON ──────────────────────────────────────────────── */
document.getElementById("export-btn").addEventListener("click", () => {
  if (!incidentFeatures.length) return alert("Aucun incident simulé.");

  const blob = new Blob(
    [
      JSON.stringify(
        { type: "FeatureCollection", features: incidentFeatures },
        null,
        2
      ),
    ],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), {
    href: url,
    download: "incidents.geojson",
  }).click();
  URL.revokeObjectURL(url);
});

/* ─── Reset complet ──────────────────────────────────────────────── */
document.getElementById("reset-btn").addEventListener("click", () => {
  incidentFeatures = [];
  incidentsLayer.clearLayers();
  linesLayer.eachLayer((l) => l.setStyle({ color: "orange", weight: 3 }));
  housesLayer.eachLayer((h) => {
    h.setStyle({ color: "purple", fillColor: "purple", fillOpacity: 0.6 });
    h.closeTooltip();
  });
  nodesLayer.eachLayer((n) => {
    n.setIcon(iconNode);
    if (n.feature) n.feature.properties.isIncident = false;
  });
  document.getElementById("incident-log").innerHTML = "";
});
