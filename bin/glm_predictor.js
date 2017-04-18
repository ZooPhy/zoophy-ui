'use strict';

class GLMPredictor {
    
    constructor(state, name, value) {
        this.state = String(state).trim();
        this.name = String(name).trim();
        this.value = Number(value);
        this.year = null;
    };

};

module.exports = GLMPredictor;