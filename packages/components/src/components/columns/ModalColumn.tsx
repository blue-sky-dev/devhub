import React, { useEffect, useRef } from 'react'

import { ModalPayload } from '@devhub/core'
import { NativeComponent } from 'react-native'
import { useReduxAction } from '../../hooks/use-redux-action'
import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { contentPadding } from '../../styles/variables'
import { findNode, tryFocus } from '../../utils/helpers/shared'
import { Spacer } from '../common/Spacer'
import { keyboardShortcutsById } from '../modals/KeyboardShortcutsModal'
import { Column } from './Column'
import { ColumnHeader } from './ColumnHeader'
import { ColumnHeaderItem, ColumnHeaderItemProps } from './ColumnHeaderItem'

export interface ModalColumnProps
  extends Omit<
    ColumnHeaderItemProps,
    'analyticsAction' | 'analyticsLabel' | 'tooltip'
  > {
  name: ModalPayload['name']
  hideCloseButton?: boolean
  right?: React.ReactNode
  showBackButton: boolean
}

export const ModalColumn = React.memo((props: ModalColumnProps) => {
  const {
    children,
    hideCloseButton,
    name,
    right,
    showBackButton,
    subtitle,
    title,
    ...otherProps
  } = props

  const columnRef = useRef<NativeComponent>(null)
  const currentOpenedModal = useReduxState(selectors.currentOpenedModal)
  const closeAllModals = useReduxAction(actions.closeAllModals)
  const popModal = useReduxAction(actions.popModal)

  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!(currentOpenedModal && currentOpenedModal.name === name)) return
    if (!columnRef.current) return

    const node = findNode(columnRef.current)

    if (node && node.focus)
      setTimeout(() => {
        const currentFocusedNodeTag =
          typeof document !== 'undefined' &&
          document &&
          document.activeElement &&
          document.activeElement.tagName
        if (
          currentFocusedNodeTag &&
          currentFocusedNodeTag.toLowerCase() === 'input'
        )
          return

        tryFocus(columnRef.current)
      }, 500)
  }, [currentOpenedModal && currentOpenedModal.name === name])

  return (
    <Column ref={columnRef} columnId={name} style={{ zIndex: 900 }}>
      <ColumnHeader>
        {!!showBackButton && (
          <ColumnHeaderItem
            analyticsLabel="modal"
            analyticsAction="back"
            enableForegroundHover
            fixedIconSize
            iconName="chevron-left"
            onPress={() => popModal()}
            tooltip={`Back (${keyboardShortcutsById.goBack.keys[0]})`}
          />
        )}

        <ColumnHeaderItem
          analyticsLabel={undefined}
          {...otherProps}
          iconName={undefined}
          style={[showBackButton && { padding: 0 }]}
          subtitle={`${subtitle || ''}`.toLowerCase()}
          title={`${title || ''}`.toLowerCase()}
          tooltip={undefined}
        />

        <Spacer flex={1} />

        {!hideCloseButton && (
          <ColumnHeaderItem
            analyticsAction="close"
            analyticsLabel="modal"
            enableForegroundHover
            fixedIconSize
            iconName="x"
            onPress={() => closeAllModals()}
            tooltip={
              showBackButton
                ? 'Close'
                : `Close (${keyboardShortcutsById.closeModal.keys[0]})`
            }
          />
        )}

        {right && (
          <ColumnHeaderItem
            analyticsLabel={undefined}
            noPadding
            style={{
              paddingHorizontal: contentPadding / 2,
            }}
            tooltip={undefined}
          >
            {right}
          </ColumnHeaderItem>
        )}
      </ColumnHeader>

      {children}
    </Column>
  )
})

ModalColumn.displayName = 'ModalColumn'
