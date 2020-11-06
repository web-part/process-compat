# @webpart/process-compat

处理兼容模式的插件。 即命令行中使用了 `node watch compat` 或 `node build compat` 开头的的命令。 
需要配合 `@webpart/master` 使用。

## `node watch compat` 命令
主要完成的功能：
 - 1，对最外层的 `<template>` 标签内的 innerHTML 用一层 `<script type="text/template"></script>` 包裹起来。
 - 2，删除所有元数据 `data-meta` 属性里含有 `mode="normal"` 的 `<script>` 标签。
 - 3，对符合条件的 `<script>` 标签做 babel 转码，修正 `src` 属性以引用到 babel 版本的文件。
 
### 针对独立打包的方式
即命令行中使用了 `node watch compat pack` 开头的的命令， 主要完成的功能：
 - 1，对合并后、压缩前的 html 包文件进行 `<template>` 标签转换，参考上述的第 1 点。
 - 2，对合并后、压缩前的 js 包文件进行 babel 转换。

