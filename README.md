# Sendbird Calls for Desk
This is an implementation of Sendbird Calls for Desk.

# Youtube video
You can see this project working here:

[![Sendbird Calls for Desk](https://img.youtube.com/vi/WhiScKA7uAM/0.jpg)](https://www.youtube.com/watch?v=WhiScKA7uAM)

# Cloning and running
Clone this repository and run ```npm i ``` to install all dependencies.

Add your server configuration into the ```server.js``` file.

```
var APP_ID = 'YOUR SENDBIRD APPLICATION ID HERE';
var USER_ID = 'iframe';
var ACCESS_TOKEN = null;

const DESK_APP_ID = 'YOUR DESK APPLICATION ID';
const DESK_API_TOKEN = 'YOUR DESK TOKEN';

```

- ```APP_ID``` is your Sendbird Application you can see from your Dashboard.
- ```USER_ID``` it your SDK user ID to connect to. You can select any you want.
- ```ACCESS_TOKEN``` any session or access token for this ```USER_ID```.
- ```DESK_APP_ID``` is your Desk Application ID (it can be the same as ```APP_ID```)
- ```DESK_API_TOKEN``` is your Desk Api token (you can get this information from your Dashboard, by selecting from the left menu: Settings >  Desk > Credentials)

Once you have this file ready, run ```npm start``` to run the ```server.js``` file. This server will listen in your port ```9001```.

Once the server is running, open a browser and navigate to ```http://localhost:9001/customer```. This will be the person creating a ticket.






