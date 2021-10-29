# Sendbird Calls for Desk
This is an implementation of Sendbird Calls for Desk.

# Youtube video
You can see this project working here:

[![Sendbird Calls for Desk](https://img.youtube.com/vi/mspQI4EMfOo/0.jpg)](https://www.youtube.com/watch?v=mspQI4EMfOo)

# Cloning and running
Clone this repository and run ```npm i ``` to install all dependencies.

From inside ```customer.html``` and ```agent.html```, make sure the scripting files are pointing to the correct location, according to your tests:

```
    <!--
        Sendbird Desk
    -->
    <script src="./node_modules/sendbird-desk/SendBird.Desk.min.js"></script>
    <!--
        Sendbird Calls
    -->
    <script src="./node_modules/sendbird-calls/SendBirdCall.min.js"></script>
```
And, at the bottom of the file:

```
    <script src="./index.js"></script>
```

# index.js
This is the main Javascript file which does all the work for Agents and Customers.
Please feel free to use this as a guide only, since this project is not designed for production environments. You should optimise security and performance.

You will find a function called ```getTicketInfo()``` which invokes getting the ticket information. 

```
function getTIcketInfo(callback) {
    const url = DESK_ENDPOINT + '/tickets/' + URLPARAMS.ticket_id;
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json, charset=utf8',
            'SENDBIRDDESKAPITOKEN': DESK_API_TOKEN
        }
    }).then((response) => {
        TICKET = response.data;
        console.log(TICKET);
        callback(true);
    }).catch((error) => {
        console.dir(error);
        callback(false);
    })
}
```

This should not be on your frontend application since exposes your Sendbird Api token. 
If you need to do this, you must validate this user and call your own server to get this information in a private way.


# Setting the IFRAME
Your Desk account should have IFRAME integration enabled. Please contact sales if you need this to be activated in your Sendbird application. 

Go to ```Settings``` > ```Desk``` > ```Integrations``` and enter the URL you want your agents to see in the ticket Dashboard.

This URL must be available from the Internet. You cannot use any ```localhost``` addres. For this tutorial we will use ```ngrok``` to obtain a live URL based on our localhost server listening on port 9001.

![Adding an IFRAME](https://github.com/warodri-sendbird/desk-iframe-calls/blob/8c216eed77423a56b3dc7689b869fe058b1f73b4/iframe.png)

If all goes, well, you should see a new IFRAME on the right side when viewing a ticket as a Desk Agent.





