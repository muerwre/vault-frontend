import React, { VFC } from 'react';

import { Icon } from '~/components/common/Icon';
import { InputText, InputTextProps } from '~/components/input/InputText';

interface SearchInputProps extends Omit<InputTextProps, 'prefix' | 'suffix'> {}

const SearchInput: VFC<SearchInputProps> = ({ ...props }) => (
  <InputText {...props} prefix={<Icon icon="search" />} />
);

export { SearchInput };
