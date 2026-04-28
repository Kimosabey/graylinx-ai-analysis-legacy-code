import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Map, TileLayer, ImageOverlay, Marker, Popup, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import floor1 from '../../assets/Images/Floor-1.png';
import Leaflet from 'leaflet';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: '2%',
  },
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
  const [x, y] = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function InterpolationHeatmap({ data, data1, index, value, iconDevice }) {
  const polygons = [];
  const seenCoordinates = new Set();

  data.forEach((item) => {
    const coordinates = getJSONElement(item, ['zone_coordinates']);

    if (coordinates && Array.isArray(coordinates)) {
      const coordinatesString = coordinates.map((coord) => `${coord[0]},${coord[1]}`).join('|');

      if (!seenCoordinates.has(coordinatesString)) {
        polygons.push({
          coordinates: coordinates.map((coord) => [coord[0], coord[1]]),
          gradientId: `gradient${polygons.length + 1}`,
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
    return points.map((point) => {
      const value = point.altitude;
      let color;

      if(value >= 0 && value <= 4){
        color = '#ADD8E6'
      } else if (value > 4 && value <= 10){
        color = '#39e75f'
      } else if (value > 10 && value <= 15) {
        color = '#CCFF00'
      } else if (value > 15 && value <= 20) {
        color = '#FFFF2E'
      } else if (value > 20 && value <= 26) {
        color = '#da7922'
      } else if (value > 26 && value <= 32) {
        color = '#af621c'
      } else if (value > 32 && value <= 38) {
        color = '#c00'
      } else {
        color = '#6a0000'
      }
      // if (value >= 0 && value <= 22) {
      //   color = 'cyan';
      // } else if (value > 22 && value <= 28) {
      //   color = 'green';
      // } else {
      //   color = 'red';
      // }

      return color;
    });
  };

  const generateGradientColors1 = (points) => {
    return points.map((point) => {
      const value = point.altitude;
      let color;

      if (value >= 0 && value <= 5) {
        color = 'red';
      } else if (value > 6 && value <= 39) {
        color = 'yellow';
      } else if (value > 40 && value <= 60) {
        color = 'green';
      } else {
        color = 'red';
      }

      return color;
    });
  };

  const generateGradientColors2 = (points) => {
    return points.map((point) => {
      const value = point.altitude;
      let color;

      if (value >= 0 && value <= 100) {
        color = '#0000FF';
      } else if (value > 100 && value <= 300) {
        color = '#00FFFF';
      } else if (value > 300 && value <= 600) {
        color = 'green';
      } else if (value > 600 && value <= 900) {
        color = '#FF4F4B';
      } else {
        color = '#FFFF00';
      }

      return color;
    });
  };

  const generateGradientColors3 = (points) => {
    return points.map((point) => {
      const value = point.altitude;
      let color;

      if (value === 'unoccupied') {
        color = 'blue';
      } else {
        color = 'red';
      }

      return color;
    });
  };

  useEffect(() => {
    polygons.forEach((polygon) => {
      const { coordinates, gradientId } = polygon;
      const pointsInsidePolygon = [];

      data1.forEach((point) => {
        if (isPointInsidePolygon(point, coordinates)) {
          pointsInsidePolygon.push({
            x: point[0],
            y: point[1],
            altitude: point[2],
          });
        }
      });

      const gradient = document.getElementById(gradientId);
      if (gradient) {
        let colors;
        if (value === 'thl') {
          colors = generateGradientColors(pointsInsidePolygon);
        } else if (value === 'humidity') {
          colors = generateGradientColors1(pointsInsidePolygon);
        } else if (value === 'luminousity') {
          colors = generateGradientColors2(pointsInsidePolygon);
        } else if (value === 'occupancy') {
          colors = generateGradientColors3(pointsInsidePolygon);
        }

        gradient.innerHTML = '';
        colors.forEach((color, colorIndex) => {
          const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop.setAttribute('offset', `${(colorIndex / (colors.length - 1)) * 100}%`);
          stop.setAttribute('stop-color', color);
          gradient.appendChild(stop);
        });
      }
    });
  }, [data1, polygons, value]);

  return (
    <div>
      <Map
        ref={mapRef}
        doubleClickZoom={false}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        crs={Leaflet.CRS.Simple}
        center={[50, -100.66667]}
        attributionControl={false}
        bounds={[[0, -290], [420, 850]]}
        className={'floor-map'}
        onClick={(e) => {
          console.log({ x: e.latlng.lat, y: e.latlng.lng });
        }}
        style={{ backgroundColor: 'white' }}
      >
        <ImageOverlay interactive url={floor1} bounds={[[0, -290], [420, 850]]} />
        {['thl', 'humidity', 'luminousity', 'occupancy'].includes(value) &&
          polygons.map((polygon, index) => (
            <Polygon
              key={index}
              positions={polygon.coordinates}
              fill={true}
              fillRule="evenodd"
              color="transparent"
              opacity={5}
              weight={2}
              fillColor={`url(#${polygon.gradientId})`}
              fillOpacity={0.4}
            />
          ))}
        {data.map((value1, index) => {
          const coordinates = getJSONElement(value1, ['coordinates']);

          if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
            return (
              <Marker key={index} position={[coordinates[0], coordinates[1]]} icon={iconDevice}>
                <Tooltip opacity={1} className={classes.transparentTooltip1}>
                  {Object.keys(value1).map((key) =>
                    key !== 'ssid' &&
                    key !== 'coordinates' &&
                    key !== 'zoneId' &&
                    key !== 'zone_coordinates' &&
                    key !== 'type' &&
                    key !== 'zoneColor' &&
                    key !== 'id' &&
                    key !== 'temperature' &&
                    key !== 'humidity' &&
                    key !== 'luminousity' &&
                    key !== 'occupancy' ? (
                      <React.Fragment key={key}></React.Fragment>
                    ) : (
                      <p key={key}>
                        {key === 'name' ? <>{value1[key]}</> : <React.Fragment></React.Fragment>}
                        {key === 'temperature' && value === 'thl' ? (
                          <>
                            {value1.name}
                            <br />
                            <b>Temperature:</b> {formatter.format(value1.temperature)}°C
                          </>
                        ) : (
                          <React.Fragment></React.Fragment>
                        )}
                        {key === 'humidity' && value === 'humidity' ? (
                          <>
                            {value1.name}
                            <br />
                            <b>Humidity:</b> {formatter.format(value1.humidity)}%
                          </>
                        ) : (
                          <React.Fragment></React.Fragment>
                        )}
                        {key === 'luminousity' && value === 'luminousity' ? (
                          <>
                            {value1.name}
                            <br />
                            <b>Luminousity:</b> {formatter.format(value1.luminousity)} lux
                          </>
                        ) : (
                          <React.Fragment></React.Fragment>
                        )}
                        {key === 'occupancy' && value === 'occupancy' ? (
                          <>
                            {value1.name}
                            <br />
                            <b>Occupancy:</b> {value1.occupancy}
                          </>
                        ) : (
                          <React.Fragment></React.Fragment>
                        )}
                      </p>
                    ),
                  )}
                </Tooltip>
              </Marker>
            );
          } else {
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
        <ZoomControl position="bottomright" />
      </Map>
    </div>
  );
}

export default InterpolationHeatmap;
