let map;



// funcion que muestra un mapa con leaflet.js en la posicion indicada
function init_mapa(posicion) {
    let latitud = posicion.coords.latitude;
    let longitud = posicion.coords.longitude;
    let nivel_zoom = 12;

    // mostrar el punto en el mapa con Leaflet.js
    map = L.map('map').setView([latitud, longitud], nivel_zoom);

    // añadir el mapa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // añadir control de escala
    L.control.scale().addTo(map);
    // añadir un marcador en las coordenadas
    L.marker([latitud, longitud], { draggable: false }).addTo(map);

}
// Función para obtener datos meteorológicos de Open-Meteo
async function obtenerDatosMeteorologicos(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation&current_weather=true`;

    try {
        const respuesta = await fetch(url);
        return await respuesta.json();
    } catch (error) {
        console.error('Error al obtener datos meteorológicos:', error);
        return null;
    }
}

async function obtener_datos_meteo(latitud, longitud) {
    const url_peticion = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m&current_weather=true&timezone=auto`;
    // `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,apparent_temperature,visibility,pressure_msl,uv_index,precipitation,cloudcover&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    fetch(url_peticion)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error('Error al obtener datos meteorológicos');
            }
            return respuesta.json();
        })
        .then(data => {
            console.log('Datos meteorológicos actualizados');
            createWeatherCards(data);
            añadir_capas_meteo(longitud, latitud, data);
        })
        .catch(error => {
            console.log('Error: ', error.message);
        });

}

function datos_meteo(posicion) {
    let latitud = posicion.coords.latitude;
    let longitud = posicion.coords.longitude;
    let datos = obtener_datos_meteo(latitud, longitud);
}




// Crear tarjetas meteorológicas con D3.js
function createWeatherCards(data) {
    // Limpiar contenedor
    const weatherCardsContainer = document.getElementById('weather-cards');
    weatherCardsContainer.innerHTML = '';

    // Definir configuración de las tarjetas
    const cardConfigs = [
        {
            title: "Temperatura",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>`,
            value: data.current_weather.temperature,
            unit: "°C",
            dataKey: "temperature_2m",
            color: "#FF5722"
        },
        {
            title: "Humedad",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
            value: data.hourly.relativehumidity_2m[Math.floor(data.hourly.time.length / 2)],
            unit: "%",
            dataKey: "relativehumidity_2m",
            color: "#2196F3"
        },
        {
            title: "Precipitaciones",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>`,
            value: data.hourly.precipitation[Math.floor(data.hourly.time.length / 2)],
            unit: "mm",
            dataKey: "precipitation",
            color: "#673AB7"
        },
        {
            title: "Velocidad del Viento",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path><path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path><path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path></svg>`,
            value: data.current_weather.windspeed,
            unit: "km/h",
            dataKey: "windspeed_10m",
            color: "#009688"
        }
    ];
    // Preparar datos para gráficos
    const timeLabels = data.hourly.time.map(t => {
        const date = new Date(t);
        return `${date.getHours()}:00`;
    });

    // Solo mostrar cada 3 horas para simplificar
    const filteredIndices = Array.from({ length: data.hourly.time.length }, (_, i) => i)
        .filter(i => i % 3 === 0);

    const filteredTimeLabels = filteredIndices.map(i => timeLabels[i]);

    // Crear tarjetas con D3
    cardConfigs.forEach(config => {
        // Crear contenedor para tarjeta
        const cardDiv = document.createElement('div');
        cardDiv.className = 'weather-card';
        weatherCardsContainer.appendChild(cardDiv);

        // Crear encabezado de tarjeta
        const headerDiv = document.createElement('div');
        headerDiv.className = 'card-header';
        headerDiv.innerHTML = `
            <span>${config.title}</span>
            <div class="weather-icon">${config.icon}</div>
        `;
        cardDiv.appendChild(headerDiv);

        // Crear cuerpo de tarjeta
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'card-body';
        cardDiv.appendChild(bodyDiv);

        // Mostrar valor actual
        const valueDiv = document.createElement('div');
        valueDiv.className = 'value-display';
        valueDiv.innerHTML = `${config.value} <span class="value-unit">${config.unit}</span>`;
        bodyDiv.appendChild(valueDiv);

        // Crear contenedor para gráfico
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart-container';
        chartDiv.id = `chart-${config.dataKey}`;
        bodyDiv.appendChild(chartDiv);

        // Filtrar datos para el gráfico (cada 3 horas)
        const filteredData = filteredIndices.map(i => ({
            time: timeLabels[i],
            value: data.hourly[config.dataKey][i]
        }));

        // Crear gráfico con D3
        createChart(chartDiv.id, filteredData, config.color);
    });
}

// Crear gráfico con D3
function createChart(containerId, data, color) {
    // Dimensiones del gráfico
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const container = document.getElementById(containerId);
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Limpiar contenedor
    d3.select(`#${containerId}`).html("");

    // Crear SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Escalas X e Y
    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.time))
        .padding(0.2);

    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d.value) * 1.2]);

    // Ejes X e Y
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .call(d3.axisLeft(y));

    // Barras
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.time))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", color)
        .attr("rx", 4)
        .attr("ry", 4);

    // Añadir valores en las barras
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("x", d => x(d.time) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .text(d => d.value.toFixed(1))
        .style("font-size", "10px")
        .style("fill", "#333");
}

