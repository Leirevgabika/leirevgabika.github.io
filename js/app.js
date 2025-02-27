import { auth } from './auth.js';
import {
    signOut
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"

$(document).ready(function () {
    let userEmail = document.getElementById('user-email');
    userEmail.textContent = sessionStorage.getItem('userEmail');

    // Cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('Sesión cerrada correctamente');
            window.location.replace("./index.html");
        }).catch(error => {
            console.log(`Error al cerrar sesión: ${error}`);
        });
    });
});
