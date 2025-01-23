const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = {
    x: undefined,
    y: undefined,
    radius: 100
};

// Canvas Größe
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', function() {
    resizeCanvas();
    init(); // Partikel bei Größenänderung neu initialisieren
});

// Partikel-Klasse
class Particle {
    constructor(x, y) {
        // Position - entweder zufällig oder in einem Cluster
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.angle = Math.random() * 360;
        this.sparkleSpeed = 0.02 + Math.random() * 0.02;
        
        // Zufällige Farbe aus Palette
        this.color = this.getRandomColor();
        
        // Cluster-Verhalten
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
        this.clusterRadius = Math.random() * 30 + 10;
    }

    getRandomColor() {
        const colors = [
            `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,  // Weiß
            `rgba(145, 70, 255, ${Math.random() * 0.5 + 0.3})`,   // Lila
            `rgba(200, 180, 255, ${Math.random() * 0.5 + 0.3})`,  // Helllila
            `rgba(70, 140, 255, ${Math.random() * 0.5 + 0.3})`    // Blau
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Cluster-Bewegung
        let angle = this.angle;
        this.x = this.baseX + Math.cos(angle) * this.clusterRadius;
        this.y = this.baseY + Math.sin(angle) * this.clusterRadius;
        
        // Basis-Position langsam bewegen
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        // Bildschirmgrenzen prüfen
        if (this.baseX < 0 || this.baseX > canvas.width) {
            this.speedX *= -1;
        }
        if (this.baseY < 0 || this.baseY > canvas.height) {
            this.speedY *= -1;
        }

        // Maus-Interaktion
        if (mouse.x !== undefined) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                let angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * 2;
                this.y -= Math.sin(angle) * 2;
            }
        }

        this.angle += this.sparkleSpeed;
    }

    draw() {
        let sparkle = Math.abs(Math.sin(this.angle));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * sparkle, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function createCluster(x, y, numParticles) {
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(
            x + (Math.random() * 100 - 50),
            y + (Math.random() * 100 - 50)
        ));
    }
}

// Partikel initialisieren
function init() {
    particles = [];
    
    // Basis-Partikel
    let numberOfParticles = (canvas.width * canvas.height) / 4000; // Mehr Basis-Partikel
    
    // Zufällige Partikel
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
    
    // Cluster erstellen
    const numberOfClusters = 10;
    for (let i = 0; i < numberOfClusters; i++) {
        createCluster(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            15 // Partikel pro Cluster
        );
    }
}

// Animation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    
    connectParticles();
    requestAnimationFrame(animate);
}

// Partikel verbinden
function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50) {  // Kürzere Verbindungslinien für dichtere Cluster
                ctx.beginPath();
                ctx.strokeStyle = `rgba(74, 139, 140, ${0.15 * (1 - distance/50)})`;
                ctx.lineWidth = 0.3;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// Event Listener
window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

// Start
resizeCanvas();
init();
animate(); 