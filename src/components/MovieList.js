import React from 'react';
import { StyleSheet, Text, View, CheckBox, ListView, Container, StatusBar, TouchableHighlight } from 'react-native';
import { Header, Button } from "react-native-elements";


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  header: {
    color: "#fff"
  },
  firstCol: {
    // borderColor: "#eee",
    // borderWidth: 1,
    margin: 0,
    padding: 10,
    width: 40,
    height: 50
  },
  cell: {
    // borderColor: "#eee",
    // borderWidth: 1,
    margin: 0,
    padding: 10,
    width: 320,
    height: 80

  },
  logoutBtn: {
    borderRadius: 20,
    backgroundColor: "#000",
  },
  list: {
  },
  selected: {
    backgroundColor: "#DDD"
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  }
});

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: ds.cloneWithRows(props.data),
    }
  }

  componentWillReceiveProps(props) {
    this.state.dataSource = ds.cloneWithRows(props.data);
  }

  renderRow(row) {
    const selectionId = this.props.selection.id;
    return (
      <TouchableHighlight style={this.props.selection.id === row.id? styles.selected: {}} onPress={() => this.props.selectionHandler(row)}>
        <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.firstCol}>{row.id}</Text>
          <Text style={styles.cell}>{row.title}</Text>
          <Text style={styles.cell}>{row.description}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          style={styles.list}
          renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
        />

      </View>
    );
  }
}
