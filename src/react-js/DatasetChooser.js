import React, { Component } from 'react';
import '../css/DatasetChooser.css';

class DatasetChooser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: false
    }
  }

  render() {
    const datasetOptions = [];
    for (const dataset of this.props.datasets) {
      if (dataset.includes(this.state.inputText) || !this.state.inputText) {
        datasetOptions.push(
          <li className="dropdown-item" key={dataset} onMouseDown={(e) => {
            this.props.setDataset(e.target.textContent);
          }}>{dataset}</li>
        );
      }
    }

    const dropdown = (
      <ol className="dropdown-content">
        {datasetOptions}
      </ol>
    );

    return (
      <div className="search-container">
          <div className="search-title">
              {this.props.dataset}
          </div>
          <div className="search-bar">
              <input className="search-input" type="text" placeholder="choose another dataset"
                     onChange={(e) => { this.setInputText(e) }}></input>
              {dropdown}
          </div>
      </div>
    );
  }

  setInputText(e) {
    this.setState({
      inputText: e.target.value
    });
  }
}

export default DatasetChooser;