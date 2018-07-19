import React from 'react';


export default class Register extends React.Component {
  constructor(props) {
    super(props);
  }

  register(e, username, password) {
    e.preventDefault();
    fetch("https://reactive-docs-sv.herokuapp.com/register", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "username": username,
        "password": password
      }),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        //redirect to Login page if user successfully registered
        this.props.redirect('Login');
      } else {
        alert(res.error)
      }
    })
  }

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.header}>Welcome to Reactive Docs!</h1>
        <form style={styles.form}>
          <div className="form-group">
            <label>Username: </label>
            <input type="email"
                   className="form-control"
                   placeholder="Username"
                   onChange={ e => this.setState({username: e.target.value}) } />
          </div>
          <div className="form-group">
            <label >Password: </label>
            <input type="password"
                   className="form-control"
                   placeholder="6 characters minimum"
                   onChange={ e => this.setState({password: e.target.value}) }/>
          </div>
          <button style={styles.registerBtn}
                  type="submit"
                  className="btn btn-danger"
                  onClick={ e => this.register(e, this.state.username, this.state.password) }>Register</button>
        </form>

        <div style={styles.loginBtn}>
          <button onClick={ () => this.props.redirect('Login') }
                  className="btn btn-primary btn-lg">Login Page</button>
        </div>
      </div>
    )
  }
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    color: 'blue',
    marginBottom: '100px'
  },
  form: {
    minWidth: "50%",
    margin: "0 auto"
  },
  registerBtn: {
    minWidth: "100%"
  },
  loginBtn: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '100px'
  }
}