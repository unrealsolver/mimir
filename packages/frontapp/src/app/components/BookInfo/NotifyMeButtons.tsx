import { FC } from 'react';
import { StyledButton } from './index';
import { ReactComponent as EnableNotifySvg } from '../../../assets/NoNotification.svg';
import { ReactComponent as CancelNotifySvg } from '../../../assets/CancelNotification.svg';
import { t } from 'i18next';

interface IControl {
  isUserSubscriber: boolean;
  onSubscribe: () => void;
  onCancel: () => void;
}

export const NotifyMeButtons: FC<IControl> = ({
  onSubscribe,
  onCancel,
  isUserSubscriber,
}) => {
  return !isUserSubscriber ? (
    <StyledButton
      value={t('DonateItem.Buttons.Notify')}
      onClick={onSubscribe}
      svgComponent={<EnableNotifySvg />}
    />
  ) : (
    <StyledButton
      value={t('Cancel')}
      onClick={onCancel}
      svgComponent={<CancelNotifySvg />}
      transparent
    />
  );
};
