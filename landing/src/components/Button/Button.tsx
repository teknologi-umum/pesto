import type { JSX } from "solid-js";
import "./button.scss";

type ButtonProps = {
	href?: string;
	variant: "green" | "yellow-green" | "pale-red";
	isDisabled?: boolean;
	children?: JSX.Element;
};

export function Button(props: ButtonProps) {
	if (props.href !== undefined) {
		return (
			<a class={`button ${props.variant}`} href={props.href}>
				{props.children}
			</a>
		);
	}

	return (
		<button class={`button ${props.variant}`} type="submit" disabled={props.isDisabled}>
			{props.children}
		</button>
	);
}
