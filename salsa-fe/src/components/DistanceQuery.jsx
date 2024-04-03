import React, { useState } from 'react';

function DistanceQuery() {
    const [distance, setDistance] = useState('');

    const handleDistanceChange = (event) => {
        setDistance(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(`Entered distance: ${distance}`);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <div>
                <label htmlFor="distance-input" style={{ marginRight: '10px', fontSize: '1.1em' }}>
                    Show the similar audios within (km): 
                </label>
                <input
                    type="text"
                    id="distance-input"
                    value={distance}
                    onChange={handleDistanceChange}
                    style={{ width: '80px', fontSize: '1.1em' }}
                />
            </div>
            <button type="submit" style={{ marginLeft: '10px', fontSize: '1em', width: '60px'}}>Submit</button>
        </form>
    );
}

export default DistanceQuery;
