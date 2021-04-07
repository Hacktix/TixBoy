class MBC2 {

    static init(savefile) {
        MBC2._ram = savefile === null ? new Array(512).fill(0) : savefile;
        MBC2._romb = 1;
        MBC2._enram = false;
    }

    static writeRom(addr, val) {
        if(addr > 0x3fff) return;
        if(addr & 0x100)
            MBC2._romb = (val & 0xf) !== 0 ? (val & 0xf) : 1;
        else
            MBC2._enram = (val & 0xf) === 0x0a;
    }

    static readRom(addr) {
        if(addr < 0x4000)
            return rom[addr];
        else
            return rom[(0x4000 * MBC2._romb + addr - 0x4000) % rom.length];
    }

    static readSram(addr) {
        if(MBC2._enram === true)
            return MBC2._ram[addr & 0x1ff] | 0xf0;
        else
            return 0xff;
    }

    static writeSram(addr, val) {
        if(MBC2._enram === true)
            MBC2._ram[addr & 0x1ff] = val | 0xf0;
    }

    static save() { downloadBinary(`${ROM_FILENAME}.sav`, MBC2._ram); }

}