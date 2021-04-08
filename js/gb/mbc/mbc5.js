class MBC5 {

    static init(ram, rom, savefile) {
        MBC5._ramsize = ram;
        MBC5._ram = savefile === null ? window.localStorage.getItem(ROM_FILENAME) === null ? new Array([0, 2048, 8192, 32768, 131072, 65536][ram]).fill(0) : base64ToBytes(window.localStorage.getItem(ROM_FILENAME)) : savefile;
        MBC5._romsize = rom;

        MBC5._romb = 1;
        MBC5._ramb = 0;
        MBC5._enram = false;

        window.onbeforeunload = MBC5.saveLocalStorage;
    }

    static writeRom(addr, val) {
        if(addr < 0x2000)
            MBC5._enram = (val & 0xf) === 0xa;
        else if(addr < 0x3000)
            MBC5._romb = (MBC5._romb & 0b100000000) | val;
        else if(addr < 0x4000)
            MBC5._romb = (MBC5._romb & 0xff) | ((val & 1) << 8);
        else if(addr < 0x6000)
            MBC5._ramb = val & 0xF;
    }

    static readRom(addr) {
        if(addr < 0x4000)
            return rom[addr];
        else
            return rom[(0x4000 * MBC5._romb + addr - 0x4000) % rom.length];
    }

    static readSram(addr) {
        if(!MBC5._enram || MBC5._ram.length === 0) return 0xff;
        return MBC5._ram[(0x2000 * MBC5._ramb + addr - 0xa000) % MBC5._ram.length];
    }

    static writeSram(addr, val) {
        if(!MBC5._enram || MBC5._ram.length === 0) return;
        MBC5._ram[(0x2000 * MBC5._ramb + addr - 0xa000) % MBC5._ram.length] = val;
    }

    static save() { downloadBinary(`${ROM_FILENAME}.sav`, MBC5._ram); }

    static saveLocalStorage() { window.localStorage.setItem(ROM_FILENAME, bytesToBase64(MBC5._ram)); }
}