import { TFunction } from 'i18next';
import { Button } from 'carbon-components-react';
import { ChevronDown16, ChevronUp16 } from '@carbon/icons-react';
import * as React from 'react';

export interface ExpandCollapseButtonProps {
  readonly collapsed: boolean;
  readonly t: TFunction;
  readonly onClick: () => void;
}

export function ExpandCollapseButton(props: ExpandCollapseButtonProps) {
  return (
    <Button
      kind={'ghost'}
      renderIcon={props.collapsed ? ChevronUp16 : ChevronDown16}
      iconDescription={props.t(
        props.collapsed ? 'icon.expand' : 'icon.collapse',
      )}
      // disabled={disabled}
      size={'sm'}
      tooltipPosition={'right'}
      hasIconOnly={true}
      onClick={props.onClick}
    />
  );
}
