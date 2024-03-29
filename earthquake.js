// API_KEY is stored in config.js file

// Query URL
var URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Size of the marker
function markerSize(magnitude){
    return magnitude * 5;
};
// combining multiple layers into a group
var allData = new L.LayerGroup();

d3.json(URL, function(data){
    L.geoJSON(data.features, {
        // convert point feature to map layer 
        pointToLayer: function(feature, coord){
            return L.circleMarker(coord, {
                radius: markerSize(feature.properties.mag)
            });
        },
        style: function(dataFeature){
            return {
                fillColor: Color(dataFeature.properties.mag),
                fillOpacity: 0.5,
                weight: 0.1,
                color: 'black'
            }
        },

        onEachFeature: function(feature, layer){
            layer.bindPopup('<h3>' + feature.properties.place + '<h3><hr><p>' +
            new Date(feature.properties.time) + '</p>');
        }

    }).addTo(allData);
    dataMap(allData); 
});

var plate_URL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
var boundary = new L.LayerGroup();

d3.json(plate_URL, function(data){
    L.geoJSON(data.features, {
        style: function (geoJsonFeature){
            return{
                weight: 3,
                color: 'orange'
            }
        },
    }).addTo(boundary);
})

function Color(magnitude){
    // console.log(magnitude)
    if (magnitude > 5){
        return 'red'
    } else if (magnitude > 4){
        return 'darkorange'
    } else if (magnitude > 3){
        return 'tan'
    } else if (magnitude > 2){
        return 'yellow'
    } else if (magnitude > 1){
        return 'darkgreen'
    } else {
        return 'lightgreen'
    }
};

function dataMap(){
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    var baseMaps = {
        'Street Map': streetmap,
        'Light Map': lightmap,
        'Satellite': satellite
    };

    var overlayMaps = {
        "Earthquakes": allData,
        'Fault Line': boundary
    };

    var myMap = L.map('map', {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [streetmap, allData, lightmap, satellite, boundary]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function(myMap){
        var div = L.DomUtil.create("div", "info legend"),
         magnitude = [0, 1, 2, 3, 4, 5];
         color = [];

    div.innerHTML += "<h4 style='margin:4px'>Color Scale</h4>"

    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML += "<i style='background: " + Color(magnitude[i] +1) + "'></i> " +
          magnitude[i] + ( magnitude[i + 1] ? "&ndash;" + magnitude[i + 1] + "<br>" : "+");
      }
      return div;
    };
    legend.addTo(myMap);
}