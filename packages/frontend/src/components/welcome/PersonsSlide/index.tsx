import classNames from 'classnames';

import { Container } from '~/components/common/Container';
import markdown from '~/styles/common/markdown.module.scss';

import { WelcomeSlideWrapper } from '../WelcomeSlideWrapper';

import styles from './styles.module.scss';

const PersonsSlide = () => (
  <WelcomeSlideWrapper color="#333344">
    <Container className={styles.container}>
      <div className={styles.cards}>
        <div className={classNames(styles.card, markdown.wrapper)}>
          <h2>Boris</h2>
          <p>
            Единственный оставшийся ремонтный робот. Круглый, немногословный и
            добродушно-железный.
          </p>
          <p>
            Благодаря своим небольшим размерам и меланхоличному настроению,
            часто бывает замечен в заброшенных секторах Убежища собирающим
            записи, созданные до Катаклизма.
          </p>
        </div>

        <div className={classNames(styles.card, markdown.wrapper)}>
          <h2>Юниты</h2>
          <p>
            Обитатели и персонал Убежища, состоящий из людей, притворяющихся
            роботами и роботов, притворяющихся людьми.
          </p>
          <p>
            Юниты носят одинаковые защитные костюмы и маски, в которых
            выбираются из Убежища для исследования окружающих территорий, поиска
            продовальствия и артефактов.
          </p>
        </div>

        <div className={classNames(styles.card, markdown.wrapper)}>
          <h2>Muro</h2>
          <p>
            Доподлинно неизвестно, является ли Muro одним из юнитов, или группой
            существ, поддерживающих работу Убежища.
          </p>
          <p>
            Бывает замечен в отдалённых коридорах меняющим лампочку или паяющим
            какие-то детальки в очередном щитке.
          </p>
        </div>
      </div>
    </Container>
  </WelcomeSlideWrapper>
);

export { PersonsSlide };
