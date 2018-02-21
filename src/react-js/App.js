import React, { Component } from 'react';
import '../css/App.css';

import Dimension from './Dimension';
import Display from './Display';
import DatasetChooser from './DatasetChooser';

import Schema from '../js/schema';
import Recommender from '../js/recommender';

const datasets = require('../datasets.json');

const DEFAULT_DATASET_NAME = 'cars.json';

const DEFAULT_DIMENSION_CONFIG = {
  fieldType: null,
  fieldTransformation: null,
  fieldTypeLocked: false,
  fieldTransformationLocked: false,
};

const FIELD_TYPES = ['quantitative', 'temporal', 'ordinal', 'nominal'];
const FIELD_TRANSFORMATIONS = {
  'quantitative': ['none', 'bin', 'mean', 'sum'],
  'temporal': ['none', 'bin'],
  'ordinal': ['none'],
  'nominal': ['none']
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: [],
      datasetName: 'cars.json',
    };

    this.data = require('vega-datasets/data/' + DEFAULT_DATASET_NAME);
    this.schema = new Schema(require('vega-datasets/data/' + this.state.datasetName));
    console.log(this.schema);
    this.recommender = new Recommender();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.datasetName !== this.state.datasetName) {
      this.data = require('vega-datasets/data/' + nextState.datasetName);
      this.schema = new Schema(this.data);
    }
  }

  render() {
    const fieldTypes = this.getFieldTypes();
    const fieldAggregates = this.getFieldAggregates();
    const fieldBins = this.getFieldBins();

    const availableFieldTypes = this.getAvailableFieldTypes(fieldTypes);

    const dimensionComponents = [];
    for (let i = 0; i < this.state.dimensions.length; i++) {
      const dimensionState = this.state.dimensions[i];

      dimensionComponents.push(
        <Dimension key={i}
          id={i}
          fieldType={dimensionState.fieldType}
          fieldTransformation={dimensionState.fieldTransformation}
          fieldTypeLocked={dimensionState.fieldTypeLocked}
          fieldTransformationLocked={dimensionState.fieldTransformationLocked}
          setFieldType={this.setFieldType.bind(this)}
          setFieldTypeLock={this.setFieldTypeLock.bind(this)}
          setFieldTransformation={this.setFieldTransformation.bind(this)}
          setFieldTransformationLock={this.setFieldTransformationLock.bind(this)}
          removeDimension={this.removeDimension.bind(this)}
          fieldTypes={FIELD_TYPES}
          availableFieldTypes={availableFieldTypes}
          fieldTransformations={FIELD_TRANSFORMATIONS}
        />
      )
    }

    const dimensions = (
      <ul className="dimension-list">
        {dimensionComponents}
      </ul>
    );

    const display = (
      <Display
        schema={this.schema}
        data={this.data}
        fieldTypes={fieldTypes}
        fieldBins={fieldBins}
        fieldAggregates={fieldAggregates}
      />
    );

    return (
      <div className="App">
        <div className="dashboard">
          <DatasetChooser dataset={this.state.datasetName} datasets={datasets}
                          setDataset={this.setDataset.bind(this)}/>
          {dimensions}
          <div className="add-dimension-button-container">
            <div className="add-dimension-button" onClick={this.addDimension.bind(this)}>
              Add a Dimension
            </div>
          </div>
        </div>
        <div className="display">
          {display}
        </div>
      </div>
    );
  }

  setDataset(datasetName) {
    this.setState({
      datasetName: datasetName,
    });
  }

  getFieldTypes() {
    const fieldTypes = [];
    for (const dimension of this.state.dimensions) {
      if (dimension.fieldType !== null &&
          dimension.fieldTypeLocked &&
          dimension.fieldTransformationLocked) {
        fieldTypes.push(dimension.fieldType);
      }
    }

    return fieldTypes;
  }

  getAvailableFieldTypes(currentFieldTypes) {
    this.schema.ready();
    for (const type of currentFieldTypes) {
      this.schema.getNextField(type);
    }

    const available = [];
    for (const nextType of FIELD_TYPES) {
      if (this.schema.getNextField(nextType) !== null) {
        available.push(nextType);
      }
    }

    return available;
  }

  getFieldBins() {
    const binTypes = [];
    for (const dimension of this.state.dimensions) {
      if (dimension.fieldTransformation !== null &&
          dimension.fieldTransformation === 'bin' &&
          dimension.fieldTypeLocked &&
          dimension.fieldTransformationLocked) {
        binTypes.push(true);
      } else {
        binTypes.push(false);
      }
    }

    return binTypes;
  }

  getFieldAggregates() {
    const aggTypes = [];
    for (const dimension of this.state.dimensions) {
      if (dimension.fieldTransformation !== null &&
          (dimension.fieldTransformation === 'mean' ||
          dimension.fieldTransformation === 'sum') &&
          dimension.fieldTypeLocked &&
          dimension.fieldTransformationLocked) {
        aggTypes.push(dimension.fieldTransformation);
      } else {
        aggTypes.push(null);
      }
    }

    return aggTypes;
  }

  addDimension() {
    const dimensions = this.state.dimensions.slice(0);
    dimensions.push(Object.assign({}, DEFAULT_DIMENSION_CONFIG));
    this.setState({
      dimensions: dimensions,
    });
  }

  setFieldType(id, fieldType) {
    const dimension = this.state.dimensions[id];
    if (fieldType !== dimension.fieldType) {
      this.setFieldTransformation(id, null);
      this.setFieldTransformationLock(id, false);
    }

    dimension.fieldType = fieldType;

    if (FIELD_TRANSFORMATIONS[fieldType].length === 1) {
      this.setFieldTransformation(id, 'none');
      this.setFieldTransformationLock(id, true);
    }
    this.forceUpdate();
  }

  setFieldTransformation(id, fieldTransformation) {
    const dimension = this.state.dimensions[id];
    dimension.fieldTransformation = fieldTransformation;
    this.forceUpdate();
  }

  setFieldTypeLock(id, lock) {
    const dimension = this.state.dimensions[id];
    dimension.fieldTypeLocked = lock;
    this.forceUpdate();
  }

  setFieldTransformationLock(id, lock) {
    const dimension = this.state.dimensions[id];
    dimension.fieldTransformationLocked = lock;
    this.forceUpdate();
  }

  removeDimension(id) {
    this.state.dimensions.splice(id, 1);
    this.forceUpdate();
  }
}

export default App;
