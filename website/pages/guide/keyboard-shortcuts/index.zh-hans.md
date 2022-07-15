# 快捷键

快捷键在预设（Presets）和插件中都被默认提供。这完全取决于你的习惯，你可以将它们定义成任何你想要的快捷键。

---

## 默认的快捷键速查表

> `Mod` 在 macOS 系统中指的是 `Cmd`，在 windows/linux 中指 `Ctrl`。

### 必要

| Action     | Key       |
| ---------- | --------- |
| 复制       | Mod-c     |
| 剪切       | Mod-x     |
| 拷贝       | Mod-v     |
| 换行       | Enter     |
| 退出代码块 | Mod-Enter |

### 历史

| Action | Key         |
| ------ | ----------- |
| 撤销   | Mod-z       |
| 重做   | Mod-Shift-z |

### 标记

| Action   | Key       |
| -------- | --------- |
| 加粗     | Mod-b     |
| 斜体     | Mod-i     |
| 行内代码 | Mod-e     |
| 删除线   | Mod-Alt-x |

### 段落

| Action   | Key         |
| -------- | ----------- |
| 常规文本 | Mod-Alt-0   |
| H1       | Mod-Alt-1   |
| H2       | Mod-Alt-2   |
| H3       | Mod-Alt-3   |
| H4       | Mod-Alt-4   |
| H5       | Mod-Alt-5   |
| H6       | Mod-Alt-6   |
| 代码块   | Mod-Alt-c   |
| 删除换行 | Shift-Enter |

### 列表

| Action   | Key       |
| -------- | --------- |
| 有序列表 | Mod-Alt-7 |
| 无需列表 | Mod-Alt-8 |
| 任务列表 | Mod-Alt-9 |
| 向后缩进 | Mod-]     |
| 向前缩进 | Mod-[     |

### 表格

| Action           | Key       |
| ---------------- | --------- |
| 下一列           | Mod-]     |
| 前一列           | Mod-[     |
| 退出表格块并换行 | Mod-Enter |

---

## 快捷键配置

你可以像配置它们的样式一样配置快捷键：

```typescript
import { commonmarkNodes, commonmarkPlugins, blockquote, SupportedKeys } from '@milkdown/preset-commonmark';

Editor.make().use(commonmarkPlugins).use(nodes);

const nodes = commonmarkNodes.configure(blockquote, {
    keymap: {
        [SupportedKeys.Blockquote]: 'Mod-Shift-b',
        // or you may want to bind multiple keys:
        [SupportedKeys.Blockquote]: ['Mod-Shift-b', 'Mod-b'],
    },
});

Editor.make().use(nodes).use(commonmarkPlugins);
```

你可以通过审查 `SupportedKeys` 枚举类型来找出支持配置的命令。

如果没有存在像你预期支持的命令，你可以通过编写 [prosemirror keymap plugin](https://github.com/ProseMirror/prosemirror-keymap) 来进行支持。你可以通过阅读 [building plugins](/#/building-plugins) 来获取更多信息。
