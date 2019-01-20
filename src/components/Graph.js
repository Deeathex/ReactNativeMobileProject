import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Header, Button } from "react-native-elements";
import { PieChart } from 'react-native-svg-charts'

export default class Graph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSlice: {
        label: '',
        value: 10
      },
      labelWidth: 0
    }
  }
  render() {
    const { labelWidth, selectedSlice } = this.state;
    const { movies } = this.props;
    const { label, value } = selectedSlice;
    const keys = ['movies with "The"', 'movies with "A"'];
    let parsedMovies = movies;
    if (typeof movies !== "object") {
      parsedMovies = JSON.parse(movies);
    }
    console.log("graph", typeof parsedMovies);
    const withThe = parsedMovies.filter(t => {
      return t.title.includes("The", 0)
    }).length;

    const withA = parsedMovies.filter(t => {
      return t.title.includes("A", 0);
    }).length;
    console.log("The " + withThe + ", " + "A" + withA)
    const values = [withThe, withA];
    const colors = ['#600080', '#614']
    const data = keys.map((key, index) => {
      return {
        key,
        value: values[index],
        svg: { fill: colors[index] },
        arc: { outerRadius: (70 + values[index]) + '%', padAngle: label === key ? 0.1 : 0 },
        onPress: () => this.setState({ selectedSlice: { label: key, value: values[index] } })
      }
    })
    const deviceWidth = Dimensions.get('window').width
    const series = [100];
    const delay = 0;
    return (
      <View style={{ display: this.props.toggled ? "flex" : "none", justifyContent: 'center', flex: 1 }}>
        <PieChart
          style={{ height: 300 }}
          outerRadius={'80%'}
          innerRadius={'45%'}
          data={data}
        />
        <Text
          onLayout={({ nativeEvent: { layout: { width } } }) => {
            this.setState({ labelWidth: width });
          }}
          style={{
            position: 'absolute',
            left: deviceWidth / 2 - labelWidth / 2,
            textAlign: 'center'
          }}>
          {`${label} \n ${value}`}
        </Text>
      </View>
    );
  }
}