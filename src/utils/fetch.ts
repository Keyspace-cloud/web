
//Makes get request to API
export const getData = async (url: string, headers: {}) => {
    const response = await fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        ...{
          "Content-Type": "application/json"      
        },
        ...headers
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
    }).catch(error => error);
    
    if (response.status === 200) {
      return await response.json();
    }
    else {
      return response.status;
    }
}

//Makes post request to API
export const postData = async (url: string, data: Object, headers: {}) => {
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      ...{
        "Content-Type": "application/json"      
      },
      ...headers
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  
  if (response.status === 200) {
    return await response.json();
  }
  else {
    return response.status;
  }
}
