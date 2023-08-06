# Dogfood

Eating your own dog food or "dogfooding" is the practice of using one's own
products or services.
This can be a way for an organization to test its products in real-world usage
using product management techniques.
Hence dogfooding can act as quality control, and eventually a kind of
testimonial advertising. Once in the market,
dogfooding can demonstrate developers' confidence in their own products.

Definition was acquired
from [Wikipedia](https://en.wikipedia.org/wiki/Eating_your_own_dog_food). But
you can
learn more about the term "dogfooding" here:

- https://bubble.io/blog/dogfooding-startup-tech/
- https://maddevs.io/blog/dogfooding/
- https://zapier.com/engineering/api-dogfooding/
- https://blog.airbrake.io/dogfooding-its-great-when-done-right

This part of the code is meant to make sure that the Pesto API (most notably the
RCE)
is working as intended from the user perspective.

## Source code's source

Most of the code are taken from [Rosetta Code](https://rosettacode.org/).
Content is available under GNU Free Document License 1.3. For full license,
see [LICENSE](./LICENSE) file.

## Running the tests

Running the tests requires Node.js v18 or higher. Please install that
beforehand.

You can do it on Windows, but here's how you can do it on Linux (or
POSIX-based):

```bash
# Build Javascript SDK first
cd sdk/javascript
npm ci
npm run build

# Back to the root project directory
cd ../..
mv sdk/javascript/dist/ dogfood/pesto-node

export PESTO_URL=http://pesto_rce:50051/ # Set to your RCE API URL.
cd dogfood
npm ci
node --test
```

## Running your own RCE instance

To bypass the token limit at have a local (or nearby) running instance of Pesto's RCE,
you can set up your own by running these Docker commands:

```bash
docker pull ghcr.io/teknologi-umum/pesto-rce:edge

docker run -p 50051:50051 -e ENVIRONMENT=production ghcr.io/teknologi-umum/pesto-rce:edge
```

Then, you should set your RCE API URL to `http://localhost:50051`.

Beware that the RCE Docker image is around 4 GB. That being said, it is highly recommended
if you pull the Docker image from a device that have high internet speed. For us, we use
a virtual machine that runs the Docker image, expose it to private Wireguard network,
and call the RCE image through private IP address.
