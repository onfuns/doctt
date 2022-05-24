## doctt

即时渲染`markdown`内容的工具，demo 地址：[https://book.onfuns.com/](https://book.onfuns.com/)

## 开发

```bash
npm run gulp
npm run dev
```

## 使用

新建 `docs` 目录，进入目录，以此新增文件：

1、新增`index.html`，配置如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>doctt</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="" />
    <meta name="keywords" content="" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/doctt/dist/static/doctt.css" />
  </head>

  <body>
    <!--占位符-->
    <!--DOCTT-->
    <script src="https://cdn.jsdelivr.net/npm/doctt/dist/static/doctt.min.js"></script>
  </body>
</html>
```

2、新增菜单文件 `_sidebar.md`

```md
- 首页(/)
- demo(./README.md)
```

3、新增 `README.md` 文件，写入内容

4、启动服务

```bash
npm install doctt
doctt start docs -p 3002 -w  # -w 为热更新模式
```
