import pytest
from os import getenv
import pesto

should_skip: bool = not getenv("PESTO_TOKEN")


@pytest.mark.skipif(should_skip, reason="Requires PESTO_TOKEN environment variable")
def test_real_ping():
    client = pesto.Client(token=getenv("PESTO_TOKEN"))
    response = client.ping()
    assert response.message == "OK"


@pytest.mark.skipif(should_skip, reason="Requires PESTO_TOKEN environment variable")
def test_real_list_runtimes():
    client = pesto.Client(token=getenv("PESTO_TOKEN"))
    response = client.list_runtimes()
    assert len(response.runtimes) > 0


@pytest.mark.skipif(should_skip, reason="Requires PESTO_TOKEN environment variable")
def test_execute_request():
    client = pesto.Client(token=getenv("PESTO_TOKEN"))
    response = client.execute(
        pesto.CodeRequest(
            language="Python",
            version="latest",
            files=[
                pesto.File(
                    filename="code.py", code="print('Hello world!')", entrypoint=True
                )
            ],
        )
    )

    assert response.language == "Python"
    assert response.runtime_output.exit_code == 0
    assert response.runtime_output.output == "Hello world!\n"


@pytest.mark.skipif(should_skip, reason="Requires PESTO_TOKEN environment variable")
def test_should_raise_runtime_not_found():
    client = pesto.Client(token=getenv("PESTO_TOKEN"))
    with pytest.raises(pesto.RuntimeNotFoundError) as e_execute:
        _ = client.execute(
            pesto.CodeRequest(
                language="SomeUnknownLanguage",
                version="100",
                files=[
                    pesto.File(
                        filename="code.py",
                        code="print('Hello world!')",
                        entrypoint=True,
                    )
                ],
            )
        )

    assert e_execute.type == pesto.RuntimeNotFoundError


@pytest.mark.skipif(should_skip, reason="Requires PESTO_TOKEN environment variable")
def test_should_raise_token_not_registered():
    client = pesto.Client(token="invalidToken")
    with pytest.raises(pesto.TokenNotRegisteredError) as e_execute:
        _ = client.execute(
            pesto.CodeRequest(
                language="Python",
                version="latest",
                files=[
                    pesto.File(
                        filename="code.py",
                        code="print('Hello world!')",
                        entrypoint=True,
                    )
                ],
            )
        )

    assert e_execute.type == pesto.TokenNotRegisteredError
