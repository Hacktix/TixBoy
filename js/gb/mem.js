// Variable readRom function, adjustable for MBCs
var readRom = function(addr) {
    return rom[addr];
};

// Handler function for loading ROMs
var rom = null;
function loadRom(bytes) {
    rom = bytes;
    console.log(`Loaded ${bytes.length} bytes.`);
}

function readByte(addr) {
    if(addr < 0x8000) return readRom(addr);
}