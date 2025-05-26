-- Get all from cantons table
SELECT * FROM cantons;

-- Get only name and id 
-- Area in Km2 of Valaisform cantons tabel
SELECT name, id FROM cantons;

-- Count all cantons
SELECT COUNT(*) FROM cantons;

-- Information about canton of Valais
SELECT name, id, kantonsnum FROM cantons WHERE name='Valais';

-- Information about canton of Vaud
SELECT name, id, kantonsnum FROM cantons WHERE name='Vaud';

-- Information about canton of Fribourg
SELECT name, id, kantonsnum,kt_teil FROM cantons WHERE name='Fribourg';

-- Area in Km2 of Valais
SELECT name, ST_area(geom)/1000000 AS areakm2 FROM cantons WHERE name='Valais';

-- Area in Km2 of Fribourg polygons
SELECT name, ST_area(geom)/1000000 AS areakm2,kt_teil FROM cantons WHERE name='Fribourg';

-- Total area of all polygons of Fribourg
SELECT sum(ST_area(geom)/1000000) AS areakm2 FROM cantons WHERE name='Fribourg';

-- Area of Fribourg, from a table column
SELECT kantonsfla AS areaHa FROM cantons WHERE name='Fribourg' and kt_teil ='1';

-- Number of people and area of all cantons, ordered
SELECT name,einwohnerz, kantonsfla FROM cantons WHERE kt_teil in ('1','0') order by einwohnerz desc;

-- Population density of all cantons, ordered
SELECT name,einwohnerz/kantonsfla as density FROM cantons WHERE kt_teil in ('1','0') order by density desc;

-- smaller border length
select name, sum(ST_Perimeter(geom)) border from cantons group by name order by border;

-- Cantons that have a limit with Valais
SELECT c2.name, c2.kt_teil 
FROM cantons c1, cantons c2 
WHERE ST_Touches(c1.geom,c2.geom) 
and c1.name='Valais' and c1.gid<>c2.gid;

-- Canton polygons contained in Vaud (first attempt)
select c2.name, c2.kt_teil 
from cantons c1, cantons c2 
where ST_Contains(c1.geom,c2.geom) and c1.name='Vaud' and c1.gid<>c2.gid;


-- Canton polygons contained in Vaud (better)
select c2.name, c2.kt_teil 
from cantons c1, cantons c2 
where ST_Contains(
  ST_Polygon(ST_ExteriorRing(ST_GeometryN(c1.geom,1)),21781),
  c2.geom) 
and c1.name='Vaud' and c1.gid<>c2.gid;
