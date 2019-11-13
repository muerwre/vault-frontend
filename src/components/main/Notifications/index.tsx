import React, { FC, useMemo, useState, useCallback, useEffect } from 'react';
import { Icon } from '~/components/input/Icon';
import styles from './styles.scss';
import { connect } from 'react-redux';
import { selectAuthUpdates, selectAuthUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import classNames from 'classnames';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { NotificationBubble } from '../../notifications/NotificationBubble';
import { INotification, IMessageNotification } from '~/redux/types';

const mapStateToProps = state => ({
  user: pick(['last_seen_messages'], selectAuthUser(state)),
  updates: selectAuthUpdates(state),
});

const mapDispatchToProps = {
  authSetLastSeenMessages: AUTH_ACTIONS.authSetLastSeenMessages,
  authOpenProfile: AUTH_ACTIONS.authOpenProfile,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const NotificationsUnconnected: FC<IProps> = ({
  updates: { last, notifications },
  user: { last_seen_messages },
  authSetLastSeenMessages,
  authOpenProfile,
}) => {
  const [visible, setVisible] = useState(false);
  const has_new = useMemo(
    () =>
      notifications.length &&
      last &&
      Date.parse(last) &&
      (!last_seen_messages ||
        (Date.parse(last_seen_messages) && Date.parse(last) > Date.parse(last_seen_messages))),
    [last, last_seen_messages, notifications]
  );

  const onNotificationClick = useCallback(
    (notification: INotification) => {
      switch (notification.type) {
        case 'message':
          return authOpenProfile(
            (notification as IMessageNotification).content.from.username,
            'messages'
          );
        default:
          return;
      }
    },
    [authOpenProfile]
  );
  const showList = useCallback(() => setVisible(true), [setVisible]);
  const hideList = useCallback(() => setVisible(false), [setVisible]);

  useEffect(() => {
    if (!visible || !has_new || !last) return;
    authSetLastSeenMessages(last);
  }, [visible, last]);

  return (
    <div
      className={classNames(styles.wrap, {
        [styles.is_new]: has_new,
        [styles.active]: notifications.length > 0,
      })}
    >
      <div className={styles.icon} onFocus={showList} onBlur={hideList} tabIndex={-1}>
        {has_new ? <Icon icon="bell_ring" size={24} /> : <Icon icon="bell" size={24} />}
      </div>

      {visible && (
        <NotificationBubble notifications={notifications} onClick={onNotificationClick} />
      )}
    </div>
  );
};

const Notifications = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationsUnconnected);

export { Notifications };
