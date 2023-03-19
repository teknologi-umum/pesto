# Auth module

This submodule handles authentication that processes user's token and validate against the database (that is Redis).

The authenticate handler (declared on `authenticate.go` file) should only return HTTP OK (200). This service must
acts as a middleware for forwarding authentication from Traefik (the API gateway that we are using) to the RCE service.

If this service returns HTTP status of 4XX (400-499), it will be displayed on the client's request.
If this service returns HTTP status of 5XX (500-599), it will get intercepted and will be handled by the landing service
to display the 500 error either in JSON or HTML format.

## Development

Assuming you have [Go](https://go.dev/) installed and set up for your code editor/IDE.

Use [Go Proverbs](https://go-proverbs.github.io/) on writing Go code.

You won't need to run the app to see if it's working. All you need to run is Redis from the `docker-compose.dev.yml` file.
To run it, you will have to [install Docker on your local machine](https://docs.docker.com/get-docker/). Then, you can
easily execute on the root directory:

```bash
docker compose -f docker-compose.dev.yml up -d db
```

To validate every line of code, we uses test (again, you won't need to run the app). If you never do tests with Go,
you should read the [testing package's documentation](https://pkg.go.dev/testing). To run the test, you can execute
(assuming you have Redis up and running from the command above):

```bash
go test -v -cover -covermode=atomic ./...
```
