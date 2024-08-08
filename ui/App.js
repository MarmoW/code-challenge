import React, { useEffect, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

const App = () => {
  const [communities, setCommunities] = useState([]);
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [peopleAtEvent, setPeopleAtEvent] = useState([]);
  const [notCheckedIn, setNotCheckedIn] = useState(0);
  const [sortedByCompany, setSortedByCompany] = useState([]);
  


  useTracker(() => {
    //using the method we created on server side
    
    Meteor.call('fetchCommunities', (error, result) => {
      if (error) {
        console.error('Error fetching communities:', error);
        setIsLoading(false);
      } else {
        setCommunities(result);
      }
    });
    

    Meteor.call('fetchPeople', (error, result) => {
      if (error) {
        console.error('Error fetching people:', error);
        setIsLoading(false);
      } else {
        setPeople(result);
        setIsLoading(false);
      }
    });
  }, []);

  if (isLoading) {
    return (
    <div className='w-screen h-screen bg-gray-100 m-0 py-8 '>
      <div className='text-6xl text-gray-900  font-bold text-gray-900 text-center mb-8'>Loading...</div>;
    </div>)
  } 
  
const handleEventClick = (eventId) => {
  setSelectedEventId(eventId);
  console.log(eventId);

  const filteredPeople = people.filter(person => person.communityId === eventId);
  setPeopleAtEvent(filteredPeople);

  const filteredCheckin = filteredPeople.filter(person => person.checkedIn === true).length;
  const numOfFiltered = filteredPeople.length;
  console.log(numOfFiltered, filteredCheckin);
  setNotCheckedIn(numOfFiltered - filteredCheckin);

  
  const companyGroups = filteredPeople.reduce((acc, person) => { 
    const companyName = person.companyName;
    if (companyName) { 
        if (!acc[companyName]) {
            acc[companyName] = 0;
        }
        acc[companyName]++;
    }
    return acc;
}, {});

  const sortedCompanyGroups = Object.entries(companyGroups).sort((a, b) => b[1] - a[1]);

  console.log('Sorted Company Groups:', sortedCompanyGroups);
  setSortedByCompany(sortedCompanyGroups.slice(0, 3));
};

  const handleCheckIn = (person) => {
    if (person.checkedIn === true ) return;
  
    // Perform the check-in
    Meteor.call('people.checkIn', person._id, (error) => {
      if (error) {
        console.error('Error checking in:', error);
        return;
      }
  
      console.log('Check-in successful');
  
      // Fetch updated people after successful check-in
      Meteor.call('fetchPeople', (error, result) => {
        if (error) {
          console.error('Error fetching updated people:', error);
          setIsLoading(false);
          return;
        }
  
        setPeople(result); // Update people state
        setIsLoading(false);
  
        // Update peopleAtEvent and notCheckedIn
        const filteredPeople = result.filter(person => person.communityId === selectedEventId);
        setPeopleAtEvent(filteredPeople);
  
        const filteredCheckin = filteredPeople.filter(person => person.checkedIn === true).length;
        const numOfFiltered = filteredPeople.length;
        console.log(numOfFiltered, filteredCheckin);
  
        setNotCheckedIn(numOfFiltered - filteredCheckin);
      });
    });
  };
  

  const handleCheckOut = (person) => {
  if (person.checkedIn === false) return;

  Meteor.call('removeCheckIn', person._id, (error) => {
    if (error) {
      console.error('Error checking out:', error);
    } else {
      console.log('Check-out successful');

      // Fetch the updated list of people
      Meteor.call('fetchPeople', (error, result) => {
        if (error) {
          console.error('Error fetching updated people:', error);
          setIsLoading(false);
        } else {
          setPeople(result);
          setIsLoading(false);

          // Update the people at the event
          const filteredPeople = result.filter(person => person.communityId === selectedEventId);
          setPeopleAtEvent(filteredPeople);
          
          // Update the count of not checked in people
          const filteredCheckin = filteredPeople.filter(person => person.checkedIn === true).length;
          const numOfFiltered = filteredPeople.length;
          setNotCheckedIn(numOfFiltered - filteredCheckin);
        }
      });
    }
  });
  };

  if(selectedEventId){
    return(
      <div className='w-screen h-screen bg-gray-100 m-0 py-8 '>
      <h1 className='text-5xl text-gray-900  font-bold text-gray-900 text-center mb-3 '>Registered people at the event</h1>
      <h2 className='text-2xl text-gray-900  font-bold text-gray-900 text-center '>People in the event right now:{peopleAtEvent.length}</h2>
      <h2 className='text-2xl text-gray-900 font-bold text-center '>
        People by company in the event right now: { 
          sortedByCompany.map(([companyName, memberCount], index) => (
            <span key={index}>
              {companyName} ({memberCount})
              {index < sortedByCompany.length - 1 ? ', ' : ''}
            </span>
          ))
        }
      </h2>
      <h2 className='text-2xl text-gray-900  font-bold text-gray-900 text-center mb-4'>People not checked in: {notCheckedIn}</h2>
      <ul className='px-10 w-screen flex flex-wrap justify-between'>
      <div
      onClick={() => {setSelectedEventId(null)}}
      className="text-center m-8 w-screen bg-blue-500 text-white font-semibold py-1 px-3 border border-blue-700 rounded hover:bg-blue-600 transition duration-300">Return</div> 
        {peopleAtEvent.map(people => (
          <div  onClick={() => people.checkInTime ? handleCheckOut(people) : handleCheckIn(people)} className="w-full mb-4 mr-4 bg-blue-500 text-white font-semibold py-1 px-3 border border-blue-700 rounded hover:bg-blue-600 transition duration-300" key={people._id}>
            <h2>{people.firstName} {people.lastName}</h2>
            <h2>Company: {people.companyName ? people.companyName : "Not informed"} - Position: {people.title ? people.title : "Not informed"}</h2>
            <h2>Checked In: {people.checkInTime ? 'Yes' : 'No'} - Check In Date: {people.checkInTime ? people.checkInTime.toLocaleString() : 'N/A'}</h2>
          </div>
        ))}
      </ul>
    </div>
    )
  };

  return (
    <div className='w-screen h-screen bg-gray-100 m-0 py-8 '>
      <h1 className='text-6xl text-gray-900  font-bold text-gray-900 text-center mb-8'>Select an event</h1>
      <ul className='px-10 w-screen flex flex-col justify-between '>
        {communities.map(community => (
          <div  onClick={() => handleEventClick(community._id)} className="mb-8 w-full bg-blue-500 text-white font-bold rounded-2xl border border-indigo-700 shadow-2xl p-10 text-center transition-transform transform hover:scale-105 hover:bg-indigo-700" key={community._id}>
            <h2>{community.name}</h2>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default App;
