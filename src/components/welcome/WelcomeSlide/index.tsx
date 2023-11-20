import { FC } from 'react';

import classNames from 'classnames';

import { Filler } from '~/components/common/Filler';
import { Container } from '~/containers/main/Container';
import { useAuth } from '~/hooks/auth/useAuth';
import markdown from '~/styles/common/markdown.module.scss';

import { WelcomeSlideWrapper } from '../WelcomeSlideWrapper';

import styles from './styles.module.scss';

interface WelcomeSlideProps {}

const WelcomeSlide: FC<WelcomeSlideProps> = () => {
  const { isUser } = useAuth();
  return (
    <WelcomeSlideWrapper color="#403344">
      <Container className={styles.wrap}>
        <div className={styles.content}>
          <Filler />
          <div className={classNames(markdown.wrapper, styles.left)}>
            <h1>Добро пожаловать!</h1>

            <p>
              <strong>Убежище</strong> - небольшой коллективный блог из глубин
              интернета. Нашу тематику можно описать как{' '}
              <strong>
                меланхоличное исследование мира вокруг и внутри себя
              </strong>
              .
            </p>

            <p>
              Мы существуем уже 13 лет, поэтому здесь можно увидеть и посты с
              подростковой хандрой, и со старческим брюзжанием, доносящимся со
              стороны кресла у камина.
            </p>

            {!isUser && (
              <p>
                Регистрация открыта, поэтому не стесняйся, заходи, устраивайся
                поудобнее.
              </p>
            )}
          </div>
          <Filler />
        </div>
      </Container>
    </WelcomeSlideWrapper>
  );
};

export { WelcomeSlide };
