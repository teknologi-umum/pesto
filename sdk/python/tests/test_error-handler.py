import pytest
import responses
import pesto


@responses.activate
def test_path_notfound():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping", json={}, status=404
    )
    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/list-runtimes", json={}, status=404
    )
    responses.post(
        url="http://mock-pesto.teknologiumum.com/api/execute", json={}, status=404
    )

    with pytest.raises(Exception) as e_ping:
        client.ping()

    assert e_ping.type == Exception
    assert e_ping.value.args[0] == "api path not found"

    with pytest.raises(Exception) as e_list_runtimes:
        client.list_runtimes()

    assert e_list_runtimes.type == Exception
    assert e_list_runtimes.value.args[0] == "api path not found"

    with pytest.raises(Exception) as e_execute:
        client.execute(pesto.CodeRequest("", "", []))

    assert e_execute.type == Exception
    assert e_execute.value.args[0] == "api path not found"


@responses.activate
def test_internal_server_error():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Something went wrong"},
        status=500,
    )

    with pytest.raises(pesto.InternalServerError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.InternalServerError
    assert e_ping.value.args[0] == "Something went wrong"


@responses.activate
def test_missing_token_error():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Token must be supplied"},
        status=401,
    )

    with pytest.raises(pesto.MissingTokenError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.MissingTokenError


@responses.activate
def test_token_not_registered_error():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Token not registered"},
        status=401,
    )

    with pytest.raises(pesto.TokenNotRegisteredError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.TokenNotRegisteredError


@responses.activate
def test_token_revoked_error():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Token has been revoked"},
        status=401,
    )

    with pytest.raises(pesto.TokenRevokedError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.TokenRevokedError


@responses.activate
def test_monthly_limit_exceeded():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Monthly limit exceeded"},
        status=429,
    )

    with pytest.raises(pesto.MonthlyLimitExceededError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.MonthlyLimitExceededError


@responses.activate
def test_server_rate_limited():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping", json={}, status=429
    )

    with pytest.raises(pesto.ServerRateLimitedError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.ServerRateLimitedError


@responses.activate
def test_runtime_not_found():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Runtime not found"},
        status=400,
    )

    with pytest.raises(pesto.RuntimeNotFoundError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.RuntimeNotFoundError


@responses.activate
def test_missing_parameters():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "Missing parameters: code"},
        status=400,
    )

    with pytest.raises(pesto.MissingParameterError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.MissingParameterError
    assert e_ping.value.args[0] == "Missing parameters: code"


@responses.activate
def test_maximum_allowed_entrypoints_exceeded():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={
            "message": "Maximum allowed entrypoint exceeded: expecting one, got three"
        },
        status=400,
    )

    with pytest.raises(pesto.MaximumAllowedEntrypointsExceededError) as e_ping:
        client.ping()

    assert e_ping.type == pesto.MaximumAllowedEntrypointsExceededError
    assert (
        e_ping.value.args[0]
        == "Maximum allowed entrypoint exceeded: expecting one, got three"
    )


@responses.activate
def test_problem_with_sdk():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping",
        json={"message": "You got that wrong!"},
        status=400,
    )

    with pytest.raises(Exception) as e_ping:
        client.ping()

    assert e_ping.type == Exception
    assert (
        e_ping.value.args[0]
        == "You got that wrong! (this is probably a problem with the SDK, please submit an issue on our Github repository)"
    )


@responses.activate
def test_unknown_code():
    client = pesto.Client(
        token="testing", base_url="http://mock-pesto.teknologiumum.com"
    )

    responses.get(
        url="http://mock-pesto.teknologiumum.com/api/ping", json={}, status=514
    )

    with pytest.raises(Exception) as e_ping:
        client.ping()

    assert e_ping.type == Exception
    assert (
        e_ping.value.args[0]
        == "received code 514: None (this is probably a problem with the SDK, please submit an issue on our Github repository)"
    )
