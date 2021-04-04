var dma_state = {
    _dma_queue: 0,
    _dma_queue_ptr: 0,
    _dma_src_ptr: 0,
    _read_data: 0xff,
    _bus_data: 0xff,

    set dma_queue(v) {
        this._read_data = v;
        this._dma_queue = 2;
        this._dma_queue_ptr = v << 8;
    },

    dma_active: false,
}

function updateOAMDMA() {
    if(dma_state.dma_active) {
        oam[dma_state._dma_src_ptr & 0xff] = dma_state._bus_data = readByteOAMDMA(dma_state._dma_src_ptr++);
        if((dma_state._dma_src_ptr & 0xff) == 0xa0)
            dma_state.dma_active = false;
    }

    if(dma_state._dma_queue > 0 && --dma_state._dma_queue === 0) {
        dma_state.dma_active = true;
        dma_state._dma_src_ptr = dma_state._dma_queue_ptr;
    }
}

function readByteOAMDMA(addr) {
    if(addr < 0x100 && bootrom_mapped) return bootrom[addr];
    if(addr < 0x8000) return readRom(addr);           // ROM
    if(addr < 0xa000) return readVram(addr);          // VRAM
    if(addr < 0xc000) return readSram(addr);          // SRAM (TODO: Add Support)
    if(addr < 0xe000) return readWram(addr);          // WRAM
    return readWram(addr - 0x2000);                   // Echo RAM / OAM
}