import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  NavigationScreenProps,
  NavigationStackScreenOptions,
} from 'react-navigation'
import { connect } from 'react-redux'

import { Screen } from '../components/common/Screen'
import { ThemeConsumer } from '../components/context/ThemeContext'
import { LeftSidebar } from '../components/layout/LeftSidebar'
import { ModalRenderer } from '../components/modals/ModalRenderer'
import { ColumnsContainer } from '../containers/ColumnsContainer'
import * as selectors from '../redux/selectors'
import { ExtractPropsFromConnector } from '../types'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
})

const connectToStore = connect((state: any) => ({
  currentOpenedModal: selectors.currentOpenedModal(state),
}))

class MainScreenComponent extends PureComponent<
  NavigationScreenProps & ExtractPropsFromConnector<typeof connectToStore>
> {
  static navigationOptions: NavigationStackScreenOptions = {
    header: null,
  }

  render() {
    return (
      <ThemeConsumer>
        {({ theme }) => (
          <Screen statusBarBackgroundColor={theme.backgroundColorLess08}>
            <View style={styles.container}>
              <LeftSidebar navigation={this.props.navigation} />
              <ModalRenderer />
              <ColumnsContainer />
            </View>
          </Screen>
        )}
      </ThemeConsumer>
    )
  }
}

export const MainScreen = connectToStore(MainScreenComponent)

hoistNonReactStatics(MainScreen, MainScreenComponent as any)
