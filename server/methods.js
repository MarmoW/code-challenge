import { Meteor } from 'meteor/meteor';
import { Communities } from '../communities/communities'; 
import { People } from '../people/people'; 
import { check } from 'meteor/check';

//No other form of getting the db data to front where working so i built a method
Meteor.methods({
  'fetchCommunities'() {
    return Communities.find().fetch();
  },
  'fetchPeople'() {
    return People.find().fetch();
  },
  'people.checkIn'(personId) {
    
    const checkInTime = new Date();
    People.updateAsync(personId, { $set: {
      checkedIn: true,
      checkInTime: checkInTime,
    },})
  },
  'removeCheckIn'(personId) {
    // Check if the person exists and if the personId is valid
    const person = People.findOneAsync(personId);
    if (!person) {
      throw new Meteor.Error('Person not found');
    }
    // Update the person's check-in status and check-in time
    People.updateAsync(personId, {
      $set: {
        checkedIn: false,
        checkInTime: false, // Or use a suitable value for "no check-in"
      },
    });
  }
});

