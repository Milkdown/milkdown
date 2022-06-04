module.exports = {
  "__version": "10.0.0",
  "input:": {
    "node:": {
      "paragraph": {
        "1": "The lunatic is on the grass\n"
      },
      "heading": {
        "1": "# Heading1\n\n## Heading2\n"
      },
      "blockquote": {
        "1": "> Blockquote\n>\n> Next line.\n"
      },
      "bullet list": {
        "1": "*   list item 1\n\n*   list item 2\n\n    *   sub list item 1\n\n    *   sub list item 2\n\n*   list item 3\n"
      },
      "ordered list": {
        "1": "1.  list item 1\n\n2.  list item 2\n\n    1.  sub list item 1\n\n    2.  sub list item 2\n\n3.  list item 3\n"
      },
      "hr": {
        "1": "***\n"
      },
      "image": {
        "invalid image": {
          "1": "![image](invalidUrl)\n"
        },
        "valid image": {
          "1": "![image](/milkdown-mini.png)\n"
        }
      },
      "list": {
        "1": "1.  The lunatic is on the grass\n\n2.  The lunatic is in the hell\n\n    *   The lunatic is on the grass\n\n    *   The lunatic is in the hell\n"
      }
    },
    "mark:": {
      "bold": {
        "1": "The lunatic is **on the grass**\n"
      },
      "italic": {
        "1": "The lunatic is *on the grass*\n"
      },
      "inline code": {
        "1": "The lunatic is `on the grass`\n"
      },
      "link": {
        "1": "The lunatic is [on the grass](url)\n"
      }
    },
    "task list": {
      "1": "*   [ ] list item 1\n\n*   [ ] list item 2\n\n    *   [ ] sub list item 1\n\n    *   [ ] sub list item 2\n\n*   [ ] list item 3\n"
    }
  },
  "transform:": {
    "paragraph": {
      "1": "The lunatic is on the grass\n"
    },
    "mark": {
      "1": "**The lunatic is on the grass**\n\n*The lunatic is on the grass*\n\n`The lunatic is on the grass`\n\n[The lunatic is on the grass](link)\n\n***The lunatic is on the grass***\n\n***`The lunatic is on the grass`***\n\n***[The lunatic is on the grass](link)***\n"
    }
  }
}
