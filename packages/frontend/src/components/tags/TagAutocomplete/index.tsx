import { useCallback, useEffect, useMemo, useRef, useState, VFC } from 'react';

import classNames from 'classnames';
import { usePopper } from 'react-popper';

import { TagAutocompleteRow } from '~/components/tags/TagAutocompleteRow';
import { separateTagOptions } from '~/utils/tag';

import styles from './styles.module.scss';

interface TagAutocompleteProps {
  exclude: string[];
  input: HTMLInputElement;
  onSelect: (val: string) => void;
  search: string;
  options: string[];
  visible: boolean;
}

const TagAutocomplete: VFC<TagAutocompleteProps> = ({
  exclude,
  input,
  onSelect,
  search,
  options,
  visible,
}) => {
  const [selected, setSelected] = useState(-1);
  const [categories, tags] = useMemo(
    () =>
      separateTagOptions(
        options
          .slice(0, 7)
          .filter((option) => option !== search && !exclude.includes(option)),
      ),
    [options, search, exclude],
  );
  const scroll = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);

  const pop = usePopper(wrapper?.current?.parentElement, wrapper.current, {
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      {
        name: 'offset',
        options: {
          offset: [0, 10],
        },
      },
    ],
  });

  const onKeyDown = useCallback(
    (event) => {
      pop?.update?.();

      const all = [...categories, ...tags];

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelected(selected < all.length - 1 ? selected + 1 : -1);
          return;
        case 'ArrowUp':
          event.preventDefault();
          setSelected(selected > -1 ? selected - 1 : all.length - 1);
          return;
        case 'Enter':
          event.preventDefault();
          onSelect(selected >= 0 ? all[selected] : search);
      }
    },
    [pop, categories, tags, selected, onSelect, search],
  );

  useEffect(() => {
    input.addEventListener('keydown', onKeyDown, false);
    return () => input.removeEventListener('keydown', onKeyDown);
  }, [input, onKeyDown]);

  useEffect(() => {
    if (!scroll.current || !scroll.current?.children[selected + 1]) return;
    const el = scroll.current?.children[selected + 1] as HTMLDivElement;
    const { scrollTop, clientHeight } = scroll.current;
    const { offsetTop } = el;

    if (
      clientHeight - scrollTop + el.clientHeight < offsetTop ||
      offsetTop < scrollTop
    ) {
      scroll.current.scrollTo(0, el.offsetTop - el.clientHeight);
    }
  }, [selected]);

  return (
    <div
      className={classNames(styles.window, { [styles.visible]: visible })}
      ref={wrapper}
      style={pop.styles.popper}
      {...pop.attributes.popper}
    >
      <div
        style={pop.styles.arrow}
        ref={setArrowElement}
        className={styles.arrow}
      />
      <div className={styles.scroll} ref={scroll}>
        <TagAutocompleteRow
          selected={selected === -1}
          title={search}
          type="enter"
          onSelect={onSelect}
        />

        {categories.map((item, i) => (
          <TagAutocompleteRow
            selected={selected === i}
            title={item}
            type="right"
            key={item}
            onSelect={onSelect}
          />
        ))}

        {tags.map((item, i) => (
          <TagAutocompleteRow
            selected={selected === categories.length + i}
            title={item}
            type="tag"
            key={item}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export { TagAutocomplete };
