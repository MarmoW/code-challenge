import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../ui/App'; 

Meteor.startup(async () => {

    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
});