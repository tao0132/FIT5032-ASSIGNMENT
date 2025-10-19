# WCAG 2.1 AA Accessibility Features

## 概述
本文档记录了 NFP Wellness 应用程序中实现的 WCAG 2.1 AA 级别无障碍访问功能。

## 实现的无障碍功能

### 1. ✅ 语义化 HTML (WCAG 1.3.1)

#### 页面结构
- **HTML lang 属性**: 所有页面包含 `lang="en"` 属性
- **Meta 描述**: 添加了页面描述 meta 标签
- **语义化标签**: 使用 `<header>`, `<main>`, `<section>`, `<article>` 等语义化标签
- **标题层级**: 正确的 H1-H6 标题层级结构

#### 实现位置
- `index.html`: HTML lang 属性和 meta 标签
- `App.vue`: header, main, nav 语义化标签
- `HomeView.vue`: section 标签和正确的标题层级
- `CoachCard.vue`: article 标签用于教练卡片

---

### 2. ✅ ARIA 标签和角色 (WCAG 4.1.2)

#### 导航 (App.vue)
```html
<nav role="navigation" aria-label="Main navigation">
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <ul role="menu">
    <li role="menuitem">...</li>
  </ul>
</nav>
```

#### 表单 (LoginView.vue, RegisterView.vue)
- **aria-required**: 必填字段标记
- **aria-invalid**: 错误状态指示
- **aria-describedby**: 关联帮助文本
- **aria-live**: 错误消息实时公告
- **aria-atomic**: 完整公告区域内容

#### 列表和卡片
- **role="list"**: 列表容器
- **role="listitem"**: 列表项
- **role="article"**: 教练卡片
- **aria-label**: 描述性标签

---

### 3. ✅ 键盘导航 (WCAG 2.1.1)

#### Skip Navigation 链接
- 允许键盘用户跳过导航直接访问主内容
- 仅在获得焦点时可见
- 实现位置: `App.vue`

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
}

.skip-link:focus {
  top: 0;
}
```

#### 焦点指示器
- 所有交互元素有清晰的焦点指示
- 3px 蓝色外框，2px 偏移
- 符合 WCAG 2.4.7 要求

```css
a:focus, button:focus {
  outline: 3px solid #0d6efd;
  outline-offset: 2px;
}
```

#### Tab 键顺序
- 所有交互元素可通过 Tab 键访问
- 逻辑的 tab 键顺序（从上到下，从左到右）

---

### 4. ✅ 表单无障碍 (WCAG 3.3.1, 3.3.2)

#### 标签关联
- 所有表单字段都有关联的 `<label>` 标签
- 使用 `for` 和 `id` 正确关联

#### 必填字段指示
```html
<label for="email">
  Email address 
  <span aria-label="required" class="required">*</span>
</label>
```

#### 错误处理
- 错误消息在 ARIA live region 中公告
- 错误时 aria-invalid="true"
- 红色边框视觉指示

#### 自动完成
- 使用 `autocomplete` 属性
  - `autocomplete="email"`
  - `autocomplete="current-password"`
  - `autocomplete="new-password"`

#### 帮助文本
```html
<small id="email-hint" class="form-text">
  Enter your registered email address
</small>
```

---

### 5. ✅ 图片替代文本 (WCAG 1.1.1)

#### 描述性 Alt 文本
```html
<img 
  :alt="`Profile photo of ${coach.name}, fitness coach specializing in ${coach.specializations.join(', ')}`"
  loading="lazy"
>
```

#### 装饰性图像
- 使用 `aria-hidden="true"` 隐藏纯装饰性元素
- 例如: 步骤编号图标

---

### 6. ✅ 颜色对比度 (WCAG 1.4.3)

#### 文本对比度
- 正常文本: 至少 4.5:1
- 大文本: 至少 3:1
- 错误消息: 红色 (#721c24) 在浅背景 (#f8d7da) 上

#### 焦点指示器
- 蓝色外框 (#0d6efd) 提供高对比度
- 不依赖颜色单独传达信息

---

### 7. ✅ 屏幕阅读器支持 (WCAG 4.1.3)

#### Live Regions
```html
<div 
  role="alert" 
  aria-live="polite" 
  aria-atomic="true"
