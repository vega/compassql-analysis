import React, { Component } from 'react';
import * as classNames from 'classnames';

import '../css/Config.css';

class Config extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const options = this.props.options.map((opt) => {
      const classes = classNames({
        option: true,
        selected: this.props.selectedOptions.includes(opt)
      });

      return <div className={classes} key={opt} onClick={() => {
        this.props.toggleOption(opt);
      }}>{opt}</div>
    });

    return (
      <div className="Config">
        <div className="title">options: </div>
        {options}
      </div>
    );
  }
}

export default Config;