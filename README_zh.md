# Gemini Watermark Remover - Chrome Extension

[English](README.md) | **中文**

自动去除 Gemini AI 生成图片水印的 Chrome 扩展。

<p align="center">
  <img src="docs/Gemini_Generated_Image_vvtju3vvtju3vvtj.png" width="600">
</p>

## 功能特点

- 🚀 **自动处理** - 下载图片时自动去除水印
- 🔒 **隐私优先** - 所有处理都在浏览器本地完成
- ⚡ **极速** - 基于 Canvas 的高效图像处理
- 🎯 **精准** - 使用反向 Alpha 混合算法精确去除水印

## 效果展示

<details open>
<summary>点击展开/收起示例</summary>

**无损对比图**

<img src="docs/lossless_diff.webp">

**处理前后对比**

| 原图 | 去水印后 |
| :---: | :----: |
| <img src="docs/1.webp" width="400"> | <img src="docs/unwatermarked_1.webp" width="400"> |
| <img src="docs/2.webp" width="400"> | <img src="docs/unwatermarked_2.webp" width="400"> |
| <img src="docs/3.webp" width="400"> | <img src="docs/unwatermarked_3.webp" width="400"> |

</details>

## 安装方法

### 方式一：下载 .crx 安装（最快）

1. 下载 [chrome-extension.crx](releases/chrome-extension.crx)
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 将 `.crx` 文件拖拽到扩展页面
5. 点击「添加扩展程序」确认

> ⚠️ Chrome 可能会提示「来自非 Chrome 商店的扩展」警告，这是正常现象。

### 方式二：从源码加载（开发者模式）

1. 克隆本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `chrome-extension` 目录

### 开发构建

如需修改源码，运行以下命令重新构建 `content.js`：

```bash
node build.js
```

## 使用方法

1. 安装扩展
2. 访问 https://gemini.google.com/
3. 使用 Gemini 生成图片
4. 点击下载按钮
5. 下载的图片将自动去除水印 ✨

## 工作原理

扩展使用**反向 Alpha 混合算法**去除水印：

```
原始公式：watermarked = α × logo + (1 - α) × original
反向求解：original = (watermarked - α × logo) / (1 - α)
```

Alpha 映射图从参考水印图片（`bg_48.png` 和 `bg_96.png`）预先计算。

## 项目结构

```
chrome-extension/
├── manifest.json       # 扩展清单 (Manifest V3)
├── content.js          # 主脚本（注入 Gemini 页面）
├── build.js            # 构建脚本
├── assets/             # 水印参考图
│   ├── bg_48.png
│   └── bg_96.png
├── icons/              # 扩展图标
└── releases/           # 发布文件
    └── chrome-extension.crx
```

## 技术细节

- **Manifest 版本**：V3
- **Content Script 运行环境**：MAIN world（拦截 fetch 请求）
- **权限**：最小化（仅 host_permissions）

## 许可证

MIT License

## 致谢

- 基于 [gemini-watermark-remover](https://github.com/journey-ad/gemini-watermark-remover) by journey-ad
- 算法参考：[GeminiWatermarkTool](https://github.com/allenk/GeminiWatermarkTool) by allenk
