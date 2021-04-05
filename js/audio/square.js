const COEFFICIENT_MAX_VAL = 128;
const COEFFICIENT_INC = 1;

function createSquareWave(duty) {
    let d = duty;
    let cbuf = [];
    for(let i = 0; i < COEFFICIENT_MAX_VAL; i += COEFFICIENT_INC) {
        cbuf.push(d*Math.sinc(i*d))
    }
    let imag = new Float32Array(cbuf);
    let real = new Float32Array(cbuf.length);
    return audioCtx.createPeriodicWave(imag, real);
}

const SQUARE_WAVES = [
    createSquareWave(0.125),
    createSquareWave(0.25),
    createSquareWave(0.5),
    createSquareWave(0.75),
];