import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { FormField } from "./FormField";
import { Button } from "~/components/Button";
import "./form.scss";

type FormValues = {
	name: string;
	email: string;
	building: string;
	calls: number;
};

export function Form() {
	const [isError, setError] = createSignal(false);
	const [message, setMessage] = createSignal("");
	const [isLoading, setLoading] = createSignal(false);
	const [formState, updateForm] = createStore<FormValues>({
		name: "",
		email: "",
		building: "",
		calls: 0,
	});

	async function handleSubmit(event) {
		event.preventDefault();
		setLoading(true);
		setMessage("");

		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formState),
			});

			if (!response.ok) {
				if (response.status === 500) {
					throw new Error("Internal Server Error This shouldn't be happening. Please report to our Github Issue page");
				}
				if (response.status === 400) {
					throw new Error("Invalid request payload. Please double check your form before submitting");
				}
				if (response.status === 404) {
					throw new Error(
						"Invalid registration endpoint. This shouldn't be happening. Please report to our Github Issue page"
					);
				}
				if (response.status === 409) {
					throw new Error("User with this email is already registered. Try again with another email");
				}
				throw new Error("Unknown error");
			}

			setError(false);
			setMessage("Successfully requested an API key. Please wait for a response from us.");
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(true);
				setMessage(err.message);
			}
		}

		setLoading(false);
	}

	return (
		<form class="form" onSubmit={handleSubmit}>
			<FormField
				label="Name"
				placeholder="So we know who you are"
				name="name"
				type="text"
				onChange={(value) => updateForm({ name: value })}
			/>
			<FormField
				label="Email"
				placeholder="We'll send your token to this email"
				name="email"
				type="email"
				onChange={(value) => updateForm({ email: value })}
			/>
			<FormField
				label="What do you want to build"
				placeholder="We'd love to know what you'll be building using Pesto"
				name="building"
				type="text"
				onChange={(value) => updateForm({ building: value })}
			/>
			<FormField
				label="How many requests/month"
				placeholder="Should be a reasonable amount"
				name="calls"
				type="number"
				onChange={(value) => updateForm({ calls: parseInt(value) })}
			/>
			<div className="field">
				<p class={`message ${isError() ? "error" : "success"}`}>{message()}</p>
			</div>
			<div class="field">
				<Button isDisabled={isLoading()} variant="pale-red">
					{isLoading() ? "Requesting..." : "Request A Key"}
				</Button>
			</div>
		</form>
	);
}
