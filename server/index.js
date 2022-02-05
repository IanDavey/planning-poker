const { Server } = require('socket.io');
const { version } = require('./package.json');

console.log(`Running server ${version}`);

const io = new Server(5000, { path: '/poker/api' });

const players = new Map();
const selections = new Map();
let revealed = false;

function broadcastState() {
    let total = 0, count = 0;
    for (const [_, selection] of selections.values()) {
        const number = Number.parseFloat(selection);
        if (!isNaN(number)) {
            total += number;
            count++;
        }
    }
    io.emit('state', { version, players: Array.from(players.values()), revealed, selections: Array.from(selections.values()), stats: { mean: total / count } });
}

io.on('connection', socket => {
    let name = null, guid = null;
    socket.on('register', me => {
        console.log(`connect: ${me.name}`);
        name = me.name;
        guid = me.guid;
        players.set(guid, me);
        broadcastState();
    });
    socket.on('reveal', () => {
        revealed = true;
        broadcastState();
    });
    socket.on('reset', () => {
        revealed = false;
        selections.clear();
        broadcastState();
    });
    socket.on('select', value => {
        value = Number.parseFloat(value);
        if (value === undefined) selections.delete(guid);
        else selections.set(guid, [guid, value]);
        broadcastState();
    });
    socket.on('unselect', () => {
        selections.delete(guid);
        broadcastState();
    });
    socket.on('disconnect', () => {
        console.log(`disconnected ${name}`);
        players.delete(guid);
        broadcastState();
    });
});

console.log('listening');
