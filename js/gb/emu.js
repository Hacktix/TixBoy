// Import required modules
include('gb/mem.js');

// Initialize Canvas
const lcd = document.getElementById('lcd').getContext('2d');
lcd.scale(4, 4);
lcd.fillRect(0, 0, 160, 144);

// Initialize ROM Select Listener
document.getElementById('rom').addEventListener('change', (e) => {
    if(!e.target.files.length)
        return;
    const fr = new FileReader();
    fr.addEventListener('load', (e) => loadRom(new Uint8Array(e.target.result)));
    fr.readAsArrayBuffer(e.target.files[0]);
});