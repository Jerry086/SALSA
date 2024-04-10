import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Multiselect } from 'multiselect-react-dropdown';

function LabelSelection({ onLabelSelect }) {
  const [selectedLabel, setSelectedLabel] = useState([]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch('/class_labels_indices.csv')
      .then(response => response.text())
      .then(csvData => {
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            // Convert display names to the format required by Multiselect (array of objects)
            const displayNames = result.data.map(row => ({ name: row.display_name, id: row.display_name })).filter(item => !!item.name);
            setOptions(displayNames);
          }
        });
      })
      .catch(error => console.error('Error loading the CSV file:', error));
  }, []);

  const onSelect = (selectedList, selectedItem) => {
    setSelectedLabel(selectedList);
    const labels = selectedList.map(item => item.name);
    onLabelSelect(labels);
  };

  const onRemove = (selectedList, removedItem) => {
    setSelectedLabel(selectedList);
    const labels = selectedList.map(item => item.name);
    onLabelSelect(labels);
  };

  return (
    <div>
      <label htmlFor="category-selector" style={{ fontWeight: 'bold', color: "#333" }}>
            Select Labels:
        </label>
      <Multiselect
        id="category-selector"
        options={options}
        selectedValues={selectedLabel}
        onSelect={onSelect} 
        onRemove={onRemove} 
        displayValue="name"
        showCheckbox={true}
      />
    </div>
  );
}

export default LabelSelection;