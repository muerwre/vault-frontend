import React, {
  FC,
  HTMLAttributes,
  useState,
  useCallback,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  useRef
} from "react";
import { TagField } from "~/components/containers/TagField";
import { ITag } from "~/redux/types";
import { Tag } from "~/components/node/Tag";
import uniq from "ramda/es/uniq";

type IProps = HTMLAttributes<HTMLDivElement> & {
  tags: Partial<ITag>[];
  is_editable?: boolean;
  onTagsChange?: (tags: string[]) => void;
};

export const Tags: FC<IProps> = ({
  tags,
  is_editable,
  onTagsChange,
  ...props
}) => {
  const [input, setInput] = useState("");
  const [data, setData] = useState([]);
  const timer = useRef(null);

  const onInput = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      clearTimeout(timer.current);
      setInput(value);
    },
    [setInput, timer]
  );

  const onKeyUp = useCallback(
    ({ key }: KeyboardEvent) => {
      if (key === "Backspace" && input === "" && data.length) {
        setData(data.slice(0, data.length - 1));
        setInput(data[data.length - 1].title);
      }

      if (key === "Enter" || key === "," || key === "Comma") {
        setData(
          uniq([
            ...data,
            ...input
              .split(",")
              .map((title: string) =>
                title
                  .trim()
                  .substr(0, 32)
                  .toLowerCase()
              )
              .filter(el => el.length > 0)
              .filter(el => !tags.some(tag => tag.title.trim() === el.trim()))
              .map(title => ({
                title
              }))
          ])
        );
        setInput("");
      }
    },
    [input, setInput, data, setData]
  );

  const onSubmit = useCallback(() => {
    const title = input && input.trim();
    const items = title ? [...data, { title }] : data;

    if (!items.length) return;
    setData(items);
    setInput("");
    onTagsChange(uniq([...tags, ...items]).map(tag => tag.title));
  }, [tags, data, onTagsChange, input, setInput]);

  useEffect(() => {
    setData(
      data.filter(
        ({ title }) => !tags.some(tag => tag.title.trim() === title.trim())
      )
    );
  }, [tags]);

  return (
    <TagField {...props}>
      {tags.map(tag => (
        <Tag key={tag.title} tag={tag} />
      ))}

      {data.map(tag => (
        <Tag key={tag.title} tag={tag} />
      ))}

      {is_editable && (
        <Tag
          tag={{ title: input }}
          onInput={onInput}
          onKeyUp={onKeyUp}
          onBlur={onSubmit}
        />
      )}
    </TagField>
  );
};
