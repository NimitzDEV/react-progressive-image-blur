import React, { Component } from 'react'
import './App.css'

import DeferImg from 'react-progressive-image'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>react-progressive-image</h2>
        </div>
        <div className="gallery">
          <DeferImg className="image fix-size" src="/images/0.png" />
          <DeferImg className="image fix-size" src="/images/1.png" />
          <DeferImg className="image fix-size" src="/images/2.png" />
        </div>
        <div className="placeholder">
          <span>SCROLL DOWN TO LOAD MORE</span>
        </div>
        <div className="gallery">
          <DeferImg className="image fix-size" src="/images/3.png" />
          <DeferImg className="image fix-size" src="/images/4.png" />
          <DeferImg className="image fix-size" src="/images/5.png" />
        </div>
        <div className="gallery">
          <DeferImg className="image big-image" src="/images/5.png" />
        </div>
      </div>
    )
  }
}

export default App
