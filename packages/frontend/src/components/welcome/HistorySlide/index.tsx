import { Swiper, SwiperSlide } from 'swiper/react';

import { WelcomeSlideWrapper } from '../WelcomeSlideWrapper';

import styles from './styles.module.scss';

const HistorySlide = () => {
  return (
    <WelcomeSlideWrapper color="#334044">
      <div className={styles.wrapper}>
        <Swiper
          slidesPerView="auto"
          observeSlideChildren
          observeParents
          observer
          resizeObserver
          watchOverflow
          spaceBetween={10}
        >
          <SwiperSlide className={styles.card}>
            <h2>Сегодня</h2>
            Убежище поддерживается и регулярно обновляется. Часто, при очередном
            Хроническом Обострении Хандры Роботов внезапно появляются новые
            штуки и контент.
          </SwiperSlide>

          <SwiperSlide className={styles.card}>
            <h2>2009</h2>
            Появилась концепция сайта как он есть сейчас. Он был написан на
            примитивных инструментах, популярных в двухтысячные и был
            значительно более населённым.
          </SwiperSlide>
          <SwiperSlide className={styles.card}>
            <h2>2008</h2>
            <p>
              Убежище появилось из идеи создать сайт, посвященный тяжёлой
              музыке. Он должен был называться &laquo;Metal Vault&raquo;.
            </p>
            <p>
              Эта идея не закончилась ничем серьёзным, но именно на него
              переехали блоги и аудитория с предыдущих версий сайта, начавшая
              создавать своё уникальное сообщество.
            </p>
          </SwiperSlide>
          <SwiperSlide className={styles.card}>
            <h2>2006</h2>
            <p>
              Во времена развития локальных сетей сайт назывался сначала
              Blashyrkh и содержал только текстовые записи.
            </p>

            <p>
              Затем он поменял дизайн на более простой и начал называться
              Gotham, сменив тематику на посвященную готической музыке. Именно в
              этот момент он впервые появился в интернете.
            </p>
          </SwiperSlide>
          <SwiperSlide className={styles.card}>
            <h2>2005</h2>

            <p>
              Появилась первая веб-версия сайта. Чтобы попасть на неё, нужно
              было позвонить на один из двух серверов модемом.
            </p>

            <p>
              На сайте хранились файлы, была возможность добавлять тексты и
              сидеть в чате с оператором станции.
            </p>
          </SwiperSlide>
          <SwiperSlide className={styles.card}>
            <h2>2003</h2>

            <p>
              Существовала текстовая версия, которая называлась Private BBS.
            </p>

            <p>
              В те времена инернет был очень дорогим и люди соединяли
              компьютеры, звоня друг другу с помощью модема.
            </p>

            <p>
              Станции, работавшие постоянно, публиковались в еженедельном
              списке, но так же были закрытые станции, номер телефона на которых
              был помечен как &laquo;Private&raquo;
            </p>
          </SwiperSlide>
        </Swiper>
      </div>
    </WelcomeSlideWrapper>
  );
};

export { HistorySlide };
