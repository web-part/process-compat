

const watch = require('./modules/watch');
const build = require('./modules/build');


module.exports = exports = {

    mode: 'compat',//兼容模式。

    watch(website, opt) {
        watch(exports.mode, website, opt);
    },

    build(website) {
        build(exports.mode, website);
    },
};