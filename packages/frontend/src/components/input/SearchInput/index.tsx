import { VFC } from 'react';

import { SearchIcon } from 'lucide-react';

import { InputText, InputTextProps } from '~/components/input/InputText';

interface SearchInputProps extends Omit<InputTextProps, 'prefix' | 'suffix'> {}

const SearchInput: VFC<SearchInputProps> = ({ ...props }) => (
  <InputText {...props} prefix={<SearchIcon size={18} />} />
);

export { SearchInput };
