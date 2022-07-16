/** @jsx h */
import { h } from "preact";

type FieldListItem = {
  key: string;
  value: string;
  nestedItems?: FieldListItem[];
};

type FieldListProps = {
  items: FieldListItem[];
};

export function FieldList(props: FieldListProps) {
  return (
    <ul class="field-list">
      {props.items.map((item, index) => (
        <li key={index}>
          <strong>{item.key}</strong>: {item.value}
          {item.nestedItems !== undefined && <FieldList items={item.nestedItems} />}
        </li>
      ))}
    </ul>
  );
}