>
  <span class="visually-hidden">Error:</span>
  {{ error }}
</div>
```

#### 隐藏视觉内容
```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

#### 加载状态
```html
<div role="status" aria-live="polite">
  <span class="visually-hidden">Loading coaches...</span>
  <p aria-hidden="true">Loading coaches...</p>
</div>
```

---

### 8. ✅ 响应式设计 (WCAG 1.4.10)

#### 视口设置
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

#### 文本缩放
- 支持最高 200% 文本缩放
- 使用 rem/em 单位而非固定像素

---

### 9. ✅ 用户偏好支持 (WCAG 2.3.3)

#### 减少动画
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 高对比度模式
```css
@media (prefers-contrast: high) {
  .form-control {
    border-width: 3px;
  }
  
  .btn {
    border: 3px solid currentColor;
  }
}
```

---

## 测试建议

### 键盘测试
1. **Tab 键**: 确保可以访问所有交互元素
2. **Enter/Space**: 激活按钮和链接
3. **Escape**: 关闭模态框和下拉菜单
4. **箭头键**: 在下拉菜单中导航

### 屏幕阅读器测试
推荐工具:
- **NVDA** (Windows - 免费)
- **JAWS** (Windows - 付费)
- **VoiceOver** (Mac - 内置)
- **TalkBack** (Android - 内置)

### 自动化测试工具
- **axe DevTools**: 浏览器扩展
- **WAVE**: Web 无障碍评估工具
- **Lighthouse**: Chrome DevTools 内置

### 手动测试清单
- [ ] 所有功能都可以仅用键盘操作
- [ ] 焦点指示器清晰可见
- [ ] 错误消息被屏幕阅读器正确公告
- [ ] 图片有描述性替代文本
- [ ] 表单标签正确关联
- [ ] 颜色对比度符合要求
- [ ] 页面结构语义化

---

## WCAG 2.1 AA 符合性矩阵

| 准则 | 级别 | 状态 | 实现位置 |
|------|------|------|---------|
| 1.1.1 非文本内容 | A | ✅ | CoachCard.vue, HomeView.vue |
| 1.3.1 信息和关系 | A | ✅ | 所有视图 |
| 1.4.3 对比度（最低） | AA | ✅ | 全局样式 |
| 1.4.10 回流 | AA | ✅ | 响应式设计 |
| 2.1.1 键盘 | A | ✅ | App.vue, 表单视图 |
| 2.4.7 焦点可见 | AA | ✅ | 全局焦点样式 |
| 3.2.3 一致的导航 | AA | ✅ | App.vue |
| 3.3.1 错误识别 | A | ✅ | LoginView.vue, RegisterView.vue |
| 3.3.2 标签或说明 | A | ✅ | 所有表单 |
| 4.1.2 名称、角色、值 | A | ✅ | ARIA 标签 |

---

## 维护指南

### 添加新组件时
1. 使用语义化 HTML 标签
2. 为交互元素添加 ARIA 标签
3. 确保键盘可访问
4. 添加适当的焦点样式
5. 为图片提供替代文本

### 添加新表单时
1. 使用 `<label>` 标签
2. 添加 `aria-required` 和 `aria-describedby`
3. 实现错误处理的 live regions
4. 添加帮助文本
5. 使用 `autocomplete` 属性

### 代码审查清单
- [ ] 检查 ARIA 标签是否正确
- [ ] 验证键盘导航
- [ ] 测试屏幕阅读器公告
- [ ] 检查颜色对比度
- [ ] 验证焦点指示器

---

## 参考资源

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

---

**最后更新**: 2025年10月18日  
**维护者**: NFP Wellness 开发团队


