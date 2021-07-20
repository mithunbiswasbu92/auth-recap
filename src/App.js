import logo from './logo.svg';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

function App() {

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const [newUser, setNewUser] = useState(false)
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false,
  })

  const [fbUser, setFbUser] = useState({
    isFbSignIn: false,
    name: '',
    email: '',
    photo: '',
  })

  const handleGoogleSignIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then((result) => {
        const { displayName, email, photoURL } = result.user;
        const signInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signInUser)
      }).catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage)
      });
  }
  const handleGoogleSignOut = () => {
    firebase.auth()
      .signOut()
      .then((result) => {
        const signOutUser = {
          isSignIn: false,
          name: '',
          email: '',
          photo: ''
        }
        setUser(signOutUser)
      }).catch((error) => {
        console.log(error)
      });
  }

  const handleFBSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        const { displayName, email, photoURL } = result.user;
        const signInUser = {
          isFbSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signInUser)
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
        console.log(errorCode, errorMessage)
      });
  }
  const handleFBSignOut = () => {
    firebase.auth()
      .signOut()
      .then(() => {
        const signOutUser = {
          isFbSignIn: false,
          name: '',
          email: '',
          photo: ''
        }
        setUser(signOutUser)
      }).catch((error) => {
        console.log(error)
      });
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)
    }
    if (e.target.name === "password") {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if (isFieldValid) {
      const updateUserInfo = { ...user };
      updateUserInfo[e.target.name] = e.target.value;
      setUser(updateUserInfo)
    }
  }
  const handleSubmit = (e) => {
    if (user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const updateUserInfo = { ...user }
          updateUserInfo.error = '';
          updateUserInfo.success = true;
          setUser(updateUserInfo);
          updateUserName(user.name)
        })
        .catch((error) => {
          const updateUserInfo = { ...user }
          updateUserInfo.error = error.message;
          updateUserInfo.success = false;
          setUser(updateUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const updateUserInfo = { ...user }
          updateUserInfo.error = '';
          updateUserInfo.success = true;
          setUser(updateUserInfo);
          console.log(res.user)
        })
        .catch((error) => {
          const updateUserInfo = { ...user }
          updateUserInfo.error = error.message;
          updateUserInfo.success = false;
          setUser(updateUserInfo);
        });
    }
    e.preventDefault()
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name, 
    }).then(() => { 
      console.log('User Name Updated successfully')
    }).catch((error) => {
      console.log(error)
    });
  }

  return (
    <div className="App">
      <br />
      {
        user.isSignIn ? <button onClick={handleGoogleSignOut}>Sign Out</button> :
          <button onClick={handleGoogleSignIn}>Google Sign In</button>
      }
      <br />
      <br />
      {
        user.isFbSignIn ? <button onClick={handleFBSignOut}>Sign Out</button> :
          <button onClick={handleFBSignIn}>FB Sign In</button>
      }
      {
        user.isSignIn &&
        <div>
          <h1>Welcome {user.name}</h1>
          <h3>Email: {user.email}</h3>
          <img src={user.photo} alt="" />
        </div>
      }
      {
        user.isFbSignIn &&
        <div>
          <h1>Welcome {user.name}</h1>
          <h3>Email: {user.email}</h3>
          <img src={user.photo} alt="" />
        </div>
      }
      <h1>Our Own Authentication</h1>
      <form onSubmit={handleSubmit}>
        <input type="checkbox" onClick={() => setNewUser(!newUser)} name="newUser" id="" />
        <label htmlFor="newUser">New User Registration</label>
        <br />
        {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your Name" />}
        <br />
        <input type="text" name="email" onBlur={handleBlur} placeholder="Enter Email Address" required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} id="" placeholder="Enter Password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>
      {newUser && <p style={{ color: 'red' }}>{user.error}</p>}
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged In'} Successfully</p>
      }
    </div>
  );
}

export default App;