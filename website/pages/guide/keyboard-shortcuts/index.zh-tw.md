# 快捷鍵

快捷鍵在預設（Presets）和插件中都被預設提供。這完全取決於你的習慣，你可以將它們定義成任何你想要的快捷鍵。

---

## 預設的快捷鍵速查表

> `Mod` 在 macOS 系統中指的是 `Cmd`，在 windows/linux 中指 `Ctrl`。

### 必要

| Action     | Key       |
| ---------- | --------- |
| 複製       | Mod-c     |
| 剪下       | Mod-x     |
| 拷貝       | Mod-v     |
| 換行       | Enter     |
| 退出程式碼塊 | Mod-Enter |

### 歷史

| Action | Key         |
| ------ | ----------- |
| 撤銷   | Mod-z       |
| 重做   | Mod-Shift-z |

### 標記

| Action   | Key       |
| -------- | --------- |
| 加粗     | Mod-b     |
| 斜體     | Mod-i     |
| 行內程式碼 | Mod-e     |
| 刪除線   | Mod-Alt-x |

### 段落

| Action   | Key         |
| -------- | ----------- |
| 常規文字 | Mod-Alt-0   |
| H1       | Mod-Alt-1   |
| H2       | Mod-Alt-2   |
| H3       | Mod-Alt-3   |
| H4       | Mod-Alt-4   |
| H5       | Mod-Alt-5   |
| H6       | Mod-Alt-6   |
| 程式碼塊   | Mod-Alt-c   |
| 刪除換行 | Shift-Enter |

### 列表

| Action   | Key       |
| -------- | --------- |
| 有序列表 | Mod-Alt-7 |
| 無序列表 | Mod-Alt-8 |
| 任務列表 | Mod-Alt-9 |
| 向後縮排 | Mod-]     |
| 向前縮排 | Mod-[     |

### 表格

| Action           | Key       |
| ---------------- | --------- |
| 下一列           | Mod-]     |
| 前一列           | Mod-[      |
| 退出表格塊並換行 | Mod-Enter |

---

## 快捷鍵配置

你可以像配置它們的樣式一樣配置快捷鍵：

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

你可以通過審查 `SupportedKeys` 列舉型別來找出支援配置的命令。

如果沒有存在像你預期支援的命令，你可以通過編寫 [prosemirror keymap plugin](https://github.com/ProseMirror/prosemirror-keymap) 來進行支援。你可以通過閱讀 [building plugins](/#/building-plugins) 來獲取更多資訊。
