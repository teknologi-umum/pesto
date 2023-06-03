#!/usr/bin/env python

"""
Pesto SDK for Python
"""

import os
from typing import Sequence
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))


def get_file_text(file_name):
    with open(os.path.join(here, file_name)) as in_file:
        return in_file.read()


def get_requirements(filename: str) -> Sequence[str]:
    with open(filename) as fp:
        return [x.strip() for x in fp if not x.startswith("#")]


setup(
    name="pesto-sdk",
    packages=find_packages(),
    version="0.0.0",
    author="Teknologi Umum",
    author_email="opensource@teknologiumum.com",
    project_urls={
        "Documentation": "https://github.com/teknologi-umum/pesto",
    },
    description="Pesto SDK for Python",
    long_description=get_file_text("README.md"),
    long_description_content_type="text/markdown",
    license="Apache-2.0",
    python_requires=">=3.7",
    install_requires=get_requirements("requirements.txt"),
    tests_require=get_requirements("requirements-test.txt"),
)
