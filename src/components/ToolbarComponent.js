import React from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { Appbar } from "react-native-paper";

export default class ToolbarComponent extends React.Component {
  _goBack = () => {};

  _handleMore = () => {};

  render() {
    return (
      <Appbar.Header>
        <Appbar.Content title="Auth Demo" subtitle="iubar.it" />
        {/*<Appbar.Action icon="dots-vertical" onPress={this._handleMore} />*/}
      </Appbar.Header>
    );
  }
}
