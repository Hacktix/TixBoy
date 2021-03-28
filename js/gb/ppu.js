var ppu_state = {
    // Internal Variables
    _cycle: 0,
    _bg_fifo: [],
    _lx: 0,
    _fetcher_x: 0,
    _fetcher_state: 0,
    _fetcher_tileno: null,
    _fetcher_data_lo: null,
    _fetcher_data_hi: null,
    _fetcher_win: false,

    // LCDC
    lcdc: 0,

    // STAT
    _stat: 0,
    _mode: 0,
    get stat() { return this._stat | (this.ly === this.lyc ? 0b100 : 0) | this._mode; },
    set stat(v) { this._stat = (v & 0b111100); },

    // Scrolling
    scx: 0,
    scy: 0,

    // Window
    wy: 0,
    wx: 0,

    // LY
    ly: 0,
    lyc: 0,

    // DMG Palettes
    bgp: 0,
    obp0: 0,
    obp1: 0,
};

function updatePPU() {
    if(ppu_state.lcdc & 0b10000000) {
        tickPPU();
        tickPPU();
        tickPPU();
        tickPPU();
    } else {
        ppu_state._mode = 0;
        ppu_state.ly = 0;
        ppu_state._cycle = 0;
    }
}

var logged = false;

function tickPPU() {
    switch(ppu_state._mode) {
        case 2:
            // OAM Scan Mode
            if(++ppu_state._cycle === 20) {
                ppu_state._mode = 3;
                ppu_state._bg_fifo = [];
                ppu_state._lx = 0;
                ppu_state._fetcher_state = 0;
                ppu_state._fetcher_x = 0;
            }
            break;

        case 3:
            // Drawing Mode

            // Update BG Fetcher
            switch(ppu_state._fetcher_state++) {
                case 0:
                    // Fetching tile number
                    let addr0 = 
                        (ppu_state._fetcher_win ? ((ppu_state.lcdc & 0b1000000) ? 0x1c00 : 0x1800) : ((ppu_state.lcdc & 0b1000) ? 0x1c00 : 0x1800)) // Tilemap Base Address
                        + (32 * Math.floor(ppu_state.ly/8))                                                                                         // LY Offset
                        + ((Math.floor(ppu_state.scx / 8) + ppu_state._fetcher_x) & 0x1f)                                                           // X-Offset
                    ppu_state._fetcher_tileno = vram[addr0];
                    if(ppu_state._fetcher_x === 9 && ppu_state.ly === 16 && !logged)
                        console.log(`Fetched tile no. $${ppu_state._fetcher_tileno.toString(16).padStart(2, '0')} from $${addr0.toString(16).padStart(4, '0')}`);
                    break;
                case 1:
                    // Fetching tile data low
                    let addr1 =
                        ((ppu_state.lcdc & 0b10000) === 0 ? 0x1000 : 0x0000)                                                           // Tile Data Base Address
                        + ((ppu_state.lcdc & 0b10000) === 0 ? (16 * ppu_state._fetcher_tileno) : (16 * e8(ppu_state._fetcher_tileno))) // Tile No. Offset
                        + (2*Math.floor(ppu_state.ly % 8))                                                                             // Pixel-based Line Offset
                    ppu_state._fetcher_data_lo = vram[addr1];
                    if(ppu_state._fetcher_x === 9 && ppu_state.ly === 16 && !logged)
                        console.log(`Fetched tile data low $${ppu_state._fetcher_data_lo.toString(16).padStart(2, '0')} from $${addr1.toString(16).padStart(4, '0')}`);
                    break;
                case 2:
                    let addr2 =
                        ((ppu_state.lcdc & 0b10000) === 0 ? 0x1000 : 0x0000)                                                           // Tile Data Base Address
                        + ((ppu_state.lcdc & 0b10000) === 0 ? (16 * ppu_state._fetcher_tileno) : (16 * e8(ppu_state._fetcher_tileno))) // Tile No. Offset
                        + (2*Math.floor(ppu_state.ly % 8))                                                                             // Pixel-based Line Offset
                        + 1                                                                                                            // High Byte Offset
                    // Fetching tile data high
                    ppu_state._fetcher_data_hi = vram[addr2];
                    if(ppu_state._fetcher_x === 9 && ppu_state.ly === 16 && !logged)
                        console.log(`Fetched tile data high $${ppu_state._fetcher_data_hi.toString(16).padStart(2, '0')} from $${addr2.toString(16).padStart(4, '0')}`);
                    break;
                case 3:
                    break;
                case 4:
                    if(ppu_state._bg_fifo.length === 0) {
                        for(let i = 0x80; i > 0; i >>= 1) {
                            ppu_state._bg_fifo.push({
                                color: ((ppu_state._fetcher_data_lo & i) ? 0b01 : 0b00) | ((ppu_state._fetcher_data_hi & i) ? 0b10 : 0b00)
                            });
                        }
                        ppu_state._fetcher_state = 0;
                        ppu_state._fetcher_x++;
                    } else
                        ppu_state._fetcher_state--;
                    break;
            }

            // Update FIFO
            if(ppu_state._bg_fifo.length) {
                // Shift out pixel
                let px = ppu_state._bg_fifo.shift();
                let color = Math.floor((3 - px.color) * (256/4));
                drawPixel(color, color, color, ppu_state._lx++, ppu_state.ly);
                
                // Check if HBlank should be entered
                if(ppu_state._lx === 160) {
                    ppu_state._mode = 0;
                    ppu_state._cycle = 0;
                }
            }
            ppu_state._cycle++;

            break;

        case 0:
            // HBlank Mode
            if(++ppu_state._cycle === 114) {
                ppu_state._cycle = 0;
                ppu_state._mode = (++ppu_state.ly === 144) ? 1 : 2;
                if(ppu_state._mode === 1)
                    intr_state.if |= 1;
            }
            break;

        case 1:
            // VBlank Mode
            if(++ppu_state._cycle === 114) {
                ppu_state._cycle = 0;
                if(++ppu_state.ly === 154) {
                    ppu_state.ly = 0;
                    ppu_state._mode = 2;
                }
            }
            logged = true;
            break;
    }
}

function drawPixel(r, g, b, x, y) {
    lcd.fillStyle = `rgb(${r},${g},${b})`;
    lcd.fillRect(x, y, 1, 1);
}