import React from "react";
import debounce from 'lodash.debounce';

export default ({locationQuery, updateLocationQuery, locations}) =>
  <div>
    Search Locations: <input value={locationQuery} onChange={async e => await updateLocationQuery(e.target.value)}/>
    {locations.map(location => (
      <div key={location.place_id}>
        <a href={`?lat=${location.lat}&lon=${location.lon}`}>
          {location.display_name} -- {location.type}
        </a>
      </div>
    ))}
  </div>
