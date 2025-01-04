export const mechelenDistricts = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Mechelen"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [4.4400, 51.0060],
            [4.4400, 51.0500],
            [4.5200, 51.0500],
            [4.5200, 51.0060],
            [4.4400, 51.0060]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "District 1"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [4.4450, 51.0100],
            [4.4450, 51.0200],
            [4.4550, 51.0200],
            [4.4550, 51.0100],
            [4.4450, 51.0100]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "District 2"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [4.4600, 51.0150],
            [4.4600, 51.0250],
            [4.4700, 51.0250],
            [4.4700, 51.0150],
            [4.4600, 51.0150]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "District 3"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [4.4750, 51.0050],
            [4.4750, 51.0150],
            [4.4850, 51.0150],
            [4.4850, 51.0050],
            [4.4750, 51.0050]
          ]
        ]
      }
    }
  ]
} as const;

// Helper to get district name from the GeoJSON properties
export const getDistrictName = (properties: any): string => {
  return properties.name || "Unknown District";
};
