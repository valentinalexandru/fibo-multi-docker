import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
    return (
        <div>
            The other page
            <Link to="/">Go to main page</Link>
        </div>
    );
};