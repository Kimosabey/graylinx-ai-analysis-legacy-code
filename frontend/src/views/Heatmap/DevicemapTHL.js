import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Map, TileLayer, ImageOverlay, Marker, Popup, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocalConvenienceStoreOutlined } from '@material-ui/icons';
import Leaflet from 'leaflet';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '2%'
  }
}));

function getJSONElement(myJson, elementPath = []) {
  let eValue = myJson;
  for (let i = 0; i < elementPath.length; i++) {
    if (eValue !== undefined && eValue !== null) {
      eValue = eValue[elementPath[i]];

      // Check if the value is the string "NULL" and return null
      if (typeof eValue === 'string' && eValue.toUpperCase() === 'NULL') {
        return null;
      }
    } else {
      eValue = undefined;
      console.log(`Unable to process JSON: ${elementPath}`);
      break;
    }
  }
  return eValue !== undefined ? eValue : null;
}

function isPointInsidePolygon(point, polygon) {
  const x = getJSONElement(point, [0]);
  const y = getJSONElement(point, [1]);
  let isInside = false;
  let order = []; // Array to store the order of coordinates

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = getJSONElement(polygon[i], [0]);
    const yi = getJSONElement(polygon[i], [1]);
    const xj = getJSONElement(polygon[j], [0]);
    const yj = getJSONElement(polygon[j], [1]);

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
      order.push(i); // Store the order of coordinates
    }
  }

  return { isInside, order };
}

function DevicemapTHL({ data, data1, index, value, iconDevice }) {
  
  const polygons = [];
  const seenCoordinates = new Set();

  data.forEach((item, index) => {
    const coordinates = getJSONElement(item, ['zone_coordinates']);
  
    if (coordinates && Array.isArray(coordinates)) {
      const coordinatesString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join('|');
  
      if (!seenCoordinates.has(coordinatesString)) {
        polygons.push({
          coordinates: coordinates.map(coord => [coord[0], coord[1]]),
          gradientId: `gradient${polygons.length + 1}`
        });
  
        seenCoordinates.add(coordinatesString);
      }
    }
  });

  const classes = useStyles();
  const mapRef = React.createRef();
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });


  const generateGradientColors = (points) => {
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    // console.log("sortedpoints",sortedPoints)
    return sortedPoints.map((point) => {
      const value = point.altitude;
      let color;

      if (value >= 0 && value <= 22) {
        color = '#70feff';
      } else if (value > 22 && value <= 28) {
        color = '#449e48';
      } else {
        color = '#ee6b6e';
      }

      return color;
    });
  };


  useEffect(() => {
    polygons.forEach((polygon, index) => {
      const { coordinates } = polygon;
      const pointsInsidePolygon = [];

      data1.forEach((point, pointIndex) => {
        if (isPointInsidePolygon(point, coordinates).isInside) {
          pointsInsidePolygon.push({
            pointIndex,
            x: point[0],
            y: point[1],
            altitude: point[2]
          });
        }
      });

      console.log(`Polygon ${index + 1} coordinates (from left to right):`);
      pointsInsidePolygon.forEach((point, pointIndex) => {
        const color = generateGradientColors([point])[0];
        // console.log("color",color)
        // console.log(`Coordinate ${pointIndex + 1}: [${point.x}, ${point.y}, ${point.altitude}] - Color: ${color}`);
      });

      const gradient = document.getElementById(polygon.gradientId);
      if (gradient) {
        const colors = generateGradientColors(pointsInsidePolygon);
        // console.log("ccccccccccccccccccccccccccccccccccccccccccc",colors)
        gradient.innerHTML = ''; // Clear previous stops

        colors.forEach((color, colorIndex) => {
          const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop.setAttribute('offset', `${(colorIndex / (colors.length - 1)) * 100}%`);
          stop.setAttribute('stop-color', color);
          gradient.appendChild(stop);
        });
    
      }
    });
  }, [data1, polygons]);


  
  return (
    <div>
        <React.Fragment>
            {polygons.map((polygon, index) => (
                 <Polygon
                 key={index}
                 positions={polygon.coordinates}
                 fill={true}
                 fillRule="evenodd"
                //  color="gray"
                color="transparent"
                opacity={1}
                weight={2}
                 fillColor={`url(#${polygon.gradientId})`}
                 fillOpacity={0.1}
               />
            ))}
            {data.map((value1, index) => {
              const coordinates = getJSONElement(value1, ['coordinates']);

              if(coordinates && Array.isArray(coordinates) && coordinates.length >= 2){
                return (
                  <Marker key={index} position={[coordinates[0], coordinates[1]]} icon={iconDevice}>
            <Tooltip opacity={1} className={classes.transparentTooltip1}>
              {Object.keys(value1).map((key) => (
                key !== "ssid" &&
                key !== "coordinates" &&
                key !== "zoneId" &&
                key !== "zone_coordinates" &&
                key !== "type" &&
                key !== "zoneColor" &&
                key !== "id" &&
                key !== "temperature" ?  (
                  <></>
                ) : (
                  <p key={key}>
                    {key === "name" ? (
                      <>{value1[key]}</>
                    ) : (
                      <></>
                    )}
                    {key === "temperature" && value === 'THL' ? (
                      <>
                        {value1.name}
                        <br />
                        <b>Temperature:</b> {formatter.format(value1.temperature)}°C
                      </>
                    ) : (
                      <></>
                    )}
                  </p>
                )
              ))}
            </Tooltip>
          </Marker>
                );
              }else{
                return null;
              }
          
            })}

          {polygons.map((polygon, index) => (
          <svg key={index} height="0" width="0">
            <defs>
              <linearGradient id={polygon.gradientId} x1="0%" y1="0%" x2="100%" y2="0%" />
            </defs>
          </svg>
        ))}
        </React.Fragment>
    </div>
  );
}

export default DevicemapTHL;
