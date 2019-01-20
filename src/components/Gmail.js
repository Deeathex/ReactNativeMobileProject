import React from 'react';
import { StyleSheet, Text, View, Dimensions, TextInput } from 'react-native';
import { Header, Button } from "react-native-elements";
import { pass } from "../movies/service";

const emailFrom = "andreeaciforac@gmail.com";
const styles = StyleSheet.create({
  input: {
    padding: 10,
    margin: 5
  },
  sendBtn: {
    borderRadius: 20,
    backgroundColor: "#2b7dbc",
    margin: 20
  }
});

export default class GmailSender extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selection: {
        mailContent: "",
        recipient: "andreeaciforac@gmail.com",
      }
    }
  }

  selectionChanged = (field, data) => {
    let selection = {};
    const realSelection = this.state.selection;
    selection.mailContent = realSelection.mailContent;
    selection.recipient = realSelection.recipient;
    selection[field] = data;
    this.setState({ selection });
  }

  render() {
    const mail = {
      body: this.state.selection.mailContent,
      to: this.state.selection.recipient
    }
    return (
      <View style={{ display: this.props.toggled ? "flex" : "none", padding: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="to"
          value={mail.to}
          onChangeText={(value) => { this.selectionChanged("recipient", value) }}
        />
        <TextInput
          multiline
          numberOfLines={3}
          style={styles.input}
          value={mail.body}
          onChangeText={(value) => { this.selectionChanged("mailContent", value) }}
        />
        <Button onPress={() => this.props.handleSendEmail(mail)} buttonStyle={styles.sendBtn} title="open mail client" />
      </View>
    );
  }
}