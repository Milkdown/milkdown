declare module '*.md' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const value: string;
    export default value;
}

declare module '*.css' {
    const value: Record<string, string>;
    export default value;
}
