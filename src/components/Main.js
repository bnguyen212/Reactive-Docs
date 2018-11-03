import React from 'react';
import moment from 'moment';
import Modal from 'react-modal';

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      docList: [],
      modalNewIsOpen: false,
      modalExistingIsOpen: false,
      modalShareIsOpen: false,
      modalDeleteIsOpen: false,
    };
    this.toggleModal = this.toggleModal.bind(this);
  }

  // open and close modals
  toggleModal(str) {
    if (str === "New") {
      this.setState({modalNewIsOpen: !this.state.modalNewIsOpen})
    } else if (str === 'Existing') {
      this.setState({modalExistingIsOpen: !this.state.modalExistingIsOpen})
    } else if (str === 'Share') {
      this.setState({modalShareIsOpen: !this.state.modalShareIsOpen})
    } else if (str === 'Delete') {
      this.setState({modalDeleteIsOpen: !this.state.modalDeleteIsOpen})
    }
  }

  // query all documents user owns & has permission to collaborate on
  componentWillMount() {
    fetch("https://reactive-docs-sv.herokuapp.com/user/" + this.state.userId)
    .then(res => {
      if (res.status === 200) {
        return res.json()
      }
      else {
        return []
      }
    })
    .then(res => {
      if (res.success) {
        this.setState({docList: res.docList})
      } else {
        alert(res.error)
      }
    })
  }

  // create a new document in the database
  createDocument(e, title, docPass) {
    e.preventDefault();
    if (!docPass) {
      alert('Document password is missing!');
      throw new Error('Password is missing!')
    }
    fetch("https://reactive-docs-sv.herokuapp.com/doc/new", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "userId": this.state.userId,
        "title": title,
        "password": docPass
      }),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        // clear the new document's title and password saved in the state
        this.setState({docTitle: '', docPass: ''});
        // get updated list of documents
        this.componentWillMount();
        // close modal
        this.toggleModal('New');
      } else {
        alert(res.error)
      }
    })
  }

  // add another user's document
  addExistingDocument(e, id, docPass) {
    e.preventDefault();
    if (!docPass) {
      alert('Document password is missing!');
      throw new Error('Password is missing!')
    }
    fetch("https://reactive-docs-sv.herokuapp.com/doc/add", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "userId": this.state.userId,
        "docId": id,
        "password": docPass
      }),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        // clear docId and docPass stored in state
        this.setState({docId: '', docPass: ''});
        // get updated list of documents
        this.componentWillMount();
        // close modal
        this.toggleModal('Existing');
      } else {
        alert(res.error)
      }
    })
  }

  removeDocument() {
    fetch("https://reactive-docs-sv.herokuapp.com/doc/remove", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "userId": this.state.userId,
        "docId": this.state.docId
      }),
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        // clear docId
        this.setState({docId: ''});
        // get updated list of document
        this.componentWillMount();
        // close modal
        this.toggleModal('Delete');
      } else {
        alert(res.error)
      }
    })
  }

  logout() {
    localStorage.setItem('userId', '');
    localStorage.setItem('username', '');
    this.props.redirect('Login');
  }

  refresh() {
    this.componentWillMount();
  }

  render() {
    return (
      <div>
        <h1 style={styles.header}>Welcome, {this.state.username}!</h1>


        <div style={styles.buttons}>
          <button className="btn btn-success" onClick={() => this.toggleModal('New')}>Create New Document</button>
          <button className="btn btn-warning" onClick={() => this.toggleModal('Existing')}>Add Existing Document</button>
          <button className="btn btn-primary" onClick={() => this.refresh()}>Refresh</button>
          <button className="btn btn-danger" onClick={() => this.logout()}>Logout</button>
        </div>

        <Modal
          isOpen={this.state.modalNewIsOpen}
          style={styles.modal}
          contentLabel="Create New Document"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h5 className="modal-title">Create New Document</h5>
          </div>
          <div className="modal-body">
            <form style={styles.form}>
              <div className="form-group">
                <label>Document Title: </label>
                <input type="text"
                       className="form-control"
                       placeholder="title"
                       onChange={ e => this.setState({ docTitle: e.target.value }) }/>
              </div>
              <div className="form-group">
                <label>Password: </label>
                <input type="password"
                       className="form-control"
                       placeholder="password (required)"
                       onChange={ e => this.setState({ docPass: e.target.value }) }/>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button"
                    className="btn btn-success"
                    onClick={ e => this.createDocument(e, this.state.docTitle, this.state.docPass) }>Create</button>
            <button type="button"
                    className="btn btn-secondary"
                    onClick={ () => this.toggleModal('New') }>Close</button>
          </div>
        </Modal>

        <Modal
          isOpen={this.state.modalExistingIsOpen}
          style={styles.modal}
          contentLabel="Add Existing Document"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h5 className="modal-title">Add Existing Document</h5>
          </div>
          <div className="modal-body">
            <form style={styles.form}>
              <div className="form-group">
                <label>Document ID: </label>
                <input type="text"
                       className="form-control"
                       placeholder="Document ID"
                       onChange={ e => this.setState({ docId: e.target.value }) }/>
              </div>
              <div className="form-group">
                <label>Password: </label>
                <input type="password"
                       className="form-control"
                       placeholder="Password (required)"
                       onChange={ e => this.setState({ docPass: e.target.value }) }/>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button"
                    className="btn btn-warning"
                    onClick={ e => this.addExistingDocument(e, this.state.docId, this.state.docPass) }>Add</button>
            <button type="button"
                    className="btn btn-secondary"
                    onClick={ () => this.toggleModal('Existing') }>Close</button>
          </div>
        </Modal>

        <Modal
          isOpen={this.state.modalShareIsOpen}
          style={styles.modal}
          contentLabel="Share Document"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h5 className="modal-title">Share the document ID below: </h5>
          </div>
          <div className="modal-body">
            <form style={styles.form}>
              <div className="form-group">
                <h5>{this.state.docId}</h5>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button"
                    className="btn btn-secondary"
                    onClick={ () => this.toggleModal('Share') }>Close</button>
          </div>
        </Modal>

        <Modal
          isOpen={this.state.modalDeleteIsOpen}
          style={styles.modal}
          contentLabel="Delete/Unlink Document"
          ariaHideApp={false}
        >
          <div className="modal-header">
            <h3 className="modal-title">Are you sure you want to remove this document?</h3>
          </div>
          <div className="modal-body">
            <form style={styles.form}>
              <div className="form-group">
                <h5>Only owner can delete document permanently. Collborators can only unlink.</h5>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button"
                    className="btn btn-danger"
                    onClick={ () => this.removeDocument() }>Yes</button>
            <button type="button"
                    className="btn btn-secondary"
                    onClick={ () => this.toggleModal('Delete') }>No</button>
          </div>
        </Modal>

        <div className="list-group"  style={styles.docList}>
          {this.state.docList.map((doc, i) => (

            <a key={doc._id} href="#" className="list-group-item flex-column align-items-start" style={styles.doc}>
              <div style={styles.docContent} onClick={ e => this.props.redirect("Document", doc._id, doc.title) }>
                <div style={styles.docIcon}>
                  <img src="https://cdn2.iconfinder.com/data/icons/social-media-8/128/note3.png" height="100px" width="100px"/>
                </div>
                <div style={styles.docInfo}>
                  <h3 style={styles.docTitle} className="mb-1">{doc.title}</h3>
                  <h5>Created by <span style={styles.docDesc}>{doc.owner.username}</span> on: {moment(new Date(doc.createdTime), 'YYYY-MM-DDThh:mm:ss.SSSZ').format("dddd, M/D/YYYY, h:mm:ss a")}</h5>
                  <h5>Last edited on: { moment(new Date(doc.lastEditTime), 'YYYY-MM-DDThh:mm:ss.SSSZ').format("dddd, M/D/YYYY, h:mm a") }</h5>
                  <h5>Collaborators: { doc.collaboratorList.map((person, i) => (i === 0 ? person.username : ", " + person.username)) }</h5>
                </div>
              </div>
              <div style={styles.docBtnDiv}>
                <button className="btn btn-warning"
                        style={styles.docBtn}
                        onClick={() => {this.toggleModal('Share'); this.setState({docId: doc._id})}}>Share</button>
                <button className="btn btn-danger"
                        style={styles.docBtn}
                        onClick={() => {this.toggleModal('Delete'); this.setState({docId: doc._id})}}>{doc.owner._id == this.state.userId ? 'Delete' : 'Unlink'}</button>
              </div>
            </a>
            )
          )}
        </div>
      </div>
    )
  }
}

const styles = {
  header: {
    textAlign: 'center',
    color: 'green',
    marginBottom: '50px'
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: "40px"
  },
  modal: {
    content: {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  },
  form: {
    minWidth: "50%",
    margin: "0 auto"
  },
  docList: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    maxWidth: "70%",
    margin: "0 auto"
  },
  doc: {
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid black",
    display: 'flex'
  },
  docContent: {
    minWidth: "80%",
    maxWidth: "80%",
    display: 'flex'
  },
  docIcon: {
    display: 'flex',
    alignItems: "center"
  },
  docInfo: {
    marginLeft: "30px"
  },
  docTitle: {
    color: 'blue'
  },
  docDesc: {
    fontWeight: 'bold',
    textDecoration: 'underline'
  },
  docBtnDiv: {
    minWidth: "10%",
    display: 'flex',
    flexDirection: 'column',
    margin: "auto"
  },
  docBtn: {
    maxWidth: "70px",
    margin: "5px 5px"}
}
