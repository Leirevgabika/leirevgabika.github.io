// Import the functions you need from the SDKs you need

// import { initializeApp } from "firebase/app"; // para usar la libreria local, pero da un error
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// configuracion de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCQIHBs1rhS6DfaWk0RRVeCWrPZD1qp6lU",
    authDomain: "agriweb-c97e4.firebaseapp.com",
    projectId: "agriweb-c97e4",
    storageBucket: "agriweb-c97e4.firebasestorage.app",
    messagingSenderId: "685890326589",
    appId: "1:685890326589:web:14a9bf476762f206221a54"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Referencias a elementos DOM
const tabs = document.querySelectorAll('.tab');
const formContainers = document.querySelectorAll('.form-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const resetForm = document.getElementById('reset-form');
const authForms = document.getElementById('auth-forms');
const userAuthenticated = document.getElementById('user-authenticated');
const userEmail = document.getElementById('user-email');
const messageContainer = document.getElementById('message-container');

// Cambio de pestañas
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const formId = tab.getAttribute('data-form');

        // Activar pestaña
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Mostrar formulario correspondiente
        formContainers.forEach(form => form.classList.remove('active'));
        document.getElementById(`${formId}-form`).classList.add('active');

        // Limpiar mensajes
        clearMessages();
    });
});

// Mostrar mensaje
function showMessage(message, type) {
    clearMessages();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    messageContainer.appendChild(messageDiv);
}

// Limpiar mensajes
function clearMessages() {
    messageContainer.innerHTML = '';
}

// Manejo del formulario de registro
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Usuario registrado
            const user = userCredential.user;
            document.getElementById('auth-status').textContent = `Usuario registrado: ${user.email}`;
        })
        .catch((error) => {
            // Manejo de errores
            document.getElementById('auth-status').textContent = `Error: ${error.message}`;
        });
});

// Manejo del formulario de inicio de sesión
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .catch(error => {
            let errorMessage = '';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Esta cuenta ha sido deshabilitada';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = 'Credenciales incorrectas';
                    break;
                default:
                    errorMessage = error.message;
            }

            showMessage(errorMessage, 'error');
        });
});

// Registro
document.getElementById('register-btn').addEventListener('click', () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (!email || !password || !confirmPassword) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => {
            let errorMessage = '';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este correo ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es demasiado débil';
                    break;
                default:
                    errorMessage = error.message;
            }

            showMessage(errorMessage, 'error');
        });
});

// Recuperación de contraseña
document.getElementById('reset-btn').addEventListener('click', () => {
    const email = document.getElementById('reset-email').value;

    if (!email) {
        showMessage('Por favor, ingresa tu correo electrónico', 'error');
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            showMessage('Se ha enviado un correo de recuperación', 'success');
            document.getElementById('reset-email').value = '';
        })
        .catch(error => {
            let errorMessage = '';

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'No existe cuenta con este correo';
                    break;
                default:
                    errorMessage = error.message;
            }

            showMessage(errorMessage, 'error');
        });
});

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        showMessage('Sesión cerrada correctamente', 'success');
    }).catch(error => {
        showMessage('Error al cerrar sesión', 'error');
    });
});

// Observador de estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuario está autenticado
        userEmail.textContent = user.email;
        authForms.style.display = 'none';
        userAuthenticated.style.display = 'block';
    } else {
        // Usuario no está autenticado
        authForms.style.display = 'block';
        userAuthenticated.style.display = 'none';
    }
});