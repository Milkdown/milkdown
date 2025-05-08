# @milkdown/theme-nord

Nord theme is a light weight theme built on top of [Nord](https://www.nordtheme.com/) and [tailwindcss](https://tailwindcss.com/).

This theme is designed to be used in milkdown's documentation website.
If you want to use it in your own project, you need to use it like this:

```ts
/* Copyright 2021, Milkdown by Mirone. */
import { nord } from "@milkdown/theme-nord";
// Don't forget to import the css file.
import "@milkdown/theme-nord/style.css";

Editor.make()
  .config(nord)
  // ...
  .create();
```

@nord
The theme config you need to pass to the editor.
