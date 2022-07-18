import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats as stats_original} from "./stats";
import { stats_17_jul } from "./stats_17_jul"

var stats = stats_original

var maxAffected = stats.reduce(
  (max, item) => (item.value > max ? item.value : max),
  0
);

var affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([0, 50]); // 50 pixel max radius, we could calculate it relative to width and height


const updateChart = (data: { name: string; value: number; }[]) => {
  stats = data;
  maxAffected = stats.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );
  affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([0, 50]);

  svg
  .selectAll("circle")
  .data(latLongCommunities) 
  .transition()
  .duration(500)
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name));
};


document
  .getElementById("old_data")
  .addEventListener("click",
    () => {updateChart(stats_original)}
  );

document
  .getElementById("new_data")
  .addEventListener("click",
    () => {updateChart(stats_17_jul)}
  );


const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
  const entry = stats.find(item => item.name === comunidad);

  return entry ? affectedRadiusScale(entry.value) : 0;
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const aProjection = d3Composite
  .geoConicConformalSpain()
  // Let's make the map bigger to fit in our resolution
  .scale(3300)
  // Let's center the map
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  // data loaded from json file
  .attr("d", geoPath as any);

svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
  .attr("cx", d => aProjection([d.long, d.lat])[0])
  .attr("cy", d => aProjection([d.long, d.lat])[1])
