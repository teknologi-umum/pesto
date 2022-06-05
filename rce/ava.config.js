export default {
    extensions: {
        "ts": "module",
        "test.ts": "module"
    },
    nodeArguments: [
        "--loader=ts-node/esm"
    ]
};
