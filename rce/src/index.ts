import console from "console";
import grpc from "@grpc/grpc-js";
import { codeExecutionEngineServiceDefinition } from "@/stub/rce_pb.grpc-server";
import { IRceService, RceServiceImpl } from "@/RceService";
import { acquireRuntime } from "@/runtime/acquire";
import { SystemUsers } from "@/user/user";
import { Logger } from "@/Logger";
import { TypedServer } from "@/Server";

const PORT = process.env?.PORT || "50051";
const HOST = "0.0.0.0:" + PORT;

const registeredRuntimes = await acquireRuntime();
const users = new SystemUsers(64101 + 0, 64101 + 49, 64101);
const logger = new Logger(
    process.env?.LOGGER_SERVER_ADDRESS ?? "logger:50051",
    process.env?.LOGGER_TOKEN ?? "testing",
    process.env?.ENVIRONMENT ?? "development"
);

const rceServiceImpl = new RceServiceImpl(logger, registeredRuntimes, users);

const server = new TypedServer();
server.addTypedService<IRceService>(
    codeExecutionEngineServiceDefinition,
    rceServiceImpl
);

server.bindAsync(HOST, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Server started");
    server.start();
});

process.on("SIGINT", () => {
    console.log("Server shutting down..");
    server.tryShutdown((err) => {
        if (err) {
            console.error(err);
            process.exit(0);
        }

        process.exit(0);
    });
});
