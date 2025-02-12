class Game {
    constructor() {
        this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.puntuacion = 0;
        this.crearEscenario();
        this.agregarEventos();
        this.puntosElement = document.getElementById("puntos");  // Referencia al elemento de puntuación
        this.audio = new Audio("sounds/background-music.mp3"); 
        this.audio.loop = true;  
        this.audio.volume = .5;  
        this.audio.play();
    }

    crearEscenario() {
        this.personaje = new Personaje();
        this.container.appendChild(this.personaje.element);
        for (let i = 0; i < 5; i++) {
            const moneda = new Moneda();
            this.monedas.push(moneda);
            this.container.appendChild(moneda.element);
        }
    }

    agregarEventos() {
        window.addEventListener("keydown", (e) => this.personaje.mover(e));
        this.checkColisiones();
    }

    checkColisiones() {
        setInterval(() => {
            this.monedas.forEach((moneda, index) => {
                if (this.personaje.colisionaCon(moneda)) {
                    // Se detecta la colisión y se elimina la moneda
                    this.container.removeChild(moneda.element);
                    this.monedas.splice(index, 1);
                    

                    const nuevaMoneda = new Moneda();
                    this.monedas.push(nuevaMoneda);
                    this.container.appendChild(nuevaMoneda.element);

                    // Actualizar la puntuación al recoger una moneda
                    this.actualizarPuntuacion(1); 
                   
                }
            });
        }, 100);
    }

    actualizarPuntuacion(puntos) {
        this.puntuacion += puntos;
        this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; 
    }
}

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

    saltar() {
        this.saltando = true;
        let alturaMaxima = this.y - 250;
        const salto = setInterval(() => {
            if (this.y > alturaMaxima) {
                this.y -= 10;  
            } else {
                clearInterval(salto);
                this.caer(); 
            }
            this.actualizarPosicion();
        }, 20);
    }

    caer() {
        const gravedad = setInterval(() => {
            if (this.y < 300) {
                this.y += 10;
            } else {
                clearInterval(gravedad);
                this.saltando = false; 
            }
            this.actualizarPosicion();
        }, 20);
    }

    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;  
        this.element.style.top = `${this.y}px`; 
    }

    colisionaCon(objeto) {
        return (
            this.x < objeto.x + objeto.width &&
            this.x + this.width > objeto.x &&
            this.y < objeto.y + objeto.height &&
            this.y + this.height > objeto.y
        );
    }
}

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

    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;  
        this.element.style.top = `${this.y}px`; 
    }
}

const juego = new Game();
