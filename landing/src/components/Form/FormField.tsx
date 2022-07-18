type FormFieldProps = {
	name: string;
	label: string;
	placeholder: string;
	type: "text" | "email" | "number";
	onChange: (value: string) => void;
};

export function FormField(props: FormFieldProps) {
	return (
		<div class="field">
			<label class="label">{props.label}</label>
			<input
				class="input"
				type={props.type}
				autocomplete="off"
				required
				placeholder={props.placeholder}
				onChange={(e: InputEvent) => props.onChange((e.currentTarget as HTMLInputElement).value)}
			/>
		</div>
	);
}
