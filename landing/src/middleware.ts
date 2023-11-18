import { sequence } from "astro:middleware";
import { handleRequest } from "@sentry/astro";

export const onRequest = sequence(
    handleRequest({
        trackClientIp: false,
        trackHeaders: true,
    }),
);
