// this file is some magic code that I stole from the internet.
// This is a workaround to handle missing index type when extending the generated service interface.
// see: https://github.com/agreatfool/grpc_tools_node_protoc_ts/blob/master/doc/server_impl_signature.md

type KnownKeys<T> = {
    [K in keyof T]: string extends K ? never : number extends K ? never : K;
    // eslint-disable-next-line no-unused-vars
} extends { [_ in keyof T]: infer U }
    ? U
    : never;

/**
 * This type basically used to remove the index type so we don't need to implement it.
 * The reason why we want to remove the index type is because we want to add an extra property for
 * Dependency Injection that is not a string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KnownOnly<T extends Record<string, any>> = Pick<T, KnownKeys<T>>;
