/**
* 针对兼容模式的处理。
* 即命令行中使用了 `webpart watch --compat` 的命令。
* 主要完成的功能：
*   1，对最外层的 `<template>` 标签内的 innerHTML 用一层 `<script type="text/template"></script>` 包裹起来。
*   2，删除所有元数据 `data-meta` 属性里含有 `mode="normal"` 的 `<script>` 标签。
*   3，对符合条件的 `<script>` 标签做 babel 转码，修正 `src` 属性以引用到 babel 版本的文件。
*  
* 针对独立打包的方式，
* 即命令行中使用了 `webpaet watch --compat --pack` 的命令，
* 主要完成的功能：
*   1，对合并后、压缩前的 html 包文件进行 `<template>` 标签转换，参考上述的第 1 点。
*   2，对合并后、压缩前的 js 包文件进行 babel 转换。
*/



const console = require('@webpart/console');
const Babel = require('@webpart/process-babel');
const Template = require('@webpart/process-template');


/**
* 
* @param {string} mode 使用的模式。 
* @param {WebSite} website WebSite 实例对象。
* @param {Object} opt 配置对象。
*   opt = {
*       dir: '',        //必选，进行 babel 转换后的输出目录（相对于 website.htdocs），最终结果如 `htdocs/babel/`.
*       cover: false,   //可选，是否使用 istanbul 进行代码覆盖率插桩。
*       comment: false, //可选，是否在输出的内容顶部生成注释。
*   };
*/
module.exports = function (mode, website, opt) {

    website.on('render', {
        /**
        * 渲染 master 页面成 html 页面时触发。 
        * 可以在此事件对生成的 html 做进一步处理和转换等。 
        *   dest: '',   //输出的 html 页面地址。 如 `../htdocs/index.html`。
        *   html: '',   //默认方式渲染生成的 html 内容。
        *   data: {},   //其它更多的信息。
        * 如果返回新的 html(包括空字符串)，则以它作为最终的生成内容。
        */
        'master': function (dest, html, data) {
            return Template.transform(html, dest);
        },


        /**
        * 生成 `<script>` 标签的 html 内容时触发。
        * 可以在此事件对原有的 `<script> 标签` 做进一步处理和转换等，如做 babel 转换。
        * 此处完成的功能：
        *   删除所有元数据 (data-meta) 属性里含有 `mode="normal"` 的 `<script>` 标签。
        *   且对符合条件的 js 文件做 babel 转码，改写 `<script>` 标签以引用到 babel 版本的文件。
        */
        'js-link': function (file, html, data) {
            let item = data.item || {};
            let meta = item.meta || {};

            //显式指定为其它模式的，则删除该 `<script>` 标签。
            if (meta.mode && meta.mode != mode) {
                return ''; //返回空字符串，表示删除内容。
            }


            let babel = meta.babel == 'no' ? false : true;      //除非当前 script 标签指定为 no，否则都作 bable 转换。
            let cover = meta.cover == 'no' ? false : opt.cover; //除非当前 script 标签指定为 no，否则以参数的为准。

            if (!babel && !cover) {
                return;
            }


            //符合条件的，作 babel 转码，且修正 `<script>` 标签以引用到 babel 版本的文件。
            return Babel.render(file, data, {
                'htdocs': website.htdocs,   //网站的根目录。
                'dir': opt.dir,             // babel 文件的输出目录，相对于 htdocs。 最终结果如 `htdocs/babel/`。

                'babel': babel,
                'cover': cover,
                'comment': opt.comment,
            });
        },
    });


    /**
    * 针对使用了独立打包的方式。 
    * 编译包文件时触发。
    */
    website.on('package', 'compile', {
        /**
        * 对输出的 html 包作转换。
        */
        'html-block': function (content, data) {
            return Template.transform(content, data.list);
        },

        /**
        * 对输出的 js 包作转换。
        */
        'js-block': function (content, data) {
            console.log('package: babel 转码合并后的内容'.bgCyan, 'md5:', data.md5.cyan);

            return Babel.transform(content, {
                'babel': true,
                'cover': opt.cover,
                'comment': opt.comment,
                ...data,
            });
        },
    });

};
