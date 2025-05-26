-- Create a new table containing geometreis in the 'geom' column, and a textual 'name'.
CREATE TABLE geometries (name varchar, geom geometry);

-- Insert geometry values into the new table. We insert several geometries, including a point, a line string, 
-- two polygons and a collection.
INSERT INTO geometries VALUES  
  ('Point', 'POINT(0 0)'),  
  ('Linestring', 'LINESTRING(0 0, 1 1, 2 1, 2 2)'),  
  ('Polygon', 'POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))'), 
  ('PolygonWithHole', 'POLYGON((0 0, 10 0, 10 10, 0 10, 0 0),
                               (1 1, 1 2, 2 2, 2 1, 1 1))'),  
  ('Collection', 'GEOMETRYCOLLECTION(POINT(2 0),
                                     POLYGON((0 0, 1 0, 1 1, 0 1, 0 0)))');


-- We obtain several attributes of the geometries, namely: the type, number of dimensions, reference system ID, number of geometrie
SELECT name, ST_GeometryType(geom), ST_NDims(geom), ST_SRID(geom), ST_NumGeometries(geom) FROM geometries; 

-- X and y coordinates of a point
SELECT ST_X(geom), ST_Y(geom)
  FROM geometries
  WHERE name = 'Point';
 
--  Well known text of a point
SELECT ST_X(geom), ST_Y(geom), ST_asText(geom) FROM geometries  WHERE name = 'Point';

-- Length, number of points of a LineString
SELECT ST_Length(geom), ST_Npoints(geom)  FROM geometries  WHERE name = 'Linestring';

-- Area, number of rings, interior and exterior rings of a polygon
SELECT name, ST_Area(geom), ST_NRings(geom), ST_AsText(ST_InteriorRingN(geom,1)), ST_AsText(ST_ExteriorRing(geom))
  FROM geometries
  WHERE name LIKE 'Polygon%';
  
-- GeoJSON format
SELECT ST_AsGeoJSON(geom)
  FROM geometries
  WHERE name = 'Linestring';
