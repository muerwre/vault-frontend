import React, { FC, useMemo, useState, useCallback, useEffect } from 'react';
import { Icon } from '~/components/input/Icon';
import styles from './styles.scss';
import { connect } from 'react-redux';
import { selectAuthUpdates, selectAuthUser } from '~/redux/auth/selectors';
import pick from 'ramda/es/pick';
import classNames from 'classnames';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { NotificationBubble } from '../../notifications/NotificationBubble';

const mapStateToProps = state => ({
  user: pick(['last_seen_messages'], selectAuthUser(state)),
  updates: selectAuthUpdates(state),
});

const mapDispatchToProps = {
  authSetLastSeenMessages: AUTH_ACTIONS.authSetLastSeenMessages,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const NotificationsUnconnected: FC<IProps> = ({
  updates: { last, notifications },
  user: { last_seen_messages },
  authSetLastSeenMessages,
}) => {
  const [visible, setVisible] = useState(true);
  const has_new = useMemo(
    () =>
      notifications.length &&
      last &&
      Date.parse(last) &&
      (!last_seen_messages ||
        (Date.parse(last_seen_messages) && Date.parse(last) > Date.parse(last_seen_messages))),
    [last, last_seen_messages, notifications]
  );

  useEffect(() => {
    if (!visible || !has_new) return;
    authSetLastSeenMessages(new Date().toISOString());
  }, [visible]);

  const showList = useCallback(() => setVisible(true), [setVisible]);
  const hideList = useCallback(() => setVisible(false), [setVisible]);

  return (
    <div className={classNames(styles.wrap, { [styles.is_new]: has_new })}>
      <div className={styles.icon} onFocus={showList} onBlur={hideList} tabIndex={-1}>
        {has_new ? <Icon icon="bell_ring" size={24} /> : <Icon icon="bell" size={24} />}
      </div>

      {visible && <NotificationBubble notifications={notifications} />}
    </div>
  );
};

const Notifications = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationsUnconnected);

export { Notifications };