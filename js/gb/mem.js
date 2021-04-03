// Import MBCs
include('gb/mbc/mbc1.js');
include('gb/mbc/mbc3.js');
include('gb/mbc/mbc5.js');

// Bootroms
const bootr_dmg = [0x31, 0xFE, 0xFF, 0x21, 0xFF, 0x9F, 0xAF, 0x32, 0xCB, 0x7C, 0x20, 0xFA, 0x0E, 0x11, 0x21, 0x26, 0xFF, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0x32, 0xE2, 0x0C, 0x3E, 0x77, 0x32, 0xE2, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0xB8, 0x00, 0x1A, 0xCB, 0x37, 0xCD, 0xB8, 0x00, 0x13, 0x7B, 0xFE, 0x34, 0x20, 0xF0, 0x11, 0xCC, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9, 0x21, 0x04, 0x99, 0x01, 0x0C, 0x01, 0xCD, 0xB1, 0x00, 0x3E, 0x19, 0x77, 0x21, 0x24, 0x99, 0x0E, 0x0C, 0xCD, 0xB1, 0x00, 0x3E, 0x91, 0xE0, 0x40, 0x06, 0x10, 0x11, 0xD4, 0x00, 0x78, 0xE0, 0x43, 0x05, 0x7B, 0xFE, 0xD8, 0x28, 0x04, 0x1A, 0xE0, 0x47, 0x13, 0x0E, 0x1C, 0xCD, 0xA7, 0x00, 0xAF, 0x90, 0xE0, 0x43, 0x05, 0x0E, 0x1C, 0xCD, 0xA7, 0x00, 0xAF, 0xB0, 0x20, 0xE0, 0xE0, 0x43, 0x3E, 0x83, 0xCD, 0x9F, 0x00, 0x0E, 0x27, 0xCD, 0xA7, 0x00, 0x3E, 0xC1, 0xCD, 0x9F, 0x00, 0x11, 0x8A, 0x01, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x1B, 0x7A, 0xB3, 0x20, 0xF5, 0x18, 0x49, 0x0E, 0x13, 0xE2, 0x0C, 0x3E, 0x87, 0xE2, 0xC9, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0xC9, 0x78, 0x22, 0x04, 0x0D, 0x20, 0xFA, 0xC9, 0x47, 0x0E, 0x04, 0xAF, 0xC5, 0xCB, 0x10, 0x17, 0xC1, 0xCB, 0x10, 0x17, 0x0D, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0x3C, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x3C, 0x00, 0x54, 0xA8, 0xFC, 0x42, 0x4F, 0x4F, 0x54, 0x49, 0x58, 0x2E, 0x44, 0x4D, 0x47, 0x20, 0x76, 0x31, 0x2E, 0x32, 0x00, 0x3E, 0xFF, 0xC6, 0x01, 0x0B, 0x1E, 0xD8, 0x21, 0x4D, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E, 0x01, 0xE0, 0x50];
var bootrom = bootr_dmg;
var bootrom_mapped = true;

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

    // Determine MBC and update read/write functions accordingly
    switch(rom[0x147]) {
        case 0x01:
        case 0x02:
        case 0x03:
            MBC1.init(rom[0x147] === 0x01 ? 0 : rom[0x149], rom[0x148]);
            readRom = MBC1.readRom;
            readSram = MBC1.readSram;
            writeRom = MBC1.writeRom;
            writeSram = MBC1.writeSram;
            break;
        case 0x0f:
        case 0x10:
        case 0x11:
        case 0x12:
        case 0x13:
            MBC3.init([0x0f, 0x11].includes(rom[0x147]) ? 0 : rom[0x149], rom[0x148]);
            readRom = MBC3.readRom;
            readSram = MBC3.readSram;
            writeRom = MBC3.writeRom;
            writeSram = MBC3.writeSram;
            break;
        case 0x19:
        case 0x1a:
        case 0x1b:
        case 0x1c:
        case 0x1d:
        case 0x1e:
            MBC5.init([0x19, 0x1c].includes(rom[0x147]) ? 0 : rom[0x149], rom[0x148]);
            readRom = MBC5.readRom;
            readSram = MBC5.readSram;
            writeRom = MBC5.writeRom;
            writeSram = MBC5.writeSram;
            break;
    }
}



