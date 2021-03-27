// Variables for memory sections (ROM, RAM, etc.)
var rom = null;
var vram = new Array(0x2000).fill(0);
var wram = new Array(0x2000).fill(0);
var oam = new Array(0xa0).fill(0);
var hram = new Array(0x7f).fill(0);

// Handler function for loading ROMs
function loadRom(bytes) {
    rom = bytes;
    console.log(`Loaded ${bytes.length} bytes.`);
}

// Variable readRom function, adjustable for MBCs
var readRom = function(addr) {
    return rom[addr];
};

// Variable readVram function, adjustable for CGB-mode
var readVram = function(addr) {
    return vram[addr-0x8000];
}

// Variable readWram function, adjustable for CGB-mode
var readWram = function(addr) {
    return wram[addr-0xc000];
}

// Fixed function for reading from I/O registers
function readIO(addr) {
    // TODO: Implement I/O Registers
    return 0xff;
}

function readByte(addr) {
    if(addr < 0x8000) return readRom(addr);           // ROM
    if(addr < 0xa000) return readVram(addr);          // VRAM
    if(addr < 0xc000) return 0xff;                    // SRAM (TODO: Add Support)
    if(addr < 0xe000) return readWram(addr);          // WRAM
    if(addr < 0xfe00) return readWram(addr - 0x1000); // Echo RAM
    if(addr < 0xfea0) return oam[addr-0xfe00];        // OAM
    if(addr < 0xfeff) return 0xff;                    // "Not Usable" (TODO: Implement model-specific behavior)
    if(addr < 0xff80) return readIO(addr);            // I/O Registers
    if(addr < 0xffff) return hram[addr-0xff80];       // HRAM
}