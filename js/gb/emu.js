// Import required modules
include('gb/cpu.js');
include('gb/mem.js');

// Initialize Canvas
const lcd = document.getElementById('lcd').getContext('2d', {alpha: false});
lcd.scale(4, 4);
lcd.fillStyle = 'rgb(156, 160, 76)';
lcd.fillRect(0, 0, 160, 144);

// Initialize ROM Select Listener
document.getElementById('rom').addEventListener('change', (e) => {
    if(!e.target.files.length)
        return;
    const fr = new FileReader();
    fr.addEventListener('load', (e) => {
        loadRom(new Uint8Array(e.target.result));
        startCPU();
        document.getElementsByTagName("body")[0].style.backgroundImage = "url('bgon.png')";
        console.log(e)
    });
    fr.readAsArrayBuffer(e.target.files[0]);
});

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;