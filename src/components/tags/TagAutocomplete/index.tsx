import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { connect } from 'react-redux';
import * as TAG_ACTIONS from '~/redux/tag/actions';
import { selectTagAutocomplete } from '~/redux/tag/selectors';
import { separateTagOptions } from '~/utils/tag';
import { TagAutocompleteRow } from '~/components/tags/TagAutocompleteRow';

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
  const [top, setTop] = useState(false);
  const [left, setLeft] = useState(false);

  const [selected, setSelected] = useState(-1);
  const [categories, tags] = useMemo(
    () =>
      separateTagOptions(options.filter(option => option !== search && !exclude.includes(option))),
    [options, search, exclude]
  );
  const scroll = useRef<HTMLDivElement>(null);

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

  const onScroll = useCallback(() => {
    if (!scroll.current) return;
    const { y, height, x, width } = scroll.current.getBoundingClientRect();

    const newTop = window.innerHeight - y - height <= (top ? 120 : 10);
    if (top !== newTop) setTop(newTop);

    const newLeft = x <= 0;
    if (newLeft !== left) setLeft(newLeft);
  }, [scroll.current, top, left]);

  useEffect(() => {
    input.addEventListener('keydown', onKeyDown, false);
    return () => input.removeEventListener('keydown', onKeyDown);
  }, [input, onKeyDown]);

  useEffect(() => {
    setSelected(-1);
    tagLoadAutocomplete(search, exclude);
  }, [search]);

  useEffect(() => {
    tagSetAutocomplete({ options: [] });
    return () => tagSetAutocomplete({ options: [] });
  }, [tagSetAutocomplete]);

  useEffect(() => {
    if (!scroll.current || !scroll.current?.children[selected + 1]) return;
    const el = scroll.current?.children[selected + 1] as HTMLDivElement;
    const { scrollTop, clientHeight } = scroll.current;
    const { offsetTop } = el;

    if (clientHeight - scrollTop + el.clientHeight < offsetTop || offsetTop < scrollTop) {
      scroll.current.scrollTo(0, el.offsetTop - el.clientHeight);
    }
  }, [selected, scroll.current]);

  useEffect(() => {
    onScroll();

    window.addEventListener('resize', onScroll);
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [options]);

  return (
    <div className={classNames(styles.window, { [styles.top]: top, [styles.left]: left })}>
      <div className={styles.scroll} ref={scroll}>
        <TagAutocompleteRow selected={selected === -1} title={search} type="enter" />

        {categories.map((item, i) => (
          <TagAutocompleteRow selected={selected === i} title={item} type="right" key={item} />
        ))}

        {tags.map((item, i) => (
          <TagAutocompleteRow
            selected={selected === categories.length + i}
            title={item}
            type="tag"
            key={item}
          />
        ))}
      </div>
    </div>
  );
};

const TagAutocomplete = connect(mapStateToProps, mapDispatchToProps)(TagAutocompleteUnconnected);

export { TagAutocomplete };
