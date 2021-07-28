const url = new URL(location.href);

const main = async () => {
    if (url.pathname === '/') {
        return;
    }

    const name = '.' + url.pathname;
    const module = await import(/* @vite-ignore */ name);
    return module.setup();
};

main();
