import React from 'react';
import { StyleSheet, TextInput, Text, View, NetInfo } from 'react-native';

import { createStructuredSelector } from 'reselect';
import { loadMovies, connectWs, deviceStorage, disconnectWs, login } from '../movies/service';
import MovieList from "./MovieList";
import { Button } from 'react-native-elements';


const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  text: {
    fontSize: 16,
    color: "#0a3353"
  },
  input: {
    padding: 10,
    margin: 5
  },
  loginBtn: {
    borderRadius: 20,
    backgroundColor: "#2b7dbc",
  },
  moviesBtn: {
    margin: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "black",
    borderRadius: 20
  }
});

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      localMovies: false
    }
  }

  componentDidMount() {
    deviceStorage.getAuth().then(auth => {
      // console.log("getting auth ", auth);
      if (auth) {
        this.props.loginHandler({ username: auth.username, password: auth.password });
      }
    });

    // deviceStorage.getMovies().then(movies => {
    //   if (movies && movies.length) {
    //     this.setState({ localMovies: true });
    //   }
    // });
  }



  getUser = () => {
    return {
      username: this.state.username,
      password: this.state.password
    }
  }

  usernameChange = (username) => {
    this.setState({ username: username });
  }


  passwordChange = (password) => {
    this.setState({ password: password });
  }

  loginHandler = () => {
    let user = this.getUser();
    this.props.loginHandler(user);
  }

  localMoviesHandler() {
    console.log("local", this.props);
    this.props.loadLocalMovies();
  }

  render() {
    const { isConnected } = this.props;

    return (
      <View style={styles.container}>
        {
          this.props.isLoading ?
            <Text style={styles.text}>Loading..</Text> :
            <View>
              <Text style={styles.text}>Username</Text>
              <TextInput
                style={styles.input}
                onChangeText={this.usernameChange}
              ></TextInput>
              <Text style={styles.text}>Password</Text>
              <TextInput
                secureTextEntry={true}
                style={styles.input}
                onChangeText={this.passwordChange}
              ></TextInput>
              <Button buttonStyle={styles.loginBtn} title="LOGIN" onPress={this.loginHandler} />
              {!isConnected ? <Button buttonStyle={styles.moviesBtn} title={"Get local storage"} color="black" onPress={this.localMoviesHandler} /> : <View />}
            </View>
        }
      </View>
    );
  }

}