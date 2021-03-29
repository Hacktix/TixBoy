var dma_state = {
    _dma_queue: 0,
    _dma_src_ptr: 0,

    set dma_queue(v) {
        if(!this.dma_active) {
            this._dma_queue = 2;
            this._dma_src_ptr = v << 8;
        }
    },

    dma_active: false,
}

function updateOAMDMA() {
    if(--dma_state._dma_queue === 0)
        dma_state.dma_active = true;

    if(dma_state.dma_active) {
        oam[dma_state._dma_src_ptr & 0xff] = readByte(dma_state._dma_src_ptr++);
        if((dma_state._dma_src_ptr & 0xff) == 0xa0)
            dma_state.dma_active = false;
    }
}