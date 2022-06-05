frontend goes here. please add a dockerfile.

no other service will serve your frontend, you must host it yourself.
remember to keep it lightweight.

also i need something:
1. an error page. don't be too stiff about it. it's meant to handle 500-599 errors on other services. endpoint: GET /error
2. a healthcheck endpoint. you can be stiff about this one. endpoint: GET /healthz it won't be exposed outside to the internet