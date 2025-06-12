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

/* ─── Simulation d'incident ───────────────────────────────────────── */
function simulateIncident(feature, layer) {
  if (feature.properties.isIncident) return;
  feature.properties.isIncident = true;

  const ll = layer.getLatLng();
  layer.setIcon(iconIncident);

  const incident = {
    type: "Feature",
    properties: {
      node_id: feature.properties.node_id || feature.properties.id || "inconnu",
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
  div.textContent = `Nœud ${
    incident.properties.node_id
  } – ${new Date().toLocaleTimeString()}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;

  // Propagation
  const impactedLines = [];
  linesLayer.eachLayer((ln) => {
    if (nearLine(ll, ln.feature.geometry.coordinates)) {
      ln.setStyle({
        color: "#FF0000",
        weight: 8,
        dashArray: "4 4",
        opacity: 1,
      });
      ln.bringToFront(); // ← ajoute ceci

      impactedLines.push(ln);
    }
  });

  // Maisons impactées
  housesLayer.eachLayer((h) => {
    const center = h.getBounds().getCenter();
    if (
      impactedLines.some((ln) =>
        ln.feature.geometry.coordinates.some(
          (c) => haversine([center.lng, center.lat], c) < 30
        )
      )
    ) {
      h.setStyle({
        color: "#000000",
        weight: 3,
        fillColor: "#FF3333",
        fillOpacity: 1,
      });
      h.bringToFront(); // ← ajoute ceci

      h.bindTooltip("🏠 Maison impactée").openTooltip();
    }
  });

  // Nœuds voisins
  nodesLayer.eachLayer((n) => {
    if (n === layer) return;
    const np = [n.getLatLng().lng, n.getLatLng().lat];
    if (
      impactedLines.some((ln) =>
        ln.feature.geometry.coordinates.some((c) => haversine(np, c) < 15)
      )
    ) {
      n.setIcon(iconAffected);
    }
  });
}

/* ─── Bind du clic sur tous les markers de nœud ───────────────────── */
setTimeout(() => {
  nodesLayer.eachLayer((m) => {
    if (m.feature) {
      m.on("click", () => simulateIncident(m.feature, m));
    }
  });
}, 500);

/* ─── Export GeoJSON des incidents ────────────────────────────────── */
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

/* ─── Reset complet ───────────────────────────────────────────────── */
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
