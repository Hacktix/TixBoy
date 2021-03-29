var ppu_state = {
    // Internal Variables
    _cycle: 0,
    _bg_fifo: [],
    _sprite_fifo: [],
    _lx: 0,
    _fetcher_x: 0,
    _fetcher_state: 0,
    _fetcher_tileno: null,
    _fetcher_data_lo: null,
    _fetcher_data_hi: null,
    _fetcher_win: false,
    _wly: 0,
    _last_stat_state: false,
    _sprite_buffer: [],
    _fetcher_sprites: false,
    _fetcher_sprites_state: 0,
    _fetcher_sprites_sprite: null,
    _fetcher_sprites_data_lo: null,
    _fetcher_sprites_data_hi: null,

    // LCDC
    lcdc: 0x80,

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

                // Buffer sprites for scanline
                ppu_state._sprite_buffer = [];
                for(let i = 0; i < 0xa0 && ppu_state._sprite_buffer.length < 10; i += 4) {
                    if(oam[i+1] && (ppu_state.ly + 16) >= oam[i] && (ppu_state.ly + 16) < (oam[i] + ((ppu_state.lcdc & 0b100) ? 16 : 8)))
                        ppu_state._sprite_buffer.push({
                            y: oam[i],
                            x: oam[i+1],
                            tile: (ppu_state.lcdc & 0b100)
                                    ? ((ppu_state.ly + 16) < (oam[i] + 8)
                                        ? (oam[i+3] & 0b1000000)
                                            ? (oam[i+2] | 0x01)
                                            : (oam[i+2] & 0xfe)
                                        : (oam[i+3] & 0b1000000)
                                            ? (oam[i+2] & 0xfe)
                                            : (oam[i+2] | 0x01)
                                    )
                                    : oam[i+2],
                            attr: oam[i+3]
                        });
                }
            }
            break;

        case 3:
            // Drawing Mode

            // Check if sprites need to be fetched
            if(!ppu_state._fetcher_sprites && (ppu_state.lcdc & 0b10)) {
                let render_sprite = ppu_state._sprite_buffer.findIndex((spr) => spr.x <= (ppu_state._lx + 8));
                if(render_sprite !== -1) {
                    ppu_state._fetcher_sprites_sprite = ppu_state._sprite_buffer.splice(render_sprite, 1)[0];
                    ppu_state._fetcher_sprites_state = 0;
                    ppu_state._fetcher_sprites = true;
                }
            }

            // Update Sprite Fetcher
            if(ppu_state._fetcher_sprites) {
                switch(ppu_state._fetcher_sprites_state++) {
                    case 0:
                        break;
                    case 1:
                        // Fetching tile data low
                        let spr_addr1 =
                            16 * ppu_state._fetcher_sprites_sprite.tile                   // Tile No. Offset
                            + ((ppu_state._fetcher_sprites_sprite.attr & 0b1000000)
                                ? (2*((ppu_state.lcdc & 0b100) ? 15 : 7)) - 2*(ppu_state.ly-(ppu_state._fetcher_sprites_sprite.y-16))   // Pixel-based Line Offset (Y-Flip)
                                : 2*(ppu_state.ly-(ppu_state._fetcher_sprites_sprite.y-16)))                                            // Pixel-based Line Offset (No Y-Flip)
                        ppu_state._fetcher_sprites_data_lo = vram[spr_addr1];
                        break;
                    case 2:
                        // Fetching tile data low
                        let spr_addr2 =
                            16 * ppu_state._fetcher_sprites_sprite.tile                   // Tile No. Offset
                            + ((ppu_state._fetcher_sprites_sprite.attr & 0b1000000)
                                ? (2*((ppu_state.lcdc & 0b100) ? 15 : 7)) - 2*(ppu_state.ly-(ppu_state._fetcher_sprites_sprite.y-16))   // Pixel-based Line Offset (Y-Flip)
                                : 2*(ppu_state.ly-(ppu_state._fetcher_sprites_sprite.y-16)))                                            // Pixel-based Line Offset (No Y-Flip)
                            + 1                                                           // High byte offset
                        ppu_state._fetcher_sprites_data_hi = vram[spr_addr2];
                        break;
                    case 3:
                        break;
                    case 4:
                        if((ppu_state._fetcher_sprites_sprite.attr & 0b100000)) {
                            for(let i = 0x1, j=0; i > 0; i <<= 1, j++) {
                                let px = {
                                    color: ((ppu_state._fetcher_sprites_data_lo & i) ? 0b01 : 0b00) | ((ppu_state._fetcher_sprites_data_hi & i) ? 0b10 : 0b00),
                                    palette: (ppu_state._fetcher_sprites_sprite.attr & 0b10000) >> 4
                                };
                                if((ppu_state._fetcher_sprites_sprite.x + j) < 8)
                                    continue;
                                if(ppu_state._sprite_fifo[j]) {
                                    if(ppu_state._sprite_fifo[j].color === 0)
                                        ppu_state._sprite_fifo[j] = px;
                                } else
                                    ppu_state._sprite_fifo.push(px)
                            }
                        } else {
                            for(let i = 0x80, j=0; i > 0; i >>= 1, j++) {
                                let px = {
                                    color: ((ppu_state._fetcher_sprites_data_lo & i) ? 0b01 : 0b00) | ((ppu_state._fetcher_sprites_data_hi & i) ? 0b10 : 0b00),
                                    palette: (ppu_state._fetcher_sprites_sprite.attr & 0b10000) >> 4
                                };
                                if((ppu_state._fetcher_sprites_sprite.x + j) < 8)
                                    continue;
                                if(ppu_state._sprite_fifo[j]) {
                                    if(ppu_state._sprite_fifo[j].color === 0)
                                        ppu_state._sprite_fifo[j] = px;
                                } else
                                    ppu_state._sprite_fifo.push(px)
                            }
                        }
                        ppu_state._fetcher_sprites = false;
                }
                break;
            }

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
                    let bgpx = ppu_state._bg_fifo.shift();
                    let sppx = ppu_state._sprite_fifo.length > 0 ? ppu_state._sprite_fifo.shift() : null;
                    let px = sppx && sppx.color !== 0 ? sppx : bgpx;

                    let color = px.color === null ? 256 : Math.floor((3-(((px.palette !== undefined ? (px.palette ? ppu_state.obp1 : ppu_state.obp0) : ppu_state.bgp) & (0b11 << (2*px.color))) >> (2*px.color)))*(256/3));
                    drawPixel(color, color, color, (ppu_state._lx++ - (ppu_state.scx % 8)), ppu_state.ly);
                    
                    // Check if HBlank should be entered
                    if(ppu_state._lx === (160 + (ppu_state.scx % 8))) {
                        ppu_state._mode = 0;
                        ppu_state._cycle = 0;
                    } else if((ppu_state.lcdc & 0b100000) && !ppu_state._fetcher_win && ppu_state.ly >= ppu_state.wy && (ppu_state._lx - (ppu_state.scx % 8)) >= (ppu_state.wx - 7)) {
                        ppu_state._fetcher_win = true;
                        ppu_state._fetcher_state = 0;
                        ppu_state._fetcher_x = 0;
                        ppu_state._bg_fifo = [];
                        ppu_state._sprite_fifo = [];
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
                if(ppu_state._mode === 1) {
                    intr_state.if |= 1;
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
                }
            }
            break;
    }

    // Update STAT Interrupts
    let stat_state =
        ((ppu_state._stat & 0b1000000) && ppu_state.ly === ppu_state.lyc)
        || ((ppu_state._stat & 0b100000) && ppu_state._mode === 2)
        || ((ppu_state._stat & 0b10000) && ppu_state._mode === 1)
        || ((ppu_state._stat & 0b1000) && ppu_state._mode === 0);
    if(!ppu_state._last_stat_state && stat_state)
        intr_state.if |= 0b10;
    ppu_state._last_stat_state = stat_state
}

function drawPixel(r, g, b, x, y) {
    lcd.fillStyle = `rgb(${r},${g},${b})`;
    lcd.fillRect(x, y, 1, 1);
}