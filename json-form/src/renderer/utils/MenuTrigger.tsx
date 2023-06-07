import { TFunction } from 'i18next';
import { Button } from 'carbon-components-react';
import { OverflowMenuVertical16 } from '@carbon/icons-react';
import * as React from 'react';

export interface MenuTriggerProps {
  readonly onClick: () => void;
  readonly disabled: boolean;
  readonly t: TFunction;
}

export function MenuTrigger(props: MenuTriggerProps) {
  const { disabled, onClick, t } = props;
  return (
    <Button
      iconDescription={t('icon.openMenu')}
      disabled={disabled}
      size={'sm'}
      kind={'ghost'}
      renderIcon={OverflowMenuVertical16}
      tooltipPosition={'left'}
      hasIconOnly={true}
      onClick={onClick}
    />
  );
}
