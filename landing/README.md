# Landing module

This service provides frontend for Pesto. Written using [Astro](https://astro.build/) with [Solid.js](https://www.solidjs.com/) integration.

The frontpage of Pesto should gives information about what Pesto is, how people can benefit through it, and how to register for
access token. Documentation on HTTP API should also be documented on the web, alongside with Postman collection or HAR file.

### Development

Assuming you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/installation) installed.

Start the project in development mode:

```sh
pnpm dev
# or
pnpm start
```

This will watch the project directory and restart as necessary.

Preview the project in production mode:

```sh
pnpm build
pnpm preview
```

Format the project

```sh
pnpm fmt:write
# or if you just want to check the formatting
pnpm fmt:check
```
