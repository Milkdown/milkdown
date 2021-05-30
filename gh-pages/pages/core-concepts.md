# Core Concepts

## Atom

In the world of milkdown, everything is `Atom`s.
The only thing the core part of milkdown do is execute the atoms one by one.

Atom has the shape of the following structure:

```typescript
class Atom {
    id: string;
    type: AtomType;
    loadAfter: LoadState;
    main() {
        const currentCtx = this.context;
        const myCtx = myHandler(currentCtx);
        this.updateContext(myCtx);
    }
}
```

-   id: Identify an atom. It must have no conflict with other atoms.

## Parser

## Serializer

## Node & Mark

## Plugin