// Variable readRom function, adjustable for MBCs
var readRom = function(addr) {
    return rom[addr];
};

// Variable readVram function, adjustable for CGB-mode
var readVram = function(addr) {
    return vram[addr-0x8000];
}

// Variable readSram function, adjustable for MBCs
var readSram = function(addr) {
    return 0xff;
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
        case 0xff46: return dma_state._read_data      // DMA
        case 0xff47: return ppu_state.bgp;            // BGP
        case 0xff48: return ppu_state.obp0;           // OBP0
        case 0xff49: return ppu_state.obp1;           // OBP1
        case 0xff4a: return ppu_state.wy;             // WY
        case 0xff4b: return ppu_state.wx;             // WX

        default:     return 0xff;                     // Unmapped Register
    }
}

function readByte(addr) {
    if(addr < 0x100 && bootrom_mapped) return bootrom[addr];
    if(addr < 0x8000) return readRom(addr);           // ROM
    if(addr < 0xa000) return readVram(addr);          // VRAM
    if(addr < 0xc000) return readSram(addr);          // SRAM (TODO: Add Support)
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

// Variable writeSram function, adjustable for MBCs
var writeSram = function(addr, val) { }

// Variable writeWram function, adjustable for CGB-mode
var writeWram = function(addr, val) {
    wram[addr-0xc000] = val;
}

// Fixed function for writing to I/O registers
function writeIO(addr, val) {
    // TODO: Implement I/O Registers
    switch(addr) {
        case 0xff00: input_state.p1 = val; break;          // P1

        // # Timer Registers
        case 0xff04: timer_state.div = val; break;         // DIV
        case 0xff05: timer_state.tima = val; break;        // TIMA
        case 0xff06: timer_state.tma = val; break;         // TMA
        case 0xff07: timer_state.tac = val; break;         // TAC
        case 0xff0f: intr_state.if = val; break;           // IF

        // # APU Registers
        
        // Channel 1
        case 0xff10: audio_state.ch1.nr10 = val; break;
        case 0xff11: audio_state.ch1.nr11 = val; break;
        case 0xff12: audio_state.ch1.nr12 = val; break;
        case 0xff13: audio_state.ch1.nr13 = val; break;
        case 0xff14: audio_state.ch1.nr14 = val; break;

        // Channel 2
        case 0xff16: audio_state.ch2.nr21 = val; break;
        case 0xff17: audio_state.ch2.nr22 = val; break;
        case 0xff18: audio_state.ch2.nr23 = val; break;
        case 0xff19: audio_state.ch2.nr24 = val; break;

        // Control Registers
        case 0xff24: audio_state.nr50 = val; break;
        case 0xff25: audio_state.nr51 = val; break;
        case 0xff26: audio_state.nr52 = val; break;

        // # PPU Registers
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

        // Bootrom
        case 0xff50: bootrom_mapped = false; break;
    }
}

function writeByte(addr, val) {
    if(addr < 0x8000) writeRom(addr, val);                // ROM
    else if(addr < 0xa000) writeVram(addr, val);          // VRAM
    else if(addr < 0xc000) writeSram(addr, val);          // SRAM (TODO: Add Support)
    else if(addr < 0xe000) writeWram(addr, val);          // WRAM
    else if(addr < 0xfe00) writeWram(addr - 0x2000, val); // Echo RAM
    else if(addr < 0xfea0) oam[addr-0xfe00] = val;        // OAM
    else if(addr < 0xfeff) return;                        // "Not Usable" (TODO: Implement model-specific behavior)
    else if(addr < 0xff80) writeIO(addr, val);            // I/O Registers
    else if(addr < 0xffff) hram[addr-0xff80] = val;       // HRAM
    else intr_state.ie = val;                             // IE
}