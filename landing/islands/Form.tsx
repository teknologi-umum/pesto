/** @jsx h */
import { h } from "preact";
import { useReducer, useState } from "preact/hooks";

type FormValues = {
  name: string;
  email: string;
  building: string;
  calls: number;
};

type Action = {
  name: string;
  value: string | number;
};

export default function Form() {
  const [isError, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [formState, updateForm] = useReducer<FormValues, Action>(
    (state, action) => ({ ...state, [action.name]: action.value }),
    {
      name: "",
      email: "",
      building: "",
      calls: 0,
    },
  );

  async function handleSubmit(
    event: h.JSX.TargetedEvent<HTMLFormElement, Event>,
  ) {
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
          throw new Error(
            "Internal Server Error This shouldn't be happening. Please report to our Github Issue page",
          );
        }
        if (response.status === 400) {
          throw new Error(
            "Invalid request payload. Please double check your form before submitting",
          );
        }
        if (response.status === 404) {
          throw new Error(
            "Invalid registration endpoint. This shouldn't be happening. Please report to our Github Issue page",
          );
        }
        if (response.status === 409) {
          throw new Error(
            "User with this email is already registered. Try again with another email",
          );
        }
        throw new Error("Unknown error");
      }

      setError(false);
      setMessage(
        "Successfully requested an API key. Please wait for a response from us.",
      );
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
        onChange={updateForm}
      />
      <FormField
        label="Email"
        placeholder="We'll send your token to this email"
        name="email"
        type="email"
        onChange={updateForm}
      />
      <FormField
        label="What do you want to build"
        placeholder="We'd love to know what you'll be building using Pesto"
        name="building"
        type="text"
        onChange={updateForm}
      />
      <FormField
        label="How many requests/month"
        placeholder="Should be a reasonable amount"
        name="calls"
        type="number"
        onChange={updateForm}
      />
      <div className="field">
        <p class={`message ${isError ? "error" : "success"}`}>{message}</p>
      </div>
      <div class="field">
        <button class="button" type="submit" disabled={isLoading}>
          {isLoading ? "Requesting..." : "Request A Key"}
        </button>
      </div>
    </form>
  );
}

type FormFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "number";
  onChange: (action: Action) => void;
};

function FormField(props: FormFieldProps) {
  return (
    <div class="field">
      <label class="label">{props.label}</label>
      <input
        class="input"
        type={props.type}
        autocomplete="off"
        required
        placeholder={props.placeholder}
        onChange={(e) =>
          props.onChange({
            name: props.name,
            value: props.type === "number" ? e.currentTarget.valueAsNumber : e.currentTarget.value,
          })}
      />
    </div>
  );
}
