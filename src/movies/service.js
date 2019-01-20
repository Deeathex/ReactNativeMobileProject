import { httpApiUrl, wsApiUrl } from '../core/api';
import { AsyncStorage } from 'react-native';

export const pass = "";

export const loadMovies = (token) => (dispatch) => {
  dispatch({ type: 'LOAD_STARTED' });
  fetch(`${httpApiUrl}/movies?token=` + token)
    .then(response => {
      // console.log(response);
      return response.json();
    })
    .then(responseJson => dispatch({ type: 'LOAD_SUCCEEDED', payload: responseJson }))
    .catch(error => dispatch({ type: 'LOAD_FAILED', error }));
};

export const login = (user) => (dispatch) => {
  // console.log(user);
  dispatch({ type: "LOGIN_STARTED" });
  fetch(`${httpApiUrl}/login`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: user.username,
      password: user.password
    })
  })
    .then(response => {
      console.log("login resp ", response);
      return response.json();
    })
    .then(responseJSON => dispatch({ type: "LOGIN_SUCCEEDED", payload: { username: user.username, token: responseJSON.token } }))
    .catch(error => dispatch({ type: 'LOGIN_FAILED', error }));
}

export const logout = (auth) => (dispatch) => {
  dispatch({ type: "LOGIN_STARTED" });
  fetch(`${httpApiUrl}/logout`, {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: auth.username,
      password: auth.password,
      token: auth.token
    })
  })
    .then(response => {
      // console.log(response);
      return response.json();
    })
    .then(responseJSON => dispatch({ type: "LOGIN_SUCCEEDED", payload: { token: "", username: "" } }))
    .catch(error => dispatch({ type: 'LOGIN_FAILED', error }));
}

export const update = (item) => (dispatch) => {
  // console.log("doing update ", item);
  dispatch({ type: "UPDATE_STARTED" });
  fetch(`${httpApiUrl}/movies`, {
    method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: item.id,
      title: item.title,
      description: item.description,
      token: item.token
    })
  })
    .then(response => {
      console.log("update response ", response);
      return response.json();
    })
    .then(responseJSON => { dispatch({ type: "UPDATE_SUCCEEDED" }); dispatch(loadMovies(responseJSON.token)) })
    .catch(error => {
      deviceStorage.addMovieToQueue(item);
      return dispatch({ type: 'UPDATE_FAILED', error: "error" })

    });
}

export const movieReducer = (state = { isLoading: false, movies: [], issue: null }, action) => {
  switch (action.type) {
    case 'LOAD_STARTED':
      return { ...state, isLoading: true, movies: [], issue: null };
    case 'LOAD_SUCCEEDED':
      return { ...state, isLoading: false, movies: action.payload };
    case 'LOAD_FAILED':
      return { ...state, isLoading: false, movies: [], issue: action.error };
    default:
      return state;
  }
};

export const loginReducer = (state = { isLoading: false, username: "", token: "", isLoggedIn: false }, action) => {
  switch (action.type) {
    case "LOGIN_STARTED":
      return { ...state, isLoading: true, username: "", token: "", isLoggedIn: false, issue: null };
    case 'LOGIN_SUCCEEDED':
      console.log(action);
      return { ...state, token: action.payload.token, username: action.payload.username, isLoading: false, isLoggedIn: true };
    case 'LOGIN_FAILED':
      console.log("login failed");
      return { ...state, isLoading: false, username: "", token: "", issue: action.error };
    default:
      return state;
  }
};

export const updateReducer = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_STARTED":
      return { ...state, isLoading: false, issue: null };
    case 'UPDATE_SUCCEEDED':
      console.log("update success");
      return { ...state, isLoading: true };
    case 'UPDATE_FAILED':
      console.log("update failed");
      return { ...state, isLoading: false, issue: action.error };
    default:
      return state;
  }
}

const initialConnection = {
  isConnected: false,
};

export const connectionReducer = (state = initialConnection, action) => {
  // console.log("con", action);
  switch (action.type) {
    case 'CHANGE_CONNECTION_STATUS':
      return { ...state, isConnected: action.isConnected }
    default:
      return state
  }
}

export const connectionState = (status) => (dispatch) => {
  return dispatch({ type: 'CHANGE_CONNECTION_STATUS', isConnected: status });
};


export const deviceStorage = {
  async saveItem(key, value) {
    try {
      return AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('AsyncStorage Error: ' + error.message);
    }
  },
  async getMovies() {
    return AsyncStorage.getItem("movies");
  },
  async getAuth() {
    return AsyncStorage.getItem("auth").then((item) => JSON.parse(item));
  },
  async getMovieQueue() {
    return AsyncStorage.getItem("movieQueue");
  },
  async addMovieToQueue(movie) {
    return this.getMovieQueue().then(movies => {
      console.log("movieQ", movies, typeof movies);
      if (!movies) {
        movies = [];
      }
      movies.push(movie);

      return this.saveItem("movieQueue", movies);
    });
  },
  async resetMovieQueue() {
    return this.saveItem("movieQueue", []);
  }
};


export const connectWs = (store) => {
  const ws = new WebSocket(wsApiUrl);
  ws.onopen = () => { };
  ws.onmessage = e => store.dispatch({
    type: 'NOTE_ADDED', payload: { movie: JSON.parse(e.data).movie }
  });
  ws.onerror = e => { };
  ws.onclose = e => { };
  return ws;
};

export const disconnectWs = (ws) => {
  ws.close();
};
