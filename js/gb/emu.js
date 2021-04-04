// Import required modules
include('gb/cpu.js');
include('gb/mem.js');
include('gb/audio.js');

// Initialize offscreen canvas
const tmpcanvas = document.createElement('canvas');
tmpcanvas.width = 160;
tmpcanvas.height = 144;
const tmplcd = tmpcanvas.getContext('2d');

// Initialize Canvas
const lcd = document.getElementById('lcd').getContext('2d', {alpha: false});
lcd.imageSmoothingEnabled = false;
lcd.scale(4, 4);
lcd.fillStyle = 'rgb(156, 160, 76)';
lcd.fillRect(0, 0, 160, 144);

// Initialize ImageData
const lcdData = lcd.createImageData(160, 144);

// Initialize ROM Select Listener
document.getElementById('rom').addEventListener('change', (e) => {
    if(!e.target.files.length)
        return;
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
        resetEmulator(new Uint8Array(e.target.result));
    });
    fr.readAsArrayBuffer(e.target.files[0]);
});

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

// Reset Emulator State
var resettingEmulator = false;
var startedOnce = false;
var waitForShutdownInterval = null;
function resetEmulator(newRom) {
    if(startedOnce === true)
        resettingEmulator = true;
    waitForShutdownInterval = setInterval(waitForShutdown, 50, newRom);
}

function waitForShutdown(newRom) {
    if(resettingEmulator === true && startedOnce === true)
        return;
    clearInterval(waitForShutdownInterval);
    resetMemoryState();
    loadRom(newRom);
    resetAudio();
    resetTimers();
    resetRegistersCPU();
    resetInterruptState();
    resetOAMDMAState();
    resetPPUState();
    startedOnce = true;
    startCPU();
    initAudio();
    document.getElementsByTagName("body")[0].style.backgroundImage = "url('bgon.png')";
}