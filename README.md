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
Do this for both ```customer.js``` and ```agent.js``` file.

Once the server is running, open a browser and navigate to ```http://localhost:9001/customer```. This will be the person creating a ticket.

![Customer running on localhost](https://github.com/warodri-sendbird/desk-iframe-calls/blob/84b0b4d72436e7cf96c8aa7c30290582cb0c9279/localhost_customer.png)

# Setting the IFRAME
Your Desk account should have IFRAME integration enabled. Please contact sales if you need this to be activated in your Sendbird application. 

Go to ```Settings``` > ```Desk``` > ```Integrations``` and enter the URL you want your agents to see in the ticket Dashboard.

This URL must be available from the Internet. You cannot use any ```localhost``` addres. For this tutorial we will use ```ngrok``` to obtain a live URL based on our localhost server listening on port 9001.

Remember to add ```/agent``` to the ```ngrok``` URL, since this is required according to our ```server.js``` file.

![Adding an IFRAME](https://github.com/warodri-sendbird/desk-iframe-calls/blob/8c216eed77423a56b3dc7689b869fe058b1f73b4/iframe.png)

If all goes, well, you should see a new IFRAME on the right side when viewing a ticket as a Desk Agent.





