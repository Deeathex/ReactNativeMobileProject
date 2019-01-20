import React from 'react';
import { StyleSheet, Text, View, CheckBox, ListView, Container, StatusBar, TextInput } from 'react-native';
import { Header, Button } from "react-native-elements";

const styles = StyleSheet.create({
  container: {
    padding: 10
  },
  input: {
    padding: 10,
    margin: 5
  },
  updateBtn: {
    borderRadius: 20,
    backgroundColor: "#2b7dbc",
    margin: 20
  }
});

export default class MovieInput extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { selection } = this.props;
    return (
      <View style={styles.container}>
        <View>
          <TextInput
            style={styles.input}
            editable={false}
            placeholder="id"
            value={selection.id ? selection.id.toString() : ""}
            onChangeText={(value) => { console.log(value); this.props.selectionChanged("id", value) }}
          />
        </View>

        <View>
          {/* <Text style={styles.input}>Title</Text> */}
          <TextInput
            style={styles.input}
            placeholder="title"
            value={selection.title ? selection.title : ""}
            onChangeText={(value) => { console.log(value); this.props.selectionChanged("title", value) }}
          />
        </View>

        <View>
          <TextInput
            style={styles.input}
            placeholder="description"
            value={selection.description ? selection.description : ""}
            onChangeText={(value) => { console.log(value); this.props.selectionChanged("description", value) }}
          />
        </View>

        <Button buttonStyle={styles.updateBtn} onPress={this.props.updateHandler} title="update" />
      </View>
    )
  }
}