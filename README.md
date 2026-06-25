# Shrimp's Alchemy

在线地址：https://shrimp0913.github.io/Shrimp-s-Alchemy/

一个类似“Little Alchemy”的网页炼金术游戏。玩家从水、火、土、风四种基础元素开始，通过拖拽组合不断发现新元素。

---

## 技术栈

- 纯前端：HTML + CSS + JavaScript，无构建工具
- 样式：`css/styles.css` + Font Awesome / Bootstrap Icons
- 图标：优先使用 `icons/` 目录下的 SVG 文件
- 数据：元素与配方直接写在 `app.js` 中
- 部署：GitHub Pages（main 分支）

---

## 项目结构

```
.
├── index.html          # 页面入口，注意 CSS/JS 的 cache buster（?v=xxx）
├── app.js              # 游戏核心逻辑、元素定义、配方注册
├── css/                # 样式文件
├── icons/              # 元素图标 SVG（优先使用这里面的文件）
├── fonts/              # Inter 字体
└── webfonts/           # Font Awesome 字体文件
```

---

## 本地运行

因为项目是纯静态页面，可以直接打开 `index.html`，或者使用任意本地服务器：

```bash
# 方式一：Python 3
python3 -m http.server 8080

# 方式二：Node.js（如已安装 npx）
npx serve .
```

然后访问 `http://localhost:8080` 即可。

---

## 如何添加新元素

1. 在 `app.js` 的 `init()` 函数中，参考已有元素添加定义：

```js
elements['your-id'] = { id: 'your-id', name: 'your name', icon: '<svg ...></svg>', discovered: false };
```

2. **图标优先使用 `icons/` 目录下的 SVG 文件**：如果 `icons/your-id.svg` 存在，请直接复制该文件内容到 `icon` 字段。不要使用 Font Awesome 内联 SVG 或其他来源作为替代。

3. 如果该元素是“终点元素”（不可再参与合成），把它加入 `finalItems`：

```js
finalItems.add('your-id');
```

4. 为元素添加至少一条配方，见下一节。

---

## 如何添加配方

在 `app.js` 的 `init()` 中，使用 `_addRecipe(a, b, result)` 注册配方：

```js
_addRecipe('water', 'fire', 'steam');
```

- 配方顺序无关，`_addRecipe` 内部会自动排序。

---

## 图标规范（重要）

- 项目所有自定义图标都应放在 `icons/` 目录下，文件名为元素 ID 同名 SVG。
- 元素定义时，`icon` 字段应直接写入对应 SVG 文件的内容。
- 当 `icons/` 中存在匹配文件时，**不要**使用 Font Awesome 内联 SVG 或其他替代图标。
- 已验证的图标映射：
  - `bucket` → `icons/bucket.svg`
  - `cactus` → `icons/cactus.svg`
  - `petroleum` → `icons/utility-can.svg`
  - `sword` → `icons/sword.svg`
  - `tire-flat` → `icons/tire-flat.svg`

---

## 终点元素（Final Items）

终点元素在普通模式下不会出现在右侧侧边栏中，也不能再被用于合成。管理员模式（Admin）可以查看和使用它们。判断逻辑在 `app.js` 的 `finalItems` 集合中。

---

## 管理员模式

- 点击左侧“Admin”按钮，输入密码即可进入。
- 管理员模式可以查看所有元素（包括终点元素），并测试未解锁的合成。
- 管理员密码校验逻辑在 `app.js` 中，不要明文修改密码哈希。
- 退出管理员模式后会恢复到进入前的玩家进度。

---

## 缓存清除（Cache Buster）

每次修改 `app.js` 或 `css/styles.css` 后，需要在 `index.html` 中更新版本号，避免浏览器缓存旧文件：

```html
<link rel="stylesheet" href="css/styles.css?v=120">
<script src="app.js?v=120"></script>
```

建议每次发布时把两个 `v=` 同步递增。

---

## 部署

项目托管在 GitHub Pages，通过推送 `main` 分支自动部署。更新流程：

1. 修改 `app.js` / `index.html` / `icons/` 等文件。
2. 更新 `index.html` 中的 cache buster。
3. 提交并推送到 `origin/main`：

```bash
git add -A
git commit -m "feat: add xxx"
git push origin main
```

---

## 开发习惯与约定

- 元素 ID 使用小写英文字母，单词之间用连字符 `-` 分隔，例如 `tire-flat`、`cat-space`。
- 元素名称（`name`）使用小写英文，如 `flat tire`、`space cat`。
- 提交信息使用英文，例如 `feat: add cloth, eggplant and related recipes`、`fix: use icons/tire-flat.svg for flat tire`。
- 每次更新后记得同步更新 `index.html` 的 cache buster。
- 新增图标前优先确认 `icons/` 中是否已有同名文件。
- **需求描述习惯**：当需要添加新元素时，通常使用以下格式描述：
  - `A加B等于C，用xxx`（表示新元素 C 的图标文件名为 `xxx.svg`）
  - 例如：`human加fabric等于cloth，用shirt`（表示 human + fabric = cloth，cloth 的图标使用 `icons/shirt.svg`）

---

## 注意事项

- 游戏进度保存在浏览器 `localStorage` 中，键名为 `shrimpAlchemy_save`。如果修改了版本号 `GAME_VERSION`，旧存档可能会被清空或重置。
- 配方注册时，如果两个元素组合已经存在，后注册的会覆盖先注册的，请注意检查冲突。
- 尽量保持 `app.js` 中的元素定义和配方注册顺序清晰，方便后续查找。
