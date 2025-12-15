// Variables globales del juego
let score = 0;
let clickPower = 1;
let autoProduction = 0;

// Upgrades: 3 tipos simples (1 manual, 2 automáticos)
const upgrades = [
    { 
        name: 'Multiplicador de Clic', 
        cost: 10, 
        power: 1, 
        type: 'manual',
        owned: 0 
    },
    { 
        name: 'Granja de Monedas', 
        cost: 50, 
        production: 1, 
        type: 'auto',
        owned: 0 
    },
    { 
        name: 'Mina de Oro', 
        cost: 200, 
        production: 5, 
        type: 'auto',
        owned: 0 
    }
];

// Elementos DOM
const scoreElement = document.getElementById('score');
const clickButton = document.getElementById('clickButton');
const upgradesDiv = document.getElementById('upgrades');
const coin = document.getElementById('coin');

// Función para actualizar el contador de monedas
function updateScore() {
    scoreElement.textContent = `Monedas: ${Math.floor(score)}`;
    renderUpgrades();
}

// Función para renderizar upgrades (botones dinámicos)
function renderUpgrades() {
    upgradesDiv.innerHTML = '';
    upgrades.forEach((upgrade, index) => {
        const totalCost = upgrade.cost * (upgrade.owned + 1); // Costo aumenta por compra
        const btn = document.createElement('button');
        btn.textContent = `${upgrade.name} (x${upgrade.owned}) - Costo: ${totalCost} monedas`;
        btn.disabled = score < totalCost;
        if (upgrade.type === 'manual') {
            btn.textContent += ` (+${upgrade.power} por clic)`;
        } else {
            btn.textContent += ` (+${upgrade.production} por seg)`;
        }
        btn.addEventListener('click', () => buyUpgrade(index));
        upgradesDiv.appendChild(btn);
    });
}

// Función para comprar upgrade (placeholder, se expandirá)
function buyUpgrade(index) {
    const upgrade = upgrades[index];
    const totalCost = upgrade.cost * (upgrade.owned + 1);
    if (score >= totalCost) {
        score -= totalCost;
        upgrade.owned++;
        if (upgrade.type === 'manual') {
            clickPower += upgrade.power;
        } else {
            autoProduction += upgrade.production;
        }
        // Aumentar costo para próximas compras
        upgrade.cost = Math.floor(upgrade.cost * 1.15);
        updateScore();
        renderUpgrades();
        saveGame();
    }
}

// Evento de clic principal
clickButton.addEventListener('click', () => {
    score += clickPower;
    coin.classList.add('jump');
    setTimeout(() => coin.classList.remove('jump'), 600);
    updateScore();
    saveGame();
});

// Soporte para teclado (accesibilidad)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickButton.click();
    }
});

// Generación automática de monedas cada segundo
setInterval(() => {
    score += autoProduction;
    updateScore();
    saveGame();
}, 1000);

// Funciones de persistencia con localStorage
function saveGame() {
    const gameData = {
        score,
        clickPower,
        autoProduction,
        upgrades: upgrades.map(u => ({ ...u, cost: u.cost })) // Guardar estado de upgrades
    };
    localStorage.setItem('coinClickerGame', JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem('coinClickerGame');
    if (saved) {
        const data = JSON.parse(saved);
        score = data.score || 0;
        clickPower = data.clickPower || 1;
        autoProduction = data.autoProduction || 0;
        // Restaurar upgrades
        data.upgrades.forEach((savedUpgrade, index) => {
            upgrades[index].owned = savedUpgrade.owned || 0;
            upgrades[index].cost = savedUpgrade.cost || upgrades[index].cost;
        });
        // Recalcular autoProduction basado en owned
        autoProduction = upgrades.reduce((total, u) => {
            if (u.type === 'auto') return total + (u.owned * u.production);
            return total;
        }, 0);
    }
    updateScore();
    renderUpgrades();
}

// Cargar juego al inicio y guardar al cerrar
loadGame();
window.addEventListener('beforeunload', saveGame);

// Inicializar upgrades
renderUpgrades();