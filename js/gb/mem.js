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
        case 0xff00: return input_state.p1;           // P1

        // Timer Registers
        case 0xff04: return timer_state.div;          // DIV
        case 0xff05: return timer_state.tima;         // TIMA
        case 0xff06: return timer_state.tma;          // TMA
        case 0xff07: return timer_state.tac;          // TAC

        case 0xff0f: return intr_state.if;            // IF

        // PPU Registers
        case 0xff40: return ppu_state.lcdc;           // LCDC
        case 0xff41: return ppu_state.stat;           // STAT
        case 0xff42: return ppu_state.scy;            // SCY
        case 0xff43: return ppu_state.scx;            // SCX
        case 0xff44: return ppu_state.ly;             // LY
        case 0xff45: return ppu_state.lyc;            // LYC
        case 0xff47: return ppu_state.bgp;            // BGP
        case 0xff48: return ppu_state.obp0;           // OBP0
        case 0xff49: return ppu_state.obp1;           // OBP1
        case 0xff4a: return ppu_state.wy;             // WY
        case 0xff4b: return ppu_state.wx;             // WX

        default:     return 0xff;                     // Unmapped Register
    }
}

function readByte(addr) {
    if(addr < 0x8000) return readRom(addr);           // ROM
    if(addr < 0xa000) return readVram(addr);          // VRAM
    if(addr < 0xc000) return 0xff;                    // SRAM (TODO: Add Support)
    if(addr < 0xe000) return readWram(addr);          // WRAM
    if(addr < 0xfe00) return readWram(addr - 0x2000); // Echo RAM
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
        case 0xff00: input_state.p1 = val; break;          // P1

        // Timer Registers
        case 0xff04: timer_state.div = val; break;         // DIV
        case 0xff05: timer_state.tima = val; break;        // TIMA
        case 0xff06: timer_state.tma = val; break;         // TMA
        case 0xff07: timer_state.tac = val; break;         // TAC
        case 0xff0f: intr_state.if = val; break;           // IF

        // PPU Registers
        case 0xff40: ppu_state.lcdc = val; break;          // LCDC
        case 0xff41: ppu_state.stat = val; break;          // STAT
        case 0xff42: ppu_state.scy = val; break;           // SCY
        case 0xff43: ppu_state.scx = val; break;           // SCX
        case 0xff45: ppu_state.lyc = val; break;           // LYC
        case 0xff46: dma_state.dma_queue = val; break;     // DMA
        case 0xff47: ppu_state.bgp = val; break;           // BGP
        case 0xff48: ppu_state.obp0 = val; break;          // OBP0
        case 0xff49: ppu_state.obp1 = val; break;          // OBP1
        case 0xff4a: ppu_state.wy = val; break;            // WY
        case 0xff4b: ppu_state.wx = val; break;            // WX
    }
}

function writeByte(addr, val) {
    if(addr < 0x8000) writeRom(addr, val);                // ROM
    else if(addr < 0xa000) writeVram(addr, val);          // VRAM
    else if(addr < 0xc000) return;                        // SRAM (TODO: Add Support)
    else if(addr < 0xe000) writeWram(addr, val);          // WRAM
    else if(addr < 0xfe00) writeWram(addr - 0x2000, val); // Echo RAM
    else if(addr < 0xfea0) oam[addr-0xfe00] = val;        // OAM
    else if(addr < 0xfeff) return;                        // "Not Usable" (TODO: Implement model-specific behavior)
    else if(addr < 0xff80) writeIO(addr, val);            // I/O Registers
    else if(addr < 0xffff) hram[addr-0xff80] = val;       // HRAM
    else intr_state.ie = val;                             // IE
}