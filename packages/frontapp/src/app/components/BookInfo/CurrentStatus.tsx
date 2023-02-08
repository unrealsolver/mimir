import React, { FC } from 'react';
import { StatusType } from './index';
import StatusBadge from '../StatusBadge';
import { t } from 'i18next';

interface ICurrentStatus {
  status: StatusType;
}

export const CurrentStatus: FC<ICurrentStatus> = ({ status }) => {
  switch (status.status) {
    case 'Free':
      return <StatusBadge type="success">{t('Statuses.Accepted')}</StatusBadge>;
    case 'Rejected':
      return <StatusBadge type="danger">{t('Statuses.Rejected')}</StatusBadge>;
    case 'Pending':
      return <StatusBadge type="warning">{status.status}</StatusBadge>;
    default:
      return <StatusBadge type="default">{status.status}</StatusBadge>;
  }
};
