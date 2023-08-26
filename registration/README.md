# Registration module

This module handles users registration, approval, revoke, and other administrative tasks regarding users.

The only public endpoint exposed from this service is `/api/registration` which is the entrypoint for users to register.
Then, an administrator would review the request and generate a token. They will manually send an email to you.
In the future, we hope to send the email and token generation process automatically using some kind of SMTP APIs.

## Development

Assuming you have [.NET 6 SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks) installed manually or
via IDE (either via [Visual Studio 2022 Community](https://visualstudio.microsoft.com/)
or [JetBrains Rider](https://www.jetbrains.com/rider/)).

Open `Registration.sln` from current working directory.