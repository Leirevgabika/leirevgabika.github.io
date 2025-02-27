let uploadButton;
let cameraButton;
let fileInput;
let video;
let captureButton;
let imagePreview;
let analyzeButton;
let loadingMessage;
let resultDiv;

// Variables para almacenar el modelo y la imagen
let model;
let capturedImage;

// Detectar si es dispositivo móvil (Android)
const isMobile = /Android/i.test(navigator.userAgent);

// Cargar modelo de TensorFlow.js al iniciar
async function loadModel() {
    try {
        model = await mobilenet.load();
        console.log('Modelo MobileNet cargado');

        // Mostrar botón de cámara en dispositivos móviles
        if (isMobile && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            cameraButton.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error al cargar el modelo:', error);
        resultDiv.textContent = 'Error al cargar el modelo de detección. Por favor, recarga la página.';
    }
}

// Iniciar la cámara
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.srcObject = stream;
        video.style.display = 'block';
        captureButton.style.display = 'block';
        uploadButton.style.display = 'none';
        cameraButton.style.display = 'none';
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        resultDiv.textContent = 'No se pudo acceder a la cámara. Verifica los permisos.';
    }
}

// Capturar imagen desde la cámara
function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Detener la transmisión de video
    const stream = video.srcObject;
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }

    // Mostrar la imagen capturada
    imagePreview.src = canvas.toDataURL('image/png');
    imagePreview.style.display = 'block';
    video.style.display = 'none';
    captureButton.style.display = 'none';

    // Preparar para análisis
    capturedImage = canvas;
    analyzeButton.style.display = 'block';
    uploadButton.style.display = 'block';
    if (isMobile) {
        cameraButton.style.display = 'block';
    }
}

// Analizar la imagen con TensorFlow.js
async function analyzeImage() {
    if (!capturedImage && !imagePreview.src) {
        resultDiv.textContent = 'Por favor, selecciona o captura una imagen primero.';
        return;
    }

    try {
        // Mostrar mensaje de carga
        loadingMessage.style.display = 'block';
        resultDiv.textContent = '';

        // Realizar la predicción
        const predictions = await model.classify(imagePreview);

        // Buscar si alguna predicción menciona "vaca" (cow)
        const cowPrediction = predictions.find(p =>
            p.className.toLowerCase().includes('cow') ||
            p.className.toLowerCase().includes('vaca')
        );

        // Mostrar los resultados
        loadingMessage.style.display = 'none';

        if (cowPrediction) {
            const percentage = (cowPrediction.probability * 100).toFixed(2);
            resultDiv.innerHTML = `¡Detectada una vaca! (${percentage}% de confianza)<br>
                                  Clasificación: ${cowPrediction.className}`;
        } else {
            resultDiv.textContent = 'No se detectaron vacas en la imagen.';
            // Mostrar la primera predicción
            if (predictions.length > 0) {
                const topPrediction = predictions[0];
                const topPercentage = (topPrediction.probability * 100).toFixed(2);
                resultDiv.innerHTML += `<br>La imagen parece contener: ${topPrediction.className} (${topPercentage}%)`;
            }
        }

        console.log('Todas las predicciones:', predictions);
    } catch (error) {
        loadingMessage.style.display = 'none';
        console.error('Error al analizar la imagen:', error);
        resultDiv.textContent = 'Error al analizar la imagen. Inténtalo de nuevo.';
    }
}

// Manejar carga de imágenes desde archivo
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
        const reader = new FileReader();

        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            analyzeButton.style.display = 'block';

            // Limpiar el video si estaba activo
            if (video.srcObject) {
                const stream = video.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.style.display = 'none';
                captureButton.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    }
}

$(document).ready(function () {
    // Referencias a elementos del DOM
    uploadButton = document.getElementById('uploadButton');
    cameraButton = document.getElementById('cameraButton');
    fileInput = document.getElementById('fileInput');
    video = document.getElementById('video');
    captureButton = document.getElementById('captureButton');
    imagePreview = document.getElementById('imagePreview');
    analyzeButton = document.getElementById('analyzeButton');
    loadingMessage = document.getElementById('loadingMessage');
    resultDiv = document.getElementById('result');

    // Event listeners
    uploadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    cameraButton.addEventListener('click', startCamera);
    captureButton.addEventListener('click', captureImage);
    analyzeButton.addEventListener('click', analyzeImage);

    // Cargar el modelo al iniciar
    loadModel();

});