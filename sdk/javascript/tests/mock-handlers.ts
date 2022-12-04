import { rest } from "msw";
import type { CodeRequest, CodeResponse, RuntimeResponse } from "../src/responses";
import { constants as httpStatus } from "http2";

export const mockHandlers = [
    rest.get("https://mock-pesto.com/api/ping", (req, res, ctx) => {
        return res(ctx.status(httpStatus.HTTP_STATUS_OK), ctx.body(JSON.stringify({ message: "OK" })));
    }),

    rest.post("https://mock-pesto.com/api/execute", async (req, res, ctx) => {
        const body = (await req.json()) as CodeRequest;
        if (body.language === "" || ("code" in body && body.code === "") || body.version === "") {
            return res(ctx.status(httpStatus.HTTP_STATUS_BAD_REQUEST), ctx.json({ message: "Missing parameters" }));
        }

        if (body.language !== "Python" && body.version !== "3.10.2") {
            return res(ctx.status(httpStatus.HTTP_STATUS_BAD_REQUEST), ctx.json({ message: "Runtime not found" }));
        }

        return res(
            ctx.status(httpStatus.HTTP_STATUS_OK),
            ctx.json({
                language: "Python",
                version: "3.10.2",
                compile: {
                    stdout: "",
                    stderr: "",
                    output: "",
                    exitCode: 0
                },
                runtime: {
                    stdout: "Hello World",
                    stderr: "",
                    output: "Hello World",
                    exitCode: 0
                }
            } as CodeResponse)
        );
    }),

    rest.get("https://mock-pesto.com/api/list-runtimes", (req, res, ctx) => {
        return res(
            ctx.status(httpStatus.HTTP_STATUS_OK),
            ctx.json({
                message: "OK",
                runtime: [
                    { language: "Go", aliases: ["go", "golang"], version: "1.18.2", compiled: true },
                    { language: "Java", aliases: ["java"], version: "19", compiled: true },
                    { language: "Typescript", aliases: ["typescript", "ts"], version: "4.9", compiled: false }
                ]
            } as RuntimeResponse)
        );
    })
];
