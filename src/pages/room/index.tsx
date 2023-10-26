import React, { FC } from 'react';

import { InferGetStaticPropsType } from 'next';
import { RouteComponentProps } from 'react-router';

import { RoomLayout } from '~/layouts/RoomLayout';

import { getStaticProps } from '../node/[id]';

type Props = RouteComponentProps<{ id: string }> &
  InferGetStaticPropsType<typeof getStaticProps>;

const RoomPage: FC<Props> = () => <RoomLayout />;

export default RoomPage;
