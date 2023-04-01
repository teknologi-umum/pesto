# Dogfood

Eating your own dog food or "dogfooding" is the practice of using one's own products or services.
This can be a way for an organization to test its products in real-world usage using product management techniques. 
Hence dogfooding can act as quality control, and eventually a kind of testimonial advertising. Once in the market, 
dogfooding can demonstrate developers' confidence in their own products.

Definition was acquired from [Wikipedia](https://en.wikipedia.org/wiki/Eating_your_own_dog_food). But you can
learn more about the term "dogfooding" here:
- https://bubble.io/blog/dogfooding-startup-tech/
- https://maddevs.io/blog/dogfooding/
- https://zapier.com/engineering/api-dogfooding/
- https://blog.airbrake.io/dogfooding-its-great-when-done-right

This part of the code is meant to make sure that the Pesto API (most notably the RCE)
is working as intended from the user perspective.

## Running the tests

Running the tests requires Node.js v18 or higher. Please install that beforehand.

You can do it on Windows, but here's how you can do it on Linux (or POSIX-based):

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
npm run test
```

