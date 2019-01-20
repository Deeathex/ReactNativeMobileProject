import React from 'react';
import { StyleSheet, Text, View, CheckBox, ListView, Container, StatusBar, NetInfo } from 'react-native';
import { Header } from "react-native-elements";

import PropTypes from 'prop-types';
import { connect, Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { createStructuredSelector } from 'reselect';
import MovieContainer from './components/MovieContainer';
import { movieReducer, loginReducer, updateReducer, login, logout, connectWs, deviceStorage, connectionReducer } from "./movies/service";
import thunk from 'redux-thunk';
import Login from "./components/Login";
import { connectionState } from "./movies/service";

const styles = StyleSheet.create({
  header: {
    color: "#fff",
  }
});

const rootReducer = combineReducers(
  { movie: movieReducer, login: loginReducer, update: updateReducer, connection: connectionReducer }
);
const store = createStore(rootReducer, applyMiddleware(thunk));

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isLoggedIn: false,
      isConnected: true
    }
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
  }

  handleConnectionChange = (isConnected) => {
    console.log("change to", isConnected);
    store.dispatch(connectionState(isConnected));
    if (isConnected) {
      deviceStorage.getMovieQueue(queue => {
        queue.forEach(movie => {
          console.log("sync", movie);
          store.dispatch(update(movie));
        })
      });
    }
    this.setState({ isConnected });
  }

  login = (user) => {
    store.dispatch(login(user));
    this.unsubscribe = store.subscribe(() => {
      // console.log("login state ", store.getState().login);
      const { isLoading, isLoggedIn, token } = store.getState().login;
      const auth = {
        username: user.username,
        password: user.password,
        token: token
      };
      //console.log("saving auth ", auth);
      deviceStorage.saveItem("auth", auth)
        .then(() => {
          this.setState({ isLoading, isLoggedIn });
        });
    });
    this.ws = connectWs(store);
  }

  logout = () => {
    deviceStorage.getAuth()
      .then(auth => {
        console.log("loggin out ", auth);
        store.dispatch(logout(auth));
        const emptyAuth = {
          username: "",
          password: "",
          token: ""
        };
        const { isLoading, isLoggedIn } = store.getState().login;
        deviceStorage.saveItem("auth", emptyAuth).then(() => {
          this.setState({ isLoading, isLoggedIn });
        });
      });
  }

  loadLocalMovies = () => {
    console.log("loading local");
    this.setState({ isLoggedIn: true });
  }

  render() {
    const { isConnected } = this.state;
    console.log("connected", isConnected)
    return (
      <Provider
        store={store}
      >
        <View style={{ flex: 2 }}>

          <Header
            backgroundColor="#000"
            style={styles.header}
            centerComponent={
              <Text style={styles.header}>React app</Text>
            }
          />
          {this.state.isLoggedIn ?
            <MovieContainer store={store} logoutHandler={this.logout} isConnected={isConnected} /> :
            <Login
              isLoading={this.state.isLoading}
              loginHandler={(user) => { this.login(user) }}
              store={store}
              isConnected={isConnected}
              loadLocalMovies={this.loadLocalMovies}
            />
          }
        </View>
      </Provider>
    );
  }
}



export default App;