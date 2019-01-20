import React from 'react';
import { StyleSheet, Text, View, Animated, ScrollView, NetInfo, TouchableHighlight, Linking } from 'react-native';
import { Button, Icon } from "react-native-elements";
import { createStructuredSelector } from 'reselect';
import { loadMovies, connectWs, deviceStorage, disconnectWs, update } from '../movies/service';
import MovieList from "./MovieList";
import MovieInput from "./MovieInput";
import Graph from "./Graph";
import GmailSender from './Gmail';
import email from 'react-native-email'
import { wsUrl } from '../core/api';

const styles = StyleSheet.create({
  logoutBtn: {
    borderRadius: 20,
    backgroundColor: "#000",
  },
  container: {
    flexGrow: 1,
    padding: 20
  },
  graphButton: {
    backgroundColor: "#2b7dbc",
    borderRadius: 50,
    height: 50,
    width: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
    bottom: 10,
    zIndex: 100
  },
  mailButton: {
    backgroundColor: "#2b7dbc",
    borderRadius: 50,
    height: 50,
    width: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 10,
    bottom: 70,
    zIndex: 100
  },
  graph: {
    position: "absolute"
  }
});

export default class MovieContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      selection: {
        id: null,
        title: null,
        description: null,
        graph: false
      },
      fadeAnim: new Animated.Value(0),
      fadeAnim2: new Animated.Value(0)
    }
  }

  componentDidMount() {
    this.graphInAnimation = Animated.spring(
      this.state.fadeAnim,
      {
        toValue: 400,
        duration: 1000
      }
    );

    this.graphOutAnimation = Animated.spring(
      this.state.fadeAnim,
      {
        toValue: 0,
        duration: 1000
      }
    );

    this.mailInAnimation = Animated.spring(
      this.state.fadeAnim2,
      {
        toValue: 250,
        duration: 1000
      }
    );

    this.mailOutAnimation = Animated.spring(
      this.state.fadeAnim2,
      {
        toValue: 0,
        duration: 1000
      }
    );
    //NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectionChange);
    const { store } = this.props;
    // console.log(store);
    // console.log("state ", store.getState().login);
    const { token } = store.getState().login;
    // console.log("token ", token);
    store.dispatch(loadMovies(token));

    this.ws = new WebSocket(wsUrl);
    this.ws.onmessage = (e) => {
      store.dispatch(loadMovies(token));
    };

    deviceStorage.getMovies().then((t) => {
      this.setState({ movies: t ? t : [] });
    });
    this.unsubscribe = store.subscribe(() => {
      const { isLoading, movies, issue } = store.getState().movie;
      // console.log(issue);
      this.setState({ isLoading, movies, issue });
      deviceStorage.saveItem("movies", movies);
    });
    this.ws = connectWs(store);
  }



  componentWillUnmount() {
    this.unsubscribe();
    disconnectWs(this.ws);
  }

  loadData() {
    this.props.getMovies();
  }

  update = () => {
    const { store } = this.props;
    let movie = this.state.selection;
    let { isConnected } = this.props;
    movie.token = store.getState().login.token;
    store.dispatch(update(movie));

  }

  selectionHandler = (item) => {
    this.setState({ selection: item });
  }

  selectionChanged = (field, data) => {
    // console.log("i wanna change ", field + " " + data);
    let selection = {};
    const realSelection = this.state.selection;
    selection.id = realSelection.id;
    selection.title = realSelection.title;
    selection.description = realSelection.description;
    // console.log("but selection is ", selection);
    selection[field] = data;
    this.setState({ selection });
  }

  updateAll = () => {
    deviceStorage.getMovieQueue().then(queue => {
      queue.forEach(movie => {
        this.update(movie);
      });
      deviceStorage.resetMovieQueue();
    })
  }

  toggleGraphOverlay = () => {
    if (!this.state.graph) {
      // Promise.all([
      //   this.mailOutAnimation.start(),
      //   this.graphInAnimation.start()
      // ]);
      Animated.sequence([
        this.mailOutAnimation,
        this.graphInAnimation

      ]).start();
    } else {
      this.graphOutAnimation.start();
    }
    this.setState({ graph: !this.state.graph, mail: false });
  }

  toggleGmailOverlay = () => {
    if (!this.state.mail) {
      Animated.sequence([
        this.graphOutAnimation,
        this.mailInAnimation

      ]).start();


    } else {
      this.mailOutAnimation.start();
    }
    this.setState({ mail: !this.state.mail, graph: false });
  }

  sendEmail = (mail) => {
    // const to = mail.to// string or array of email addresses
     email(to, {
       subject: 'React native demo',
       body: mail.body
     }).catch(console.error);
    console.log(mail);
    Linking.openURL(`mailto:${mail.to}?subject=React%20native%20demo&body=${mail.body.split(" ").join("%20")}`)
  }

  render() {
    const { isConnected } = this.props;
    const needsSync = !!this.props.store.getState().update.issue;
    let { fadeAnim, fadeAnim2 } = this.state;
    return (
      <View style={{ flex: 1 }}>

        <Animated.View
          style={{
            ...this.props.style,
            height: fadeAnim,
            shadowOpacity: 0.75,
            shadowRadius: 5,
            shadowColor: 'blue',
            shadowOffset: { height: 0, width: 0 },
            overflow: "hidden",
          }}
        >
          <Graph toggled={this.state.graph} movies={this.state.movies} />
        </Animated.View>

        <Animated.View
          style={{
            ...this.props.style,
            height: fadeAnim2,
            shadowOpacity: 0.75,
            shadowRadius: 5,
            shadowColor: 'blue',
            shadowOffset: { height: 0, width: 0 },
            overflow: "hidden",
          }}
        >
          <GmailSender handleSendEmail={this.sendEmail} toggled={this.state.mail} />
        </Animated.View>
        <ScrollView contentContainerStyle={styles.container}>
          {this.state.isLoading ? <Text>Loading..</Text> :
            <View>
              <MovieInput
                selection={this.state.selection}
                updateHandler={() => this.update()}
                selectionChanged={this.selectionChanged}
              />
              {/* {needsSync ? <Button onPress={this.updateAll} title="sync data" /> : <View />} */}
              <MovieList selection={this.state.selection} selectionHandler={this.selectionHandler} data={this.state.movies} />
              {isConnected ? <Button onPress={this.props.logoutHandler} buttonStyle={styles.logoutBtn} title="log out" /> : <View />}
            </View>
          }
        </ScrollView>

        <TouchableHighlight style={styles.mailButton} onPress={this.toggleGmailOverlay}>
          <Icon color="white" name="email" />
        </TouchableHighlight>

        <TouchableHighlight style={styles.graphButton} onPress={this.toggleGraphOverlay}>
          <Icon color="white" name="assessment" />
        </TouchableHighlight>
      </View>
    );
  }
}

