var input_state = {
    _input_state: 0xff,
    _p1: 0xff,

    get p1() { return (this._p1 & 0xf0) | ((this._p1 & 0b100000) === 0 ? ((this._input_state & 0xf0) >> 4) : (this._input_state & 0xf)); },
    set p1(v) { this._p1 = (v & 0b00110000) | 0b11001111; },
}

function handleKeyDown(e) {
    switch(e.keyCode) {
        case 13: input_state._input_state &= 0b01111111; break;
        case 16: input_state._input_state &= 0b10111111; break;
        case 83: input_state._input_state &= 0b11011111; break;
        case 65: input_state._input_state &= 0b11101111; break;
        case 40: input_state._input_state &= 0b11110111; break;
        case 38: input_state._input_state &= 0b11111011; break;
        case 37: input_state._input_state &= 0b11111101; break;
        case 39: input_state._input_state &= 0b11111110; break;
    }
}

function handleKeyUp(e) {
    switch(e.keyCode) {
        case 13: input_state._input_state |= ~0b01111111; break;
        case 16: input_state._input_state |= ~0b10111111; break;
        case 83: input_state._input_state |= ~0b11011111; break;
        case 65: input_state._input_state |= ~0b11101111; break;
        case 40: input_state._input_state |= ~0b11110111; break;
        case 38: input_state._input_state |= ~0b11111011; break;
        case 37: input_state._input_state |= ~0b11111101; break;
        case 39: input_state._input_state |= ~0b11111110; break;
    }
}