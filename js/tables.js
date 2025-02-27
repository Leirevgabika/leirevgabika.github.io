// Función para obtener la ubicación actual
function obtenerUbicacionActual() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('La geolocalización no está soportada por este navegador.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(`Error al obtener ubicación: ${error.message}`);
            }
        );
    });
}

// Función para obtener datos meteorológicos históricos de Open-Meteo
async function obtenerDatosHistoricos(lat, lon, fechaInicio, fechaFin) {
    // Formatea las fechas como YYYY-MM-DD
    const inicio = fechaInicio.toISOString().split('T')[0];
    const fin = fechaFin.toISOString().split('T')[0];

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${inicio}&end_date=${fin}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant&timezone=auto`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error('Error al obtener datos históricos:', error);
        return null;
    }
}

// Función para procesar los datos en formato adecuado para DataTables
function procesarDatos(datosMeteo) {
    if (!datosMeteo || !datosMeteo.daily) return [];

    const resultado = [];
    const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, windspeed_10m_max, winddirection_10m_dominant } = datosMeteo.daily;

    for (let i = 0; i < time.length; i++) {
        resultado.push({
            fecha: time[i],
            tempMax: temperature_2m_max[i],
            tempMin: temperature_2m_min[i],
            precipitacion: precipitation_sum[i],
            velocidadViento: windspeed_10m_max[i],
            direccionViento: winddirection_10m_dominant[i]
        });
    }

    return resultado;
}

// Función para inicializar DataTable
function inicializarTabla(datos) {
    $('#tabla-meteorologica').DataTable({
        data: datos,
        columns: [
            { data: 'fecha', title: 'Fecha' },
            { data: 'tempMax', title: 'Temp. Máxima (°C)' },
            { data: 'tempMin', title: 'Temp. Mínima (°C)' },
            { data: 'precipitacion', title: 'Precipitación (mm)' },
            { data: 'velocidadViento', title: 'Vel. Viento (km/h)' },
            { data: 'direccionViento', title: 'Dir. Viento (°)' }
        ],
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        responsive: true,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        }
    });
}

// Función principal
async function inicializar() {
    try {
        // Mostrar indicador de carga
        document.getElementById('cargando').style.display = 'block';

        // Obtener ubicación actual
        const ubicacion = await obtenerUbicacionActual();

        // Calcular fechas para los últimos 30 días
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 30);

        // Obtener y procesar datos meteorológicos
        const datosMeteo = await obtenerDatosHistoricos(
            ubicacion.latitude,
            ubicacion.longitude,
            fechaInicio,
            fechaFin
        );

        const datosFormateados = procesarDatos(datosMeteo);

        // Mostrar información de ubicación
        document.getElementById('ubicacion-info').textContent =
            `Datos meteorológicos para: Lat ${ubicacion.latitude.toFixed(4)}, Lon ${ubicacion.longitude.toFixed(4)}`;

        // Inicializar DataTable
        inicializarTabla(datosFormateados);

        // Ocultar indicador de carga
        document.getElementById('cargando').style.display = 'none';
        document.getElementById('contenedor-tabla').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('cargando').style.display = 'none';
        document.getElementById('error-mensaje').textContent = `Error: ${error}`;
        document.getElementById('error-mensaje').style.display = 'block';
    }
}

// Inicializar cuando el documento esté listo
$(document).ready(function () {
    // Configurar botones de fechas
    $('#btn-7dias').click(function () {
        cambiarPeriodo(7);
    });

    $('#btn-30dias').click(function () {
        cambiarPeriodo(30);
    });

    $('#btn-90dias').click(function () {
        cambiarPeriodo(90);
    });

    // Iniciar el proceso
    inicializar();
});

// Función para cambiar el periodo de tiempo
async function cambiarPeriodo(dias) {
    // Destruir tabla existente
    $('#tabla-meteorologica').DataTable().destroy();

    // Mostrar cargando
    document.getElementById('cargando').style.display = 'block';
    document.getElementById('contenedor-tabla').style.display = 'none';

    try {
        // Obtener ubicación
        const ubicacion = await obtenerUbicacionActual();

        // Calcular fechas
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - dias);

        // Obtener nuevos datos
        const datosMeteo = await obtenerDatosHistoricos(
            ubicacion.latitude,
            ubicacion.longitude,
            fechaInicio,
            fechaFin
        );

        const datosFormateados = procesarDatos(datosMeteo);

        // Actualizar tabla
        inicializarTabla(datosFormateados);

        // Ocultar cargando
        document.getElementById('cargando').style.display = 'none';
        document.getElementById('contenedor-tabla').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-mensaje').textContent = `Error: ${error}`;
        document.getElementById('error-mensaje').style.display = 'block';
    }
}