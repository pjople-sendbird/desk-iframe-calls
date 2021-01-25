
/**
 * SENDBIRD CONFIG
 * Use an application ID with SendBird Calls feature enabled.
 */
var APP_ID = 'YOUR-APP-ID-HERE-WITH-CALLS-SUPPORT';
var USER_ID = '';
var ACCESS_TOKEN = null;


/**
 * DESK VARIABLES AND ENTRYPOINT
*/
var URLPARAMS;
const DESK_APP_ID = 'YOUR-APP-ID-HERE-WITH-DESK-SUPPORT';
const DESK_API_TOKEN = 'YOUR-DESK-API-TOKEN-HERE';
const DESK_APP_API_TOKEN = 'YOUR-DESK-APP-API-TOKEN';

const DESK_ENDPOINT = 'https://desk-api-' + DESK_APP_ID + '.sendbird.com/platform/v1';
var DESK_CURRENT_TICKET;
var DESK_AGENT;
const DESK_DEBUG = true;

/**
 * SendBird main object
 */
var sb;

/**
 * Main call object
 */
var currentCall;

/**
 * Flag to check if SendBird Calls is init
 */
var callsInit = false;

/**
 * Define your unique ID for Calls Handler
 */
const UNIQUE_HANDLER_ID = 'ANY-IDENTIFIER-HERE-123';

/**
 * Set to true if this example is used as DESK IFRAME
 */
const DESK_CALLS_IFRAME = false;


/**
 * Connect to Sendbird SDK
 */
function connect() {
    /**
     * Read login user ID
     */
    USER_ID = document.getElementById('userId').value;
    if (!USER_ID) {
        return;
    }
    /**
     * Connect to SendBird
     */
    sb = new SendBird({
        appId: DESK_APP_ID
    });
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        if (error) {
            console.dir(error);
            console.log('Error connecting to sendbird: ' + error); 
        } else {
            toggleVisibility('loginContainer', false);
            toggleVisibility('createTicketContainer', true);
            connectToDesk();
        }
    });
}

/**
 * Connects to DESK
 */
function connectToDesk() {
    SendBirdDesk.init(SendBird);
    SendBirdDesk.authenticate(USER_ID, (res, err) => {
        if (err) {
            console.dir(err);
            alert('Error connecting to SendBird Desk!');
        }
    });    
}

/**
 * Creates a ticket to DESK
 */
function createTicket() {
    /**
     * Read ticket message
     */
    const message = document.getElementById('ticketMessage').value;
    if (!message) {
        alert('Please describe your problem.');
        return;
    }
    /**
     * Ticket title 
     */
    const title = "New ticket from Sample Customer App";
    /**
     * Connect
     */
    /**
     * Create ticket and send message
     */
    SendBirdDesk.Ticket.create(
        title,
        USER_ID,
        "group-web-app",
        (ticket, err) => {
            if (err) {
                console.dir(err);
                alert('Unable to create this ticket!');
            }
            /**
             * Ticket is created with groupKey 'group-web-app' and customFields added.
             */
            console.log(ticket);
            /**
             * Send message
             */
            ticket.channel.sendUserMessage(message, (message, error) => {
                /**
                 * Disable input box
                 */
                document.getElementById('ticketMessage').enabled = false;
                /**
                 * Show the Calls container
                 */
                toggleVisibility('mainMenu', true);
                /**
                 * Go and connect with SendBird Calls
                 */
                connectCalls();
            })
        }
    );
}



/**
 * Calls - Connects with Sendbird Calls
 */
function connectCalls() {
    SendBirdCall.init(APP_ID);
    askBrowserPermission();
    authorizeSignedUser();
}

/**
 * When this is called, Browser will ask for Audio and Video permission
 */
function askBrowserPermission() {
    SendBirdCall.useMedia({ audio: true, video: true });
}

/**
 * Calls - Authorize signed user
 */
function authorizeSignedUser() {
    const authOption = { 
        userId: USER_ID
    };
    SendBirdCall.authenticate(authOption, (res, error) => {
        if (error) {
            console.log("Calls Authentication failed: " + error);
        } else {
            /**
             * Establishing websocket connection
             */
            SendBirdCall.connectWebSocket()
                .then(() => {
                    console.log('Connected to SendBird');
                    toggleVisibility('createTicketContainer', false);
                    toggleVisibility('makeCallPanel', true);
                    toggleVisibility('connectCallPanel', false);
                    /**
                     * Wait for calls once connected
                     */
                    waitForCalls();
                })
                .catch(() => {
                    console.log('Failed to connect to Socket server');
                });
        }
    });
}