$(document).ready(function () {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(init_mapa);
        navigator.geolocation.getCurrentPosition(datos_meteo);
    } else {
        alert("Este navegador no soporta geolocalizacion");
    }
});

// Función para crear capa de calor de humedad
async function crearCapaHumedad(puntos) {
    // Obtener datos para cada punto
    const datosHumedad = [];

    for (const punto of puntos) {
        const datos = await obtenerDatosMeteorologicos(punto.lat, punto.lon);
        if (datos) {
            // Usamos el valor actual de humedad relativa
            const humedad = datos.hourly.relativehumidity_2m[0];
            datosHumedad.push([punto.lat, punto.lon, humedad]);
        }
    }

    // Crear capa de calor
    const capaHumedad = L.heatLayer(datosHumedad, {
        radius: 25,
        blur: 15,
        max: 100,
        gradient: {
            0.0: 'blue',
            0.5: 'lime',
            1.0: 'red'
        }
    });

    return capaHumedad;
}

// Función para crear capa de precipitaciones
function crearCapaPrecipitaciones(geojsonData) {
    // Estilo basado en la intensidad de precipitación
    function estiloPrecipitacion(feature) {
        const precipitacion = feature.properties.precipitacion;

        let color = '#ffffff';
        let opacidad = 0;

        if (precipitacion > 0 && precipitacion <= 1) {
            color = '#c7e9c0';
            opacidad = 0.5;
        } else if (precipitacion > 1 && precipitacion <= 5) {
            color = '#74c476';
            opacidad = 0.6;
        } else if (precipitacion > 5 && precipitacion <= 10) {
            color = '#41ab5d';
            opacidad = 0.7;
        } else if (precipitacion > 10) {
            color = '#006d2c';
            opacidad = 0.8;
        }

        return {
            fillColor: color,
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: opacidad
        };
    }

    const capaPrecipitaciones = L.geoJSON(geojsonData, {
        style: estiloPrecipitacion,
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`Precipitación: ${feature.properties.precipitacion} mm`);
        }
    });

    return capaPrecipitaciones;
}

// Función para formatear los datos de Open-Meteo a GeoJSON
function formatearDatosAGeoJSON(datosMeteo, coordenadas) {
    const features = [];

    // Asumiendo que datosMeteo.hourly.precipitation contiene datos horarios de precipitación
    for (let i = 0; i < datosMeteo.hourly.precipitation.length; i++) {
        const horaActual = datosMeteo.hourly.time[i];
        const precipitacion = datosMeteo.hourly.precipitation[i];

        if (precipitacion > 0) {
            features.push({
                type: "Feature",
                properties: {
                    tiempo: horaActual,
                    precipitacion: precipitacion
                },
                geometry: {
                    type: "Point",
                    coordinates: [coordenadas.lon, coordenadas.lat]
                }
            });
        }
    }

    return {
        type: "FeatureCollection",
        features: features
    };
}

async function añadir_capas_meteo(longitud, latitud, datos) {
    // Definir puntos de la región para la capa de humedad
    const puntosMuestreo = [
        { lat: longitud, lon: latitud }, // posicion actual
        { lat: 43.46472, lon: -3.80444 },  // Santander
        { lat: 43.26271, lon: -2.92528 }, // Bilbao
        { lat: 43.38285, lon: -3.22043 } // Castro-Urdiales
    ];

    // Crear y añadir capa de humedad
    const capaHumedad = await crearCapaHumedad(puntosMuestreo);

    // Obtener datos para capa de precipitaciones
    const geoJsonPrecipitaciones = formatearDatosAGeoJSON(datos, { lat: longitud, lon: latitud });
    const capaPrecipitaciones = crearCapaPrecipitaciones(geoJsonPrecipitaciones);


    const capasSuperpuestas = {
        "Humedad": capaHumedad,
        "Precipitaciones": capaPrecipitaciones
    };


    let capas = L.control.layers(capasSuperpuestas).addTo(map);
    // layerControl.addBaseLayer(map, "OpenTopoMap");
    // layerControl.addOverlay(capasSuperpuestas["Humedad"], "Humedad");
}