class MBC1 {

    static init(ram, rom, savefile) {
        MBC1._ramsize = ram;
        MBC1._ram = savefile === null ? window.localStorage.getItem(ROM_FILENAME) === null ? new Array([0, 2048, 8192, 32768][ram]).fill(0) : base64ToBytes(window.localStorage.getItem(ROM_FILENAME)) : savefile;
        MBC1._romsize = rom;

        MBC1._romb = 1;
        MBC1._ramb = 0;
        MBC1._mode = 0;
        MBC1._enram = false;

        window.onbeforeunload = MBC1.saveLocalStorage;
    }

    static writeRom(addr, val) {
        if(addr < 0x2000)
            MBC1._enram = (val & 0xf) === 0xa;
        else if(addr < 0x4000) {
            if((val & 0x1f) === 0)
                MBC1._romb = 1;
            else
                MBC1._romb = val & [0, 0b11, 0b111, 0b1111, 0b11111, 0b11111, 0b11111][MBC1._romsize];
        }
        else if(addr < 0x6000)
            MBC1._ramb = val & 0b11;
        else
            MBC1._mode = val & 1;
    }

    static readRom(addr) {
        if(addr < 0x4000) {
            if(MBC1._mode) {
                let zb = MBC1._romsize < 5 ? 0 : MBC1._romsize === 5 ? ((MBC1._ramb & 1) << 5) : (MBC1._ramb << 5);
                return rom[0x4000 * zb + addr];
            } else
                return rom[addr];
        } else {
            let hb = MBC1._romsize < 5 ? MBC1._romb : MBC1._romsize === 5 ? MBC1._romb + ((MBC1._ramb & 1) << 5) : MBC1._romb + (MBC1._ramb << 5);
            return rom[0x4000 * hb + addr - 0x4000];
        }
    }

    static readSram(addr) {
        if(!MBC1._enram || MBC1._ram.length === 0) return 0xff;
        if(MBC1._ramsize === 3)
            return MBC1._ram[MBC1._mode ? 0x2000 * MBC1._ramb + addr - 0xa000 : addr - 0xa000];
        else
            return MBC1._ram[(addr - 0xa000) % MBC1._ram.length];
    }

    static writeSram(addr, val) {
        if(MBC1._enram && MBC1._ram.length > 0) {
            if(MBC1._ramsize === 3)
                MBC1._ram[MBC1._mode ? 0x2000 * MBC1._ramb + addr - 0xa000 : addr - 0xa000] = val;
            else
                MBC1._ram[(addr - 0xa000) % MBC1._ram.length] = val;
        }
    }

    static save() { downloadBinary(`${ROM_FILENAME}.sav`, MBC1._ram); }

    static saveLocalStorage() { window.localStorage.setItem(ROM_FILENAME, bytesToBase64(MBC1._ram)); }

}