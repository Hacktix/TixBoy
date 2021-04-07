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
var ROM_FILENAME = "";
document.getElementById('rom').addEventListener('change', (e) => {
    if(!e.target.files.length)
        return;
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
        ROM_FILENAME = getRomFilename();
        resetEmulator(new Uint8Array(e.target.result));
    });
    fr.readAsArrayBuffer(e.target.files[0]);
});

function getRomFilename() {
    var fullPath = document.getElementById('rom').value;
    if (fullPath) {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
            filename = filename.substring(1);
        }
        return filename;
    }
    return "";
}

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

const SAVE_BUTTON = document.getElementById("save");
const SAVE_DIV = document.getElementById("savediv");
function enableSavefileDownload(callback = null) {
    if(callback === null)
        SAVE_DIV.style.display = "none";
    else {
        SAVE_DIV.style.display = "inline";
        SAVE_BUTTON.onclick = callback;
    }
}

document.getElementById("load").addEventListener('change', (e) => {
    if(!e.target.files.length)
        return;
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
        savefile = new Uint8Array(e.target.result);
        document.getElementById("loadlabel").innerHTML = "Save File Loaded!";
        setTimeout(() => document.getElementById("loadlabel").innerHTML = "Select Save File", 5000);
    });
    fr.readAsArrayBuffer(e.target.files[0]);
});