import React, { useContext } from 'react'

import {
  ColumnSubscription,
  getFilteredItems,
  getItemsFromSubscriptions,
} from '@devhub/core'
import { useReduxState } from '../../hooks/use-redux-state'
import * as selectors from '../../redux/selectors'

export interface UnreadCountProviderProps {
  children?: React.ReactNode
}

export type UnreadCountProviderState = number

export const UnreadCountContext = React.createContext<UnreadCountProviderState>(
  0,
)
UnreadCountContext.displayName = 'UnreadCountContext'

export function UnreadCountProvider(props: UnreadCountProviderProps) {
  const columns = useReduxState(selectors.columnsArrSelector)
  const subscriptions = useReduxState(selectors.subscriptionsArrSelector)

  const unreadIds = new Set<string>([])

  columns.forEach(column => {
    if (!(column && column.type === 'notifications')) return

    const columnSubscriptions = column.subscriptionIds
      .map(subscriptionId =>
        subscriptions.find(s => s && s.id && s.id === subscriptionId),
      )
      .filter(Boolean) as ColumnSubscription[]

    const columnItems = getItemsFromSubscriptions(columnSubscriptions)
    const unreadColumnItems =
      column.filters && column.filters.unread === false
        ? []
        : getFilteredItems(
            column.type,
            columnItems,
            { ...column.filters, unread: true },
            { mergeSimilar: false },
          )

    unreadColumnItems.forEach(item => {
      if (!(item && item.id)) return
      if (unreadIds.has(`${item.id}`)) return

      unreadIds.add(`${item.id}`)
    })
  })

  return (
    <UnreadCountContext.Provider value={unreadIds.size}>
      {props.children}
    </UnreadCountContext.Provider>
  )
}

export const UnreadCountConsumer = UnreadCountContext.Consumer
;(UnreadCountConsumer as any).displayName = 'UnreadCountConsumer'

export function useUnreadCount() {
  return useContext(UnreadCountContext)
}
