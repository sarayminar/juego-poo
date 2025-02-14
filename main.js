
// Clase principal del juego. Contiene la lógica de puntuación, creación de monedas(comida) y maletines, los efectos de sonido, la puntuación 0.
class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.maletines = [];
        this.puntuacion = 0;
        this.crearEscenario(); 
        this.agregarEventos(); 
        this.puntosElement = document.getElementById("puntos"); 

        // EFECTOS DE SONIDO
        this.audio = new Audio("sounds/background-music.mp3"); 
        this.audio.loop = true;  
        this.audio.volume = .1;  
        this.audio.play();
        this.toggleButton = document.getElementById("toggle-sound");
        this.toggleButton.addEventListener("click", () => this.toggleSound());
        this.coinSound = new Audio("sounds/eat.mp3");
        this.coinSound.volume = 0.05;
        this.maletinSound = new Audio("sounds/game-over.mp3");
        this.maletinSound.volume = 0.05;
    }

    // Funcionamiento del boton
    toggleSound() {
        if (this.audio.paused) {
            this.audio.play();  
            this.toggleButton.textContent = "BACKGROUND MUSIC: ON"; 
        } else {
            this.audio.pause();  
            this.toggleButton.textContent = "BACKGROUND MUSIC: OFF"; 
        }
    }

    // Crea el escenario inicial con el personaje y las primeras monedas (comida)
    crearEscenario() {
        this.personaje = new Personaje(); //Creamos un personaje nuevo
        this.container.appendChild(this.personaje.element); //Añadimos el personaje al contenedor del juego
        //Bucle para crear 5 monedas iniciales y añadirlas al game container
        for (let i = 0; i < 5; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }
    }

    // Crea un nuevo maletín y lo agrega al game container
    crearMaletin() {
        const maletin = new Maletin();
        this.maletines.push(maletin);
        this.container.appendChild(maletin.element);
    }

    // Agrega los eventos necesarios (como los movimientos del personaje) con una funcion flecha
    agregarEventos() {
        window.addEventListener("keydown", (e) => this.personaje.mover(e));
        this.checkColisiones(); 
    }

    // Revisa las colisiones entre el personaje y monedas/maletines
    checkColisiones() {
        
        setInterval(() => { // Comprueba cada 100ms si hay colisiones
            this.monedas.forEach((moneda, index) => { // Si hay colision con la moneda, reproduce el efecto de sonido, elimina dicha moneda, genera otra e incrementa el contador +1
                if (this.personaje.colisionaCon(moneda)) {
                    this.coinSound.play();
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    const nuevaMoneda = new Moneda();
                    this.monedas.push(nuevaMoneda);
                    this.container.appendChild(nuevaMoneda.element);
                    this.actualizarPuntuacion(1); 
                }
            });

            this.maletines.forEach((maletin, index) => { //Si hay colision con el maletin, reproduce el efecto de sonido, elimina dicho maletin, saltan las alertas, resetea el contador y devuelva al personaje a la posicion inicial
                if (this.personaje.colisionaCon(maletin)) {
                    this.maletinSound.play();
                    this.container.removeChild(maletin.element);
                    setTimeout(() => {
                        alert("¡Game over!😭");
                        alert("You'll have to try again...😮‍💨");
                        alert("You got this!🫵");
                        
                        // Resetea puntuacion
                        this.puntuacion = 0;
                        this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; 

                        // Devuelve al personaje a la posicion inicial
                        this.personaje.x = 50; 
                        this.personaje.y = 300; 
                        this.personaje.actualizarPosicion(); 

                        // Elimina los maletines
                        this.maletines.forEach((maletin) => {
                            this.container.removeChild(maletin.element);
                        });
                        this.maletines = []; // Vacia el array de maletines
                    }, 100);
                }
            });
        }, 100);
    }

    // Actualiza la puntuacion y crea maletines cada 5 monedas despues de las primeras 10 recolectadas
    actualizarPuntuacion(puntos) {

        // Actualiza puntuación
        this.puntuacion += puntos;
        this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; 

        //Creamos maletines
        if (this.puntuacion >= 10 && (this.puntuacion - 10) % 5 === 0) {
            this.crearMaletin();
        }
    }
}