/**
 * Wait for calls once authorized with Calls SDK
 */
function waitForCalls() {
    SendBirdCall.addListener(UNIQUE_HANDLER_ID, {
        onRinging: (call) => {
            console.log('Ringing...');
            currentCall = call;

            call.onEstablished = (call) => {
                console.log('Call established...');
            };

            call.onConnected = (call) => {
                console.log('Call connected');
            };

            call.onEnded = (call) => {
                console.log('Cal ended');
                currentCall = null;
            };

            call.onRemoteAudioSettingsChanged = (call) => {
                console.log('Remote audio settings changed');
            };

            call.onRemoteVideoSettingsChanged = (call) => {
                console.log('Remote video settings changed');
            };

            const acceptParams = {
                callOption: {
                    localMediaView: getVideoObjectCaller(),
                    remoteMediaView: getVideoObjectCallee(),
                    audioEnabled: true,
                    videoEnabled: true
                }
            };    
            call.accept(acceptParams);

        },

    });
}

/**
 * End your call
 */
function endCall() {
    if (currentCall) {
        currentCall.end();
    }
}


/**
 * Gets parameters from URL (from DESK IFRAME)
 */
function fromUrlParametersToObject() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams) {
        const agent_id = urlParams.get('agent_id');
        const ticket_id = urlParams.get('ticket_id');
        const html_key = urlParams.get('html_key');
        URLPARAMS = {
            agent_id, ticket_id, html_key
        }
        console.dir(URLPARAMS);
    } else {
        console.log('No URL parameters sent');
    }
}

function getAgentInfo(callback) {
    if (!URLPARAMS) {
        console.log('NO URL PARAMETERS FROM DESK IFRAME! UNABLE TO CONTINUE');
        callback(false);
        return;
    }
    const url = DESK_ENDPOINT + '/agents/' + URLPARAMS.agent_id;
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json, charset=utf8',
            'SENDBIRDDESKAPITOKEN': DESK_API_TOKEN
        }
    }).then((response) => {
        DESK_AGENT = response.data;
        callback(true);
    }).catch((error) => {
        console.dir(error);
        callback(false);
    })
}

/**
 * Gets Ticket Info (from DESK Platform API)
 */
function getTicketInfo(callback) {
    if (!URLPARAMS) {
        console.log('NO URL PARAMETERS FROM DESK IFRAME! UNABLE TO CONTINUE');
        callback(false);
        return;
    }
    const url = DESK_ENDPOINT + '/tickets/' + URLPARAMS.ticket_id;
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json, charset=utf8',
            'SENDBIRDDESKAPITOKEN': DESK_API_TOKEN
        }
    }).then((response) => {
        DESK_CURRENT_TICKET = response.data;
        console.dir(DESK_CURRENT_TICKET);
        callback(true);
    }).catch((error) => {
        console.dir(error);
        callback(false);
    })
}

function showAgentInfoOnScreen() {
    if (!URLPARAMS) {
        getElement('agent_info').html(`No URL parameters.`);
    } else {
        getElement('agent_info').html(`        
        <p style="margin-top:1rem;">
            Agent ID: ${URLPARAMS.agent_id} 
        </p>
        <p>
            Ticket ID: ${URLPARAMS.ticket_id} 
        </p>
        <p>
            HTML Key: ${URLPARAMS.html_key} 
        </p>
    `);
    }
}

/**
 * Read URL params
 */
if (DESK_CALLS_IFRAME) {
    fromUrlParametersToObject(); 
    showAgentInfoOnScreen();
    getAgentInfo((successAgentInfo) => {
        if (successAgentInfo) {
            getTicketInfo((success) => {
                if (success) {
                    setAppId(DESK_APP_ID);
                    setUserId(URLPARAMS.agent_id);
                    setUserNickname(URLPARAMS.agent_id);
                    connect();
                } else {
                    alert('Unable to get ticket information!');
                }
            })        
        } else {
            alert('Unable to recover Agent info!');
        }
    })
}


/**
 * UI Helper functions
 */
function getElement(id) {
    return $('#' + id);
}
function getElementValue(id) {
    return document.getElementById(id).value;
}
function getVideoObjectCaller() {
    return document.getElementById('local_video_element_id');
}
function getVideoObjectCallee() {
    return document.getElementById('remote_video_element_id');
}
function toggleVisibility(id, show) {
    show ? getElement(id).show() : getElement(id).hide();
}
