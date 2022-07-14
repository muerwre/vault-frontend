import { FC } from 'react';

import { useRouter } from 'next/router';

import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { Dialog } from '~/constants/modal';
import { URLS } from '~/constants/urls';
import { useShowModal } from '~/hooks/modal/useShowModal';

import styles from './styles.module.scss';

interface BorisSuperpowersProps { }



const BorisSuperpowers: FC<BorisSuperpowersProps> = () => {
    const openProfileSidebar = useShowModal(Dialog.ProfileSidebar);
    const { push } = useRouter();

    return (
        <Group>
            <h2>Штучи, находящиеся в разработке</h2>

            <div className={styles.grid}>
                <Button size="mini" onClick={() => openProfileSidebar({})}>Открыть</Button>
                <div className={styles.label}>Профиль в сайдбаре</div>

                <Button size="mini" onClick={() => push(URLS.SETTINGS.BASE)}>Открыть</Button>
                <div className={styles.label}>Профиль на отдельной странице</div>
            </div>
        </Group>
    );
}

export default BorisSuperpowers;
