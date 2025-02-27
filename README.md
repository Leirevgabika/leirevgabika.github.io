# AgriWeb-App

Plataforma Inteligente de Agricultura Local

# Funciones principales

- Registro y control de login de usuarios.
- Mapa mostrando la ubicacion geografica actual mediante geolocalizacion.
- Muestra informacion metereologica de la zona incluyendo temperatura, humedad, precipitaciones y velocidad del viento.
- Incluye datos historicos que muestran la progresion de dichos factores metereologicos.
- Muestra una tabla con el historico de los 30 ultimos dias, permitiendo ordenar, filtrar, imprimir y exportar los datos.
- Proporciona un modulo que permite detectar la presencia de vacas mediante la captura de imagenes a traves de la camara del dispositivo movil.

# Detalles tecnicos

Para la autenticacion de usuarios se ha utilizado [Firebase Auth](https://firebase.google.com/docs/auth?hl=es).

Los datos geograficos se han obtenido de [OpenStreetMap](https://wiki.openstreetmap.org/wiki/API).

Los datos metereologicos se han obtenido de [Open-Meteo](https://open-meteo.com/en/docs).

> No hemos podido utilizar la api de https://openweathermap.org/api dado que desde Junio de 2024 ofrecen todas sus versiones con un plan de pago en el que para optener la API KEY debemos registrarnos introduciendo la tarjeta de crédito. Por ello usamos la API de Open-Meteo: La API de Open-Meteo es un servicio gratuito de previsión meteorológica diseñado para desarrolladores. Ofrece datos meteorológicos en tiempo real y previsiones a corto y largo plazo.

Las tablas de datos se muestran a traves de [DataTables](https://datatables.net/).

Las tarjetas interactivas se muestran a traves de [D3.js](https://d3js.org/).

El analisis de imagenes se realiza a traves de [TensorFlow.js](https://www.tensorflow.org/js?hl=es) usando el modelo [Mobilenet](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet).

Otras tecnologias utilizadas:
  - jQuery
  - Javascript ES6
  - HTML5
  - CSS3