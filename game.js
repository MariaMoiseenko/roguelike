window.addEventListener('DOMContentLoaded', function () {
    var game = new Game();
    game.init();
});

class Game {
    constructor() {
        this.WIDTH = 40;
        this.HEIGHT = 24;
        this.TILE_SIZE = 40;
        this.map = [];
        this.player = { x: 0, y: 0, hp: 100, maxHP: 100, strength: 20 };
        this.enemies = [];
        this.items = [];
    }
    init() {
        this.generateMap();
        this.placeRooms();
        this.placeCorridors();
        this.placePlayer();
        this.placeEnemies();
        this.placeItems();
        this.draw(); 
        this.setupControls();
        this.moveEnemies();
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
        document.getElementById('win-restart-btn').addEventListener('click', () => {
            location.reload();
        });
    }
    

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateMap() {
        for (let y = 0; y < this.HEIGHT; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.WIDTH; x++) {
                this.map[y][x] = '#'; 
            }
        }
    }

    placeRooms() {
        const roomCount = this.getRandom(5, 10);
        for (let i = 0; i < roomCount; i++) {
            const w = this.getRandom(3, 8);
            const h = this.getRandom(3, 8);
            const x = this.getRandom(1, this.WIDTH - w - 1);
            const y = this.getRandom(1, this.HEIGHT - h - 1);

            for (let dy = 0; dy < h; dy++) {
                for (let dx = 0; dx < w; dx++) {
                    this.map[y + dy][x + dx] = '.' 
                }
            }
        }
    }

    placeCorridors() {
        const corridorsHorizontalCount = this.getRandom(3, 5);
        const corridorsVerticalCount = this.getRandom(3, 5);
        for (let i = 0; i < corridorsHorizontalCount; i++) {
            const y = this.getRandom(1, this.HEIGHT - 2);
            for (let x = 0; x < this.WIDTH; x++) {
                this.map[y][x] = '.';
            }
        }
        for (let i = 0; i < corridorsVerticalCount; i++) {
            const x = this.getRandom(1, this.WIDTH - 2);
            for (let y = 0; y < this.HEIGHT; y++) {
                this.map[y][x] = '.';
            }
        }
    }

    placePlayer() {
        while (true) {
            const {x, y} = this.placeRandomTile();   
            if (this.map[y][x] === '.') {
                this.player.x = x;
                this.player.y = y;
                break;
            }
        }
    }

    placeEnemies() {
        for (let i = 0; i < 10; i++) {
            const {x, y} = this.placeRandomTile();  
            this.enemies.push({ id: i, x, y, hp: 30, strength: 10 });
        }
    }

    placeItems() {
        for (let i = 0; i < 2; i++) {
            this.placeItem('sword');
        }
        for (let i = 0; i < 10; i++) {
            this.placeItem('potion');
        }
    }

    placeItem(type) {
        const {x, y} = this.placeRandomTile();  
        this.items.push({ type, x, y });
    }

    draw() {
        let field = document.querySelector('.field');
        field.innerHTML = '';
        this.map.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const top = rowIndex * this.TILE_SIZE;
                const left = columnIndex * this.TILE_SIZE;
                switch (cell) {
                    case ".": {
                        field.insertAdjacentHTML('afterbegin', `
                        <div class="tile" style="top: ${top}px; left: ${left}px"></div>
                        `)
                        break;
                    }
                    case "#": {
                        field.insertAdjacentHTML('afterbegin', `
                        <div class="tile tileW" style="top: ${top}px; left: ${left}px"></div>
                        `)
                        break;
                    }
                }
            })
        })
        const top = this.player.y * this.TILE_SIZE;
        const left = this.player.x * this.TILE_SIZE;
        const strength = (this.player.strength / 100) * this.TILE_SIZE;
        const hp = (this.player.hp / this.player.maxHP) * this.TILE_SIZE;
        field.insertAdjacentHTML('afterbegin', `
                        <div class="tile tileP" style="top: ${top}px; left: ${left}px">
                            <div class="strength" style="width:${strength}px; top: -10px; left: 0;"></div>
                            <div class="health" style="width:${hp}px top: -5px; left: 0;"></div>
                        </div>
        `)

        this.enemies.forEach((enemy) => {
            const top = enemy.y * this.TILE_SIZE;
            const left = enemy.x * this.TILE_SIZE;
            field.insertAdjacentHTML('afterbegin', `
                <div id="enemy-${enemy.id}" class="tile tileE" style="top: ${top}px; left: ${left}px"></div>
            `)
        })

        this.items.forEach((item) => {
            const top =item.y * this.TILE_SIZE;
            const left = item.x * this.TILE_SIZE;
            if(item.type === 'sword'){
            field.insertAdjacentHTML('afterbegin', `
            <div class="tile tileSW" style="top: ${top}px; left: ${left}px"></div>
        `)} else if(item.type === 'potion'){

        field.insertAdjacentHTML('afterbegin', `
        <div class="tile tileHP" style="top: ${top}px; left: ${left}px"></div>
`)}})

    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            let dx = 0, dy = 0;
            switch (key) {
                case "w": {
                    dy = -1;
                    break;
                }
                case "s": {
                    dy = 1;
                    break;
                }
                case "a": {
                    dx = -1;
                    break;
                }
                case "d": {
                    dx = 1;
                    break;
                }
                case " ": {
                    e.preventDefault();
                    this.attackEnemy();
                    break;
                }
            }

            this.movePlayer(dx, dy);
            this.checkPickup();
        })
    }

    movePlayer(dx, dy) {
        if (dx !== 0 || dy !== 0) {
                const nx = this.player.x + dx;
                const ny = this.player.y + dy;
                if (this.map[ny]?.[nx] === '.') {
                    this.player.x = nx;
                    this.player.y = ny;
                    const top = this.player.y * this.TILE_SIZE;
                    const left = this.player.x * this.TILE_SIZE;
                    document.querySelector('.tile.tileP').style.top = `${top}px`;
                    document.querySelector('.tile.tileP').style.left = `${left}px`;
                    this.calculateDamage();
                    
                }
            }
    }

    attackEnemy(){
        this.enemies.forEach((enemy) => {
            let xDistance = this.player.x - enemy.x;
            let yDistance = this.player.y - enemy.y;
            if (Math.abs(xDistance) + Math.abs(yDistance) === 1) {
                enemy.hp -= this.player.strength;
            }
        });

        this.enemies = this.enemies.filter((enemy) => {
            const shouldBeDeleted = enemy.hp <= 0;

            if (shouldBeDeleted) {
                document.querySelector(`#enemy-${enemy.id}`).remove();
            }
            
            return !shouldBeDeleted;
        })
    }

    placeRandomTile(){
        let x, y;
        do {
            x= this.getRandom(0, this.WIDTH - 1);
            y = this.getRandom(0, this.HEIGHT - 1);
        } while (this.map[y][x] !== '.');
        return {x, y};
    }

    calculateDamage() {
        this.enemies.forEach((enemy) => {
            let xDistance = this.player.x - enemy.x;
            let yDistance = this.player.y - enemy.y;
            if (Math.abs(xDistance) + Math.abs(yDistance) === 0) {
                this.player.hp -= enemy.strength;
                if (this.player.hp < 0) this.player.hp = 0;
                const playerTile = document.querySelector('.tile.tileP');
                if(playerTile){
                    const healthBar = playerTile.querySelector('.health');
                    if(healthBar){
                        const hp = ((this.player.hp / this.player.maxHP) * this.TILE_SIZE);
                        healthBar.style.width = `${hp}px`;
                    }
                }
            }
        });
        if (this.player.hp <= 0) {
            document.querySelector(`.tile.tileP`)?.remove();
            document.querySelector('.game-over').classList.remove('hidden');
        }
        if (this.enemies.length === 0) {
            const winScreen = document.querySelector('.game-win');
            winScreen.classList.remove('hidden');
          }
    }

    moveEnemies(){
        setInterval(() => {
            this.enemies.forEach((enemy) => {
                const direction = this.getRandom(0, 1) ? 'horizontal' : 'vertical';
                const offset = this.getRandom(0, 1) ? 1 : -1;

                const dx = direction === 'horizontal' ? offset : 0;
                const dy = direction === 'vertical' ? offset : 0;

                const nx = enemy.x + dx;
                const ny = enemy.y + dy;
                if (this.map[ny]?.[nx] === '.') {
                    enemy.x = nx;
                    enemy.y = ny;
                    const top = enemy.y * this.TILE_SIZE;
                    const left = enemy.x * this.TILE_SIZE;
                    document.querySelector(`#enemy-${enemy.id}`).style.top = `${top}px`;
                    document.querySelector(`#enemy-${enemy.id}`).style.left = `${left}px`;
                    this.calculateDamage();
                }
            })
        }, 1000)
    }


      checkPickup() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item.x === this.player.x && item.y === this.player.y) {
                const inventory = document.querySelector('.inventory');
                const playerTile = document.querySelector('.tile.tileP'); 
    
                if (item.type === 'potion') {
                    this.player.hp = Math.min(100, this.player.hp + 30);
                    if (playerTile) {
                        const healthBar = playerTile.querySelector('.health');
                        if (healthBar) {
                            healthBar.style.width = `${(this.player.hp / this.player.maxHP) * this.TILE_SIZE}px`;
                        }
                    }
    
                    inventory.insertAdjacentHTML('afterbegin', `
                        <div class="tile tileHP"></div>
                    `);
                }
    
                if (item.type === 'sword') {
                    this.player.strength += 20;
                    if (playerTile) {
                        const strengthBar = playerTile.querySelector('.strength');
                        if (strengthBar) {
                            strengthBar.style.width = `${(this.player.strength / 100) * this.TILE_SIZE}px`;
                        }
                    }
    
                    inventory.insertAdjacentHTML('afterbegin', `
                        <div class="tile tileSW"></div>
                    `);
                }
    
                this.items.splice(i, 1);
                this.draw(); 
            }
        }
    }
    }

