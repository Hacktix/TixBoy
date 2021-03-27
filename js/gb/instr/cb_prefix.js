var cb_funcmap = {};
funcmap[0xcb] = () => {
    let cb_op = readByte(registers.pc++);
    nextfunc = cb_funcmap[cb_op];
    if(nextfunc === undefined)
        throw `Encountered unknown opcode $cb $${cb_op.toString(16).padStart(2, '0')} at $${(registers.pc-2).toString(16).padStart(4, '0')}`;
}