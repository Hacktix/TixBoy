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
    _wly: 0,

    // LCDC
    lcdc: 0,

    // STAT
    _stat: 0,
    _mode: 0,
    get stat() { return this._stat | (this.ly === this.lyc ? 0b100 : 0) | this._mode; },
    set stat(v) { this._stat = (v & 0b1111000); },

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
                ppu_state._fetcher_win = false;
            }
            break;

        case 3:
            // Drawing Mode

            // Update BG Fetcher
            switch(ppu_state._fetcher_state++) {
                case 0:
                    // Fetching tile number
                    let b_addr0 = (ppu_state._fetcher_win ? ((ppu_state.lcdc & 0b1000000) ? 0x1c00 : 0x1800) : ((ppu_state.lcdc & 0b1000) ? 0x1c00 : 0x1800))
                    let addr_offset0 = 
                        + (ppu_state._fetcher_win ? (32 * Math.floor(ppu_state._wly/8)) : (32 * Math.floor(((ppu_state.ly+ppu_state.scy) & 0xff)/8)))  // LY Offset
                        + (ppu_state._fetcher_win ? ppu_state._fetcher_x : ((Math.floor(ppu_state.scx / 8) + ppu_state._fetcher_x) & 0x1f))            // X-Offset
                    let addr0 = b_addr0 + (addr_offset0 & 0x3ff);
                    ppu_state._fetcher_tileno = vram[addr0];
                    break;
                case 1:
                    // Fetching tile data low
                    let addr1 =
                        ((ppu_state.lcdc & 0b10000) === 0 ? 0x1000 : 0x0000)                                                                 // Tile Data Base Address
                        + ((ppu_state.lcdc & 0b10000) ? (16 * ppu_state._fetcher_tileno) : (16 * e8(ppu_state._fetcher_tileno)))             // Tile No. Offset
                        + (ppu_state._fetcher_win ? (2*Math.floor(ppu_state._wly % 8)) : (2*Math.floor((ppu_state.ly + ppu_state.scy) % 8))) // Pixel-based Line Offset
                    ppu_state._fetcher_data_lo = vram[addr1];
                    break;
                case 2:
                    // Fetching tile data high
                    let addr2 =
                        ((ppu_state.lcdc & 0b10000) === 0 ? 0x1000 : 0x0000)                                                                 // Tile Data Base Address
                        + ((ppu_state.lcdc & 0b10000) ? (16 * ppu_state._fetcher_tileno) : (16 * e8(ppu_state._fetcher_tileno)))             // Tile No. Offset
                        + (ppu_state._fetcher_win ? (2*Math.floor(ppu_state._wly % 8)) : (2*Math.floor((ppu_state.ly + ppu_state.scy) % 8))) // Pixel-based Line Offset
                        + 1                                                                                                                  // High Byte Offset
                    ppu_state._fetcher_data_hi = vram[addr2];
                    break;
                case 3:
                    break;
                case 4:
                    if(ppu_state._bg_fifo.length === 0) {
                        for(let i = 0x80; i > 0; i >>= 1) {
                            if(ppu_state.lcdc & 1) 
                                ppu_state._bg_fifo.push({
                                    color: ((ppu_state._fetcher_data_lo & i) ? 0b01 : 0b00) | ((ppu_state._fetcher_data_hi & i) ? 0b10 : 0b00)
                                });
                            else
                                ppu_state._bg_fifo.push({
                                    color: null
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
                if(ppu_state._lx < (ppu_state.scx % 8)) {
                    ppu_state._bg_fifo.shift();
                    ppu_state._lx++;
                }
                else {
                    // Shift out pixel
                    let px = ppu_state._bg_fifo.shift();
                    let color = px.color === null ? 256 : Math.floor((3-((ppu_state.bgp & (0b11 << (2*px.color))) >> (2*px.color)))*(256/3));
                    drawPixel(color, color, color, (ppu_state._lx++ - (ppu_state.scx % 8)), ppu_state.ly);
                    
                    // Check if HBlank should be entered
                    if(ppu_state._lx === (160 + (ppu_state.scx % 8))) {
                        ppu_state._mode = 0;
                        ppu_state._cycle = 0;
                        if(ppu_state.stat & 0b1000)
                            intr_state.if |= 0b10;
                    } else if((ppu_state.lcdc & 0b100000) && !ppu_state._fetcher_win && ppu_state.ly >= ppu_state.wy && (ppu_state._lx - (ppu_state.scx % 8)) >= (ppu_state.wx - 7)) {
                        ppu_state._fetcher_win = true;
                        ppu_state._fetcher_state = 0;
                        ppu_state._fetcher_x = 0;
                        ppu_state._bg_fifo = [];
                    }
                }
            }
            ppu_state._cycle++;

            break;

        case 0:
            // HBlank Mode
            if(++ppu_state._cycle === 114) {
                ppu_state._cycle = 0;
                ppu_state._mode = (++ppu_state.ly === 144) ? 1 : 2;
                if(ppu_state._fetcher_win)
                    ppu_state._wly++;
                if(ppu_state._mode === 2 && (ppu_state.stat & 0b100000))
                    intr_state.if |= 0b10;
                if(ppu_state.ly === ppu_state.lyc && (ppu_state.stat & 0b1000000))
                    intr_state.if |= 0b10;
                if(ppu_state._mode === 1) {
                    intr_state.if |= 1;
                    if(ppu_state.stat & 0b10000)
                        intr_state.if |= 0b10;
                }
            }
            break;

        case 1:
            // VBlank Mode
            if(++ppu_state._cycle === 114) {
                ppu_state._cycle = 0;
                if(++ppu_state.ly === 154) {
                    ppu_state.ly = 0;
                    ppu_state._wly = 0;
                    ppu_state._mode = 2;
                    if(ppu_state.stat & 0b100000)
                        intr_state.if |= 0b10;
                }
                if(ppu_state.ly === ppu_state.lyc && (ppu_state.stat & 0b1000000))
                    intr_state.if |= 0b10;
            }
            break;
    }
}

function drawPixel(r, g, b, x, y) {
    lcd.fillStyle = `rgb(${r},${g},${b})`;
    lcd.fillRect(x, y, 1, 1);
}