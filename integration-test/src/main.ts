const main = async () => {
    const url = new URL(location.href);
    if (!url.hash) {
        return;
    }

    const name = '.' + url.hash.slice(1);
    const module = await import(/* @vite-ignore */ name);
    module.setup();
};

main();
