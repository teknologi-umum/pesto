import { Server, ServiceDefinition } from "@grpc/grpc-js";

export class TypedServer extends Server {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addTypedService<TypedServiceImpl extends Record<string, any>>(
        service: ServiceDefinition,
        implementation: TypedServiceImpl
    ) {
        this.addService(service, implementation);
    }
}
