module.exports = {
  "__version": "11.0.0",
  "input:": {
    "task list": {
      "1": "*   [ ] list item 1\n*   [ ] list item 2\n\n    *   [ ] sub list item 1\n    *   [ ] sub list item 2\n*   [ ] list item 3\n"
    },
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
        "1": "*   list item 1\n*   list item 2\n\n    *   sub list item 1\n    *   sub list item 2\n*   list item 3\n"
      },
      "ordered list": {
        "1": "1.  list item 1\n2.  list item 2\n\n    1.  sub list item 1\n    2.  sub list item 2\n3.  list item 3\n"
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
        "1": "1.  The lunatic is on the grass\n2.  The lunatic is in the hell\n\n    *   The lunatic is on the grass\n    *   The lunatic is in the hell\n"
      }
    },
    "mark:": {
      "link": {
        "1": "The lunatic is [on the grass](url)\n"
      },
      "bold": {
        "normal bold": {
          "1": "The lunatic is **on the grass**\n"
        },
        "not a bold": {
          "1": "The lunatic is o\\*\\*\"n the grass\\*\\*\n"
        },
        "is a bold": {
          "1": "The lunatic is \"**on the grass**\"\n"
        },
        "a single word": {
          "1": "The lunatic is **o**n the grass\n"
        }
      },
      "italic": {
        "normal italic": {
          "1": "The lunatic is *on the grass*\n"
        },
        "not an italic": {
          "1": "The lunatic is o\\*\"n the grass\\*\n"
        },
        "is an italic": {
          "1": "The lunatic is \"*on the grass*\"\n"
        },
        "a single word": {
          "1": "The lunatic is *o*n the grass\n"
        }
      },
      "inline code": {
        "normal inline code": {
          "1": "The lunatic is `on the grass`\n"
        },
        "inline code with * and _": {
          "1": "The lunatic is `**_on the grass_**`\n"
        }
      }
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
