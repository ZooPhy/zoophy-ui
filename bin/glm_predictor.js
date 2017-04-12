'use strict';

class GLMPredictor {
    
    constructor(state, name, value) {
        this.state = String(state);
        this.name = String(name);
        this.value = Number(value);
        this.year = null;
    };

};

module.exports = GLMPredictor;