// Clase del personaje en la que definimos sus características, su salto y su caída
class Personaje {
    constructor() {
        this.x = 50;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        this.velocidad = 10;
        this.saltando = false;
        this.element = document.createElement("div");
        this.element.classList.add("personaje");
        this.actualizarPosicion();
    }

    // Controla el movimiento del personaje con las flechas del teclado
    mover(evento) {
        evento.preventDefault(); 

        let contenedorWidth = document.getElementById("game-container").offsetWidth;  // Usamos el ancho del contenedor para evitar que el personaje salga del ancho del contenedor

        // Presionando la flecha ->, el personaje se mueve a la dcha pero solo si la nueva posicion no supera el ancho del contenedor
        if (evento.key === "ArrowRight" && this.x + this.width + this.velocidad <= contenedorWidth) { 
            this.x += this.velocidad;
        } 
        //Presionando la flecha <-, el personaje se mueve a la izqda pero solo si no se sale del contenedor
        else if (evento.key === "ArrowLeft" && this.x - this.velocidad >= 0) {  
            this.x -= this.velocidad;
        }
        //Presionando la flecha arriba, el personaje se salta
        else if (evento.key === "ArrowUp" && !this.saltando) {
            this.saltar();
        }

        //Actualiza la posicion del personaje
        this.actualizarPosicion();
    }

    // Realiza un salto si el personaje no está saltando ni cayendo
    saltar() {

        // Comprueba si el personaje está cayendo
        if (!this.saltando && (this.puedeSaltarEnAire || !this.cayendo)) {
            //Si está cayendo detenemos la caida antes de iniciar otro salto
            if (this.cayendo) {
                this.puedeSaltarEnAire = false;  
                clearInterval(this.intervaloGravedad); 
                this.intervaloGravedad = null;
                this.cayendo = false;
            }

            this.saltando = true; 
            let alturaMaxima = this.y - 170;

            //Creamos un intervalo para que el personaje salte y mientras se mantenga pulsado, cada 20ms ira aumentando el salto hasta alcanzar su tope
            this.intervaloSalto = setInterval(() => {
                if (this.y > alturaMaxima) {
                    this.y -= 10;
                } else {
                    clearInterval(this.intervaloSalto);
                    this.intervaloSalto = null;
                    this.saltando = false;
                    this.caer();
                }
                this.actualizarPosicion();
            }, 20);
        }
    }

    // Controlamos la caida y nos aseguramos de que el personaje esta en el suelo
    caer() {
        let contenedorHeight = document.getElementById("game-container").offsetHeight;  
        let suelo = contenedorHeight - this.height - 65; // Posición del suelo
    
        this.cayendo = true;
        //Creamos un intervalo para que el personaje caiga cuando haya saltado de forma que simule la gravedad (redondeada a 10)
        this.intervaloGravedad = setInterval(() => {
            //Mientras la posicion y del personaje sea menor que la del suelo  el personaje seguira cayendo
            if (this.y + 10 < suelo) {  
                this.y += 10;
            } else { //Una vez cayo en el suelo
                clearInterval(this.intervaloGravedad);
                this.intervaloGravedad = null;
                this.cayendo = false;
                this.puedeSaltarEnAire = true; 
                this.y = suelo; 
            }
            this.actualizarPosicion();
        }, 20);
    }

    // Actualiza la posicion del personaje en la pantalla
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;  
        this.element.style.top = `${this.y}px`; 
    }

    // Revisa si el personaje ha colisionado con otro objeto
    colisionaCon(objeto) {
        return (
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }
}

// Generacion de monedas de forma aleatoria
class Moneda {
    constructor() {
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 250 + 50;
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("moneda"); 
        this.actualizarPosicion();
    }

    // Actualiza la posicion de la moneda en la pantalla
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;  
        this.element.style.top = `${this.y}px`; 
    }
}

// La clase Maletin a través de la HERENCIA hereda las caracteristicas de la clase Moneda solo que las personaliza
class Maletin extends Moneda {
    constructor() {
        super();
        this.width = 40; 
        this.height = 40;
        this.element.classList.remove("moneda"); 
        this.element.classList.add("maletin");
        this.actualizarPosicion();
    }
}

// Inicializa el juego
const juego = new Game();
