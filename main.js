// Clase principal del juego, contiene la lógica de puntuación, creación de monedas y maletines
class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.maletines = [];
        this.puntuacion = 0;
        this.crearEscenario(); // Inicializa el escenario, personaje y monedas
        this.agregarEventos();  // Añade los eventos de movimiento y colisiones
        this.puntosElement = document.getElementById("puntos");  // Elemento de visualización de puntuación
        this.audio = new Audio("sounds/background-music.mp3"); 
        this.audio.loop = true;  
        this.audio.volume = .1;  
        this.audio.play();
    }

    // Crea el escenario inicial con el personaje y las primeras monedas
    crearEscenario() {
        this.personaje = new Personaje();
        this.container.appendChild(this.personaje.element);
        for (let i = 0; i < 5; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }
    }

    // Crea un nuevo maletín y lo agrega al contenedor
    crearMaletin() {
        const maletin = new Maletin();
        this.maletines.push(maletin);
        this.container.appendChild(maletin.element);
    }

    // Agrega los eventos necesarios (como los movimientos del personaje)
    agregarEventos() {
        window.addEventListener("keydown", (e) => this.personaje.mover(e));
        this.checkColisiones(); // Llama a la función para comprobar colisiones
    }

    // Revisa las colisiones entre el personaje y monedas/maletines
    checkColisiones() {
        setInterval(() => {
            this.monedas.forEach((moneda, index) => {
                if (this.personaje.colisionaCon(moneda)) {
                    // Si colisiona con una moneda, la elimina y genera una nueva
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    const nuevaMoneda = new Moneda();
                    this.monedas.push(nuevaMoneda);
                    this.container.appendChild(nuevaMoneda.element);
                    this.actualizarPuntuacion(1); // Suma 1 punto por cada moneda
                }
            });

            this.maletines.forEach((maletin, index) => {
                if (this.personaje.colisionaCon(maletin)) {
                    // Si colisiona con un maletín, lo elimina y suma 5 puntos
                    this.container.removeChild(maletin.element);
                    this.maletines.splice(index, 1);
                    this.actualizarPuntuacion(5); // Suma 5 puntos por cada maletín
                }
            });
        }, 100);
    }

    // Actualiza la puntuación y crea maletines cada 5 monedas después de las primeras 10
    actualizarPuntuacion(puntos) {
        this.puntuacion += puntos;
        this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; 

        // Si el jugador ha recogido 10 monedas, crea un maletín cada 5 monedas
        if (this.puntuacion >= 10 && (this.puntuacion - 10) % 5 === 0) {
            this.crearMaletin();
        }
    }
}

// Clase del personaje, maneja su movimiento, salto y caída
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

    // Maneja el movimiento del personaje con las flechas del teclado
    mover(evento) {
        evento.preventDefault(); 

        let contenedorWidth = document.getElementById("game-container").offsetWidth;  

        if (evento.key === "ArrowRight" && this.x + this.width + this.velocidad <= contenedorWidth) {
            this.x += this.velocidad;
        } 
        else if (evento.key === "ArrowLeft" && this.x - this.velocidad >= 0) { 
            this.x -= this.velocidad;
        }
        
        else if (evento.key === "ArrowUp" && !this.saltando) {
            this.saltar();
        }

        this.actualizarPosicion();
    }

    // Realiza un salto si el personaje no está saltando ni cayendo
    saltar() {
        if (!this.saltando && (this.puedeSaltarEnAire || !this.cayendo)) {
            if (this.cayendo) {
                this.puedeSaltarEnAire = false;  
                clearInterval(this.intervaloGravedad); 
                this.intervaloGravedad = null;
                this.cayendo = false;
            }

            this.saltando = true;
            let alturaMaxima = this.y - 170;

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

    // Maneja la caída del personaje cuando no está saltando
    caer() {
        let contenedorHeight = document.getElementById("game-container").offsetHeight;  
        let suelo = contenedorHeight - this.height -65; // Posición del suelo
    
        this.cayendo = true;
        this.intervaloGravedad = setInterval(() => {
            if (this.y + 10 < suelo) {
                this.y += 10;
            } else {
                clearInterval(this.intervaloGravedad);
                this.intervaloGravedad = null;
                this.cayendo = false;
                this.puedeSaltarEnAire = true; 
                this.y = suelo; // Asegura que el personaje quede en el suelo
            }
            this.actualizarPosicion();
        }, 20);
    }

    // Actualiza la posición del personaje en la pantalla
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

// Clase para las monedas, se generan de manera aleatoria en el juego
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

    // Actualiza la posición de la moneda en la pantalla
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;  
        this.element.style.top = `${this.y}px`; 
    }
}

// Clase que hereda de Moneda y representa el maletín, tiene tamaño diferente y clase distinta
class Maletin extends Moneda {
    constructor() {
        super();
        this.width = 40; // Tamaño del maletín
        this.height = 40;
        this.element.classList.remove("moneda"); // Remueve la clase "moneda"
        this.element.classList.add("maletin"); // Añade la clase "maletin"
        this.actualizarPosicion();
    }
}

// Inicializa el juego
const juego = new Game();
