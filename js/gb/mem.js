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
    switch(addr) {
        case 0xff0f: return intr_state.if;            // IF
        case 0xff44: return 0x90;                     // LY
        default:     return 0xff;                     // Unmapped Register
    }
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
    return intr_state.ie;                             // IE
}



// Variable writeRom function, adjustable for MBCs
var writeRom = function(addr, val) {
    // Ignore Writes to ROM
}

// Variable writeVram function, adjustable for CGB-mode
var writeVram = function(addr, val) {
    vram[addr-0x8000] = val;
}

// Variable writeWram function, adjustable for CGB-mode
var writeWram = function(addr, val) {
    wram[addr-0xc000] = val;
}

// Fixed function for writing to I/O registers
function writeIO(addr, val) {
    // TODO: Implement I/O Registers
    switch(addr) {
        case 0xff01:
            document.getElementById("dbgout").innerHTML += String.fromCharCode(val);
            break;
        case 0xff0f:                                 // IF
            intr_state.if = val;
            break;
    }
}

function writeByte(addr, val) {
    if(addr < 0x8000) writeRom(addr, val);                // ROM
    else if(addr < 0xa000) writeVram(addr, val);          // VRAM
    else if(addr < 0xc000) return;                        // SRAM (TODO: Add Support)
    else if(addr < 0xe000) writeWram(addr, val);          // WRAM
    else if(addr < 0xfe00) writeWram(addr - 0x1000, val); // Echo RAM
    else if(addr < 0xfea0) oam[addr-0xfe00] = val;        // OAM
    else if(addr < 0xfeff) return;                        // "Not Usable" (TODO: Implement model-specific behavior)
    else if(addr < 0xff80) writeIO(addr, val);            // I/O Registers
    else if(addr < 0xffff) hram[addr-0xff80] = val;       // HRAM
    else intr_state.ie = val;                             // IE
}