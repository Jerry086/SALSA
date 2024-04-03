import React, { useState } from 'react';

function TopKQuery() {
    const [selectedValue, setSelectedValue] = useState('20');

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
        console.log(`Selected number: ${event.target.value}`);
    };

    return (
        <div>
            <label htmlFor="topk-select" style={{ marginRight: '5px', fontSize: '1.1em' }}>Select number of similar audios to display: </label>
            <select id="topk-select" value={selectedValue} onChange={handleChange} style={{ fontSize: '1.1em', width: '45px' }}>
                <option value="1">1</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
            </select>
        </div>
    );
}

export default TopKQuery;
