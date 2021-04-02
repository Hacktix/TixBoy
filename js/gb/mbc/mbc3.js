class MBC3 {

    static init(ram, rom) {
        MBC3._ramsize = ram;
        MBC3._ram = new Array([0, 2048, 8192, 32768, 131072, 65536][ram]).fill(0);
        MBC3._romsize = rom;

        MBC3._romb = 1;
        MBC3._ramb = 0;
        MBC3._enram = false;
    }

    static writeRom(addr, val) {
        if(addr < 0x2000)
            MBC3._enram = (val & 0xf) === 0xa;
        else if(addr < 0x4000)
            MBC3._romb = val ? val & 0x7f : 1;
        else if(addr < 0x6000) {
            if(val < 4)
                MBC3._ramb = val & 0b11;
            else {
                // TODO: Latch RTC Register to SRAM addresses
            }
        }
    }

    static readRom(addr) {
        if(addr < 0x4000)
            return rom[addr];
        else
            return rom[(0x4000 * MBC3._romb + addr - 0x4000) % rom.length];
    }

    static readSram(addr) {
        if(!MBC3._enram || MBC3._ram.length === 0) return 0xff;
        return MBC3._ram[(0x2000 * MBC3._ramb + addr - 0xa000) % MBC3._ram.length];
    }

    static writeSram(addr, val) {
        if(!MBC3._enram || MBC3._ram.length === 0) return;
        MBC3._ram[(0x2000 * MBC3._ramb + addr - 0xa000) % MBC3._ram.length] = val;
    }
}