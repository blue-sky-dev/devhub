import React from 'react'
import { FlatList } from 'react-native'

import { IGitHubNotification } from '../../types'
import NotificationCard from './NotificationCard'
import CardItemSeparator from './partials/CardItemSeparator'

export interface IProps {
  notifications: IGitHubNotification[]
}

class NotificationCards extends React.PureComponent<IProps> {
  keyExtractor(notification: IGitHubNotification) {
    return notification.id
  }

  renderItem({ item }: { item: IGitHubNotification }) {
    return <NotificationCard />
  }

  render() {
    const { notifications } = this.props
    return (
      <FlatList
        data={notifications}
        ItemSeparatorComponent={CardItemSeparator}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
      />
    )
  }
}

export default NotificationCards
