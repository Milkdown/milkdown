# Atom

In the world of milkdown, everything are `Atom`s.
The only thing the core part of milkdown do is execute these atoms one by one.

Atom has the shape of the following structure:

```typescript
class Atom {
    id: string;
    loadAfter: LoadState;
    main() {
        const currentCtx = this.context;
        const myCtx = myHandler(currentCtx);
        this.updateContext(myCtx);
    }
}
```

Every atom should implement 2 props and 1 method:

## id

The identifier of current atom. It must have no conflict with other atoms.

## loadAfter

The timing that current atom need to be loaded.

## main

A method that will be executed when current atom is loaded, in this method, you can use 2 props on `this`:

-   this.context: readonly property, get the current context of the editor.
-   this.updateContext: used to update the context of the editor.
