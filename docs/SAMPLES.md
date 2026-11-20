# 示例成品 / 素材授权（2026-11-12）

## B 站：AI 头像样片

- 文件：`apps/headshot/public/samples/*.jpg`（6 张，896×1088，4:5）
- 生成：Replicate `black-forest-labs/flux-1.1-pro`，prompt 为职业头像方向（企业/创意/医疗/房产/高管）
- 性质：**AI 生成人物，不是客户照片，不涉及真人肖像授权**
- 页面标注：`AI sample`；文案明确 "not customer photos"
- 模型条款：FLUX.1 [pro] 输出可商用；上线前以 Replicate/Black Forest Labs 当前条款复核

## A 站：真实分离试听

- 文件：`apps/voice/public/samples/audio/{original,vocals,drums,bass,other}.mp3`
- 来源：Wikimedia Commons `Amazing Grace (vocalist with guitar) - Southern Aire - United States Air Force Reserve Band.mp3`
  - 页面：https://commons.wikimedia.org/wiki/File:Amazing_Grace_(vocalist_with_guitar)_-_Southern_Aire_-_United_States_Air_Force_Reserve_Band.mp3
  - 许可：**Public domain**（美国空军预备役乐队演出，美国政府作品）
- 处理：同一 `cjwbw/demucs` 模型（htdemucs，MP3 192kbps）分离；原始文件也保留
- 页面标注：曲名、演奏者、public domain、Wikimedia Commons；播放器说明「processed with the same Demucs model」
- 注意：不能把该音频当成客户案例；它是公共领域 demo，不是付费用户上传

## 页面动效

- `ScrollReveal`：`[data-reveal]` 进入视口时 fade-up；无 JS 时内容保持可见（`html.js` 才隐藏）
- `StemPlayer`：4 轨同步播放/静音切换、原曲对比、进度条、动态波形
- 头像卡片：滚动渐入、hover 缓慢放大、渐变遮罩、`AI sample` 标签
- 全部支持 `prefers-reduced-motion: reduce`

## 新站：YardCanvas / HueMirror 首页 demo（2026-11-21）

- 文件目录：`apps/photo-studio/public/samples/`
- **YardCanvas**
  - `landscape/yard-before.jpg`：Unsplash `photo-1564013799919-ab600027ffc6`，Unsplash License；已压缩到 900×600。
  - `landscape/modern-1.jpg` / `modern-2.jpg`：同一输入图经 Replicate `flux-kontext-pro` 生成的 Modern 风格结果，用于演示。
- **HueMirror**
  - `hair/selfie-before.jpg`：复用现有 headshot app 的 AI 生成样片（非真人），中心裁切 800×800。
  - `hair/blonde-1.jpg` / `blonde-2.jpg`：同一自拍经 `flux-kontext-pro` 生成的 Warm blonde 结果。
- 页面标注：`Demo — not a customer result` + 免责声明；不得包装成客户案例。
- 替换 demo 输入时必须同步更新本文件和页面 alt/免责声明。

