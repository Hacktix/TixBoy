class MBC3 {

    static init(ram, rom, savefile) {
        MBC3._ramsize = ram;
        MBC3._ram = savefile === null ? new Array([0, 2048, 8192, 32768, 131072, 65536][ram]).fill(0) : savefile;
        MBC3._romsize = rom;

        MBC3._romb = 1;
        MBC3._ramb = 0;
        MBC3._enram = false;

        MBC3._ramregion = 0;
        MBC3._rtc = {
            s: 0,
            m: 0,
            h: 0,
            dl: 0,
            dh: 0,

            _latch_state: 0,
            _latch_val: null,
            _latch_reg: null,
        };
        MBC3._rtc_bitmasks = {
            s:  0b00111111,
            m:  0b00111111,
            h:  0b00011111,
            dl: 0b11111111,
            dh: 0b11000001,
        }
    }

    static writeRom(addr, val) {
        if(addr < 0x2000)
            MBC3._enram = (val & 0xf) === 0xa;
        else if(addr < 0x4000)
            MBC3._romb = val ? val & 0x7f : 1;
        else if(addr < 0x6000) {
            if(val < 4) {
                MBC3._ramb = val & 0b11;
                MBC3._ramregion = 0;
            }
            else if(val >= 0x8 && val <= 0xc) {
                MBC3._rtc._latch_reg = ["s", "m", "h", "dl", "dh"][val - 0x8];
                MBC3._ramregion = 1;
            }
        } else {
            switch (MBC3._rtc._latch_state) {
                case 0:
                    if(val === 0)
                        MBC3._rtc._latch_state = 1;
                    break;
                case 1:
                    if(val === 1 && MBC3._rtc._latch_reg !== null) {
                        MBC3.updateRTC();
                        MBC3._rtc._latch_val = null;
                        MBC3._rtc._latch_val = MBC3._rtc;
                    }
                    MBC3._rtc._latch_state = 0;
                    break;
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
        if(MBC3._ramregion === 0) {
            if(!MBC3._enram || MBC3._ram.length === 0) return 0xff;
            return MBC3._ram[(0x2000 * MBC3._ramb + addr - 0xa000) % MBC3._ram.length];
        } else {
            MBC3.updateRTC();
            return MBC3._rtc._latch_val === null ? 0xff : MBC3._rtc._latch_val[MBC3._rtc._latch_reg];
        }
    }

    static writeSram(addr, val) {
        if(MBC3._ramregion === 0) {
            if(!MBC3._enram || MBC3._ram.length === 0) return;
            MBC3._ram[(0x2000 * MBC3._ramb + addr - 0xa000) % MBC3._ram.length] = val;
        } else {
            MBC3.updateRTC();
            if(MBC3._rtc._latch_val !== null) {
                MBC3._rtc[MBC3._rtc._latch_reg] = MBC3._rtc._latch_val[MBC3._rtc._latch_reg] = (val & MBC3._rtc_bitmasks[MBC3._rtc._latch_reg]);
                switch(MBC3._rtc._latch_reg) {
                    case "dh":
                        if((MBC3._rtc.dh & (1 << 6)) !== 0)
                            count_cycles = false;
                        else
                            count_cycles = true;
                        break;
                    case "s":
                        CYCLE_COUNT = 0;
                        break;
                }
            }
        }
    }

    static updateRTC() {
        if((MBC3._rtc.dh & (1 << 6)) === 0) {
            while(CYCLE_COUNT >= (4194304/4)) {
                CYCLE_COUNT -= (4194304/4);
                if((MBC3._rtc.s = ((MBC3._rtc.s + 1) & MBC3._rtc_bitmasks.s)) === 60) {
                    MBC3._rtc.s = 0;
                    if((MBC3._rtc.m = ((MBC3._rtc.m + 1) & MBC3._rtc_bitmasks.m)) === 60) {
                        MBC3._rtc.m = 0;
                        if((MBC3._rtc.h = ((MBC3._rtc.h + 1) & MBC3._rtc_bitmasks.h)) === 24) {
                            MBC3._rtc.h = 0;
                            if(++MBC3._rtc.dl === 0x100) {
                                MBC3._rtc.dl = 0;
                                if((MBC3._rtc.dh & 1) === 1) {
                                    MBC3._rtc.dh &= 0xfe;
                                    MBC3._rtc.dh |= (1 << 7);
                                } else
                                    MBC3._rtc.dh++;
                            }
                        }
                    }
                }
            }
        }
    }

    static save() { downloadBinary(`${ROM_FILENAME}.sav`, MBC3._ram); }
}