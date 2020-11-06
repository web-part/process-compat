

const watch = require('./modules/watch');
const build = require('./modules/build');


module.exports = exports = {

    mode: 'compat',//兼容模式。

    watch(website) { 
        watch(exports.mode, website);
    },

    build(website) { 
        build(exports.mode, website);
    },
};