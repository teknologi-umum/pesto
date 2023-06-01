# Contribution Guide

Pesto will not be alive without the active contribution from the open source community.
If you are interested on contributing to Pesto to make it better, we are so thankful of you.

Contributing means anything from reporting bugs, submitting new ideas, code fix, implement
a new language, new feature, or even fix some typos on documentation. This document provides
a guide to help you navigate through what you could give you hands on.

If you are 100% new to Github, you can go to Google or Youtube and lookup about how to use and
collaborate with people in Github. Some of our favorites are:

* [Git It? How to use Git and Github](https://www.youtube.com/watch?v=HkdAHXoRtos) by Fireship (Youtube)
* [Git and GitHub for Beginners - Crash Course](https://www.youtube.com/watch?v=RGOj5yH7evk) by freeCodeCamp.org (
  Youtube)
* [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/) by Open Source Guide (article)
* [Learn Git & GitHub](https://www.codecademy.com/learn/learn-git) by Codecademy (Paid online course)

To keep a healthy community, please adhere to the [Code of Conduct](./.github/CODE_OF_CONDUCT.md).

## Tell the world you're using Pesto!

This is the easiest contribution you can do, by spreading the word!

If you are using Pesto API on your project, please add your project to the [Who uses Pesto](./README.md#who-uses-pesto)
section on our README file.

Otherwise, you can create an article on Medium or Dev.to about how you utilize Pesto's API on
your project and how it came to be.

## Report a bug

Please submit [an issue](https://github.com/teknologi-umum/pesto/issues/new/choose) or check
whether the bug has already been reported on the [issue list](https://github.com/teknologi-umum/pesto/issues).

If it's not resolved yet, you can bump the issue by adding a new comment.

Letting us to know that there are bugs makes us happy, because someone is actually using our API.

## Propose new ideas

It's not just for merely ideas, but if you have any needs or enhancement for our API, feel free to
let us know by creating [an issue](https://github.com/teknologi-umum/pesto/issues/new/choose) or check
whether the idea has already been proposed on the [issue list](https://github.com/teknologi-umum/pesto/issues).

## Documentation

This is basically the hardest contribution you can do, because writing technical or non-technical documentation
is always a challenge for us developers.

You can help by documenting everything. Create how-tos, create in-code documentation (what the function does, why X is
here, etc), or even fixing some typos (including some that may exist on this document). But, please bear in mind that
documentation should be easy to understand (by using simple English) and should be accessible to everyone.
You don't want people to ask you over and over again for something that only some people understand.

## Code contribution (bug fix, new feature)

Finally, this is what most developers can help, by code.

We use multiple programming language to bring Pesto to life. Please read each README on the submodule that
you are interested in to have detailed explanation on how to contribute to each specific module.

All services (or modules) are deployed on a cloud VPS using Docker. The Docker images are built on GitHub Actions and
pushed to the Github Contianer Registry. On each commit push to master, it will trigger a deployment action that will
SSH to the VPS and trigger a pull for new image.

We are waiting for your contribution!