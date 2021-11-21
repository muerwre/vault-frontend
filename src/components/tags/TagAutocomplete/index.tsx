import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as TAG_ACTIONS from '~/redux/tag/actions';
import { selectTagAutocomplete } from '~/redux/tag/selectors';
import { separateTagOptions } from '~/utils/tag';
import { TagAutocompleteRow } from '~/components/tags/TagAutocompleteRow';
import { usePopper } from 'react-popper';

const mapStateToProps = selectTagAutocomplete;
const mapDispatchToProps = {
  tagSetAutocomplete: TAG_ACTIONS.tagSetAutocomplete,
  tagLoadAutocomplete: TAG_ACTIONS.tagLoadAutocomplete,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    exclude: string[];
    input: HTMLInputElement;
    onSelect: (val: string) => void;
    search: string;
  };

const TagAutocompleteUnconnected: FC<Props> = ({
  exclude,
  input,
  onSelect,
  search,
  tagSetAutocomplete,
  tagLoadAutocomplete,
  options,
}) => {
  const [selected, setSelected] = useState(-1);
  const [categories, tags] = useMemo(
    () =>
      separateTagOptions(
        options.slice(0, 7).filter(option => option !== search && !exclude.includes(option))
      ),
    [options, search, exclude]
  );
  const scroll = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  const pop = usePopper(wrapper?.current?.parentElement, wrapper.current, {
    placement: 'bottom-end',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });

  const onKeyDown = useCallback(
    event => {
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
    [setSelected, selected, categories, tags, onSelect, search]
  );

  useEffect(() => {
    input.addEventListener('keydown', onKeyDown, false);
    return () => input.removeEventListener('keydown', onKeyDown);
  }, [input, onKeyDown]);

  useEffect(() => {
    setSelected(-1);
    tagLoadAutocomplete(search, exclude);
  }, [exclude, search, tagLoadAutocomplete]);

  useEffect(() => {
    tagSetAutocomplete({ options: [] });

    return () => {
      tagSetAutocomplete({ options: [] });
    };
  }, [tagSetAutocomplete]);

  useEffect(() => {
    if (!scroll.current || !scroll.current?.children[selected + 1]) return;
    const el = scroll.current?.children[selected + 1] as HTMLDivElement;
    const { scrollTop, clientHeight } = scroll.current;
    const { offsetTop } = el;

    if (clientHeight - scrollTop + el.clientHeight < offsetTop || offsetTop < scrollTop) {
      scroll.current.scrollTo(0, el.offsetTop - el.clientHeight);
    }
  }, [selected]);

  return (
    <div
      className={classNames(styles.window)}
      ref={wrapper}
      style={pop.styles.popper}
      {...pop.attributes.popper}
    >
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

const TagAutocomplete = connect(mapStateToProps, mapDispatchToProps)(TagAutocompleteUnconnected);

export { TagAutocomplete };
