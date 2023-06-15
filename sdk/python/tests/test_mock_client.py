import responses
from pesto import Client, CodeRequest, File


@responses.activate
def test_client_ping():
    client = Client(token="testing", base_url="http://mock-pesto.teknologiumum.com")

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "ok"},
        status=200,
    )

    ping_response = client.ping()

    assert ping_response.message == "ok"


@responses.activate
def test_client_list_runtimes():
    client = Client(token="testing", base_url="http://mock-pesto.teknologiumum.com")

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/list-runtimes",
        json={
            "runtime": [
                {
                    "language": "Go",
                    "aliases": ["go", "golang"],
                    "version": "1.18.2",
                    "compiled": True,
                },
                {
                    "language": "Java",
                    "aliases": ["java"],
                    "version": "19",
                    "compiled": True,
                },
                {
                    "language": "Typescript",
                    "aliases": ["typescript", "ts"],
                    "version": "4.9",
                    "compiled": False,
                },
            ]
        },
        status=200,
    )

    runtime_response = client.list_runtimes()

    assert len(runtime_response.runtimes) == 3
    if len(runtime_response.runtimes) > 0:
        assert runtime_response.runtimes[0].language == "Go"
        assert runtime_response.runtimes[0].aliases == ["go", "golang"]
        assert runtime_response.runtimes[0].version == "1.18.2"
        assert runtime_response.runtimes[0].compiled == True
    if len(runtime_response.runtimes) > 1:
        assert runtime_response.runtimes[1].language == "Java"
        assert runtime_response.runtimes[1].aliases == ["java"]
        assert runtime_response.runtimes[1].version == "19"
        assert runtime_response.runtimes[1].compiled == True
    if len(runtime_response.runtimes) > 2:
        assert runtime_response.runtimes[2].language == "Typescript"
        assert runtime_response.runtimes[2].aliases == ["typescript", "ts"]
        assert runtime_response.runtimes[2].version == "4.9"
        assert runtime_response.runtimes[2].compiled == False


@responses.activate
def test_client_execute():
    client = Client(token="testing", base_url="http://mock-pesto.teknologiumum.com")

    responses.post(
        url="http://mock-pesto.teknologiumum.com/api/execute",
        json={
            "language": "Python",
            "version": "3.10.2",
            "compile": {"stdout": "", "stderr": "", "output": "", "exitCode": 0},
            "runtime": {
                "stdout": "Hello World",
                "stderr": "",
                "output": "Hello World",
                "exitCode": 0,
            },
        },
        status=200,
    )

    execute_response = client.execute(
        CodeRequest(
            language="Python",
            version="3.10.2",
            files=[
                File(filename="code.py", code="print('Hello World')", entrypoint=True)
            ],
        )
    )

    assert execute_response.language == "Python"
    assert execute_response.version == "3.10.2"
    assert execute_response.compile_output.stderr == ""
    assert execute_response.compile_output.stdout == ""
    assert execute_response.compile_output.output == ""
    assert execute_response.compile_output.exit_code == 0
    assert execute_response.runtime_output.stderr == ""
    assert execute_response.runtime_output.stdout == "Hello World"
    assert execute_response.runtime_output.output == "Hello World"
    assert execute_response.runtime_output.exit_code == 0
