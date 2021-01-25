
/**
 * SENDBIRD CONFIG for your application with Calls support active.
 * Use your SendBird SDK configuration to connect and chat.
 */
var APP_ID = 'YOUR-APPLICATION-ID-WITH-SENDBIRD-CALLS-ENABLED';
var USER_ID = '';           // This will be your Agent's User ID
var ACCESS_TOKEN = null;    // Provide token if necessary.


/**
 * DESK VARIABLES AND ENTRYPONT
*/
var URLPARAMS;
const DESK_APP_ID = 'YOUR-APPLICATION-ID-WITH-DESK-FEATURE-ENABLED';
const DESK_API_TOKEN = 'YOUR-DESK-API-TOKEN';
const DESK_APP_API_TOKEN = 'YOUR-DESK-APP-API-TOKEN';

/**
 * SendBird Desk Platform API
 */
const DESK_ENDPOINT = 'https://desk-api-' + DESK_APP_ID + '.sendbird.com/platform/v1';

/**
 * Current ticket information
 */
var DESK_CURRENT_TICKET;

/**
 * Current desk Agent information
 */
var DESK_AGENT;


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
 * Set to true if inside a Desk Iframe
 */
var DESK_CALLS_IFRAME = true;


/**
 * Connect to Sendbird SDK
 */
function connect() {
    sb = new SendBird({
        appId: APP_ID
    });
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        if (error) {
            console.dir(error);
            updateUI('LogError', 'Error connecting to sendbird: ' + error); 
        } else {
            connectCalls();
            updateUI('ShowMainPanel');
            toggleVisibility('btnConnect', false);
        }
    });
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
            updateUI('LogError', "Calls Authentication failed: " + error);
        } else {
            updateUI('LogSuccess', 'Calls authorized');
            /**
             * Establishing websocket connection
             */
            SendBirdCall.connectWebSocket()
                .then(() => {
                    updateUI('LogSuccess', 'Connected to SendBird');
                    toggleVisibility('makeCallPanel', true);
                    toggleVisibility('connectCallPanel', false);
                })
                .catch(() => {
                    updateUI('LogError', 'Failed to connect to Socket server');
                });
        }
    });
}

/**
 * Make a call to your customer
 * 
 * IMPORTANT:
 * ==========
 * 1) You can't call a customer who has never logged in.
 * 2) You can't call a customer who is not inside SendBird's DB:
 * 
*/
function makeCall() {
    const dialParams = {
        userId: DESK_CURRENT_TICKET.customer.sendbirdId,
        isVideoCall: true,
        callOption: {
            localMediaView: getVideoObjectCaller(),
            remoteMediaView: getVideoObjectCallee(),
            videoEnabled: true,
            audioEnabled: true
        }
    };
    /**
     * If you want to set local and remote video in a lazy way:
     * ==========================================================
     * call.setLocalMediaView(document.getElementById('local_video_element_id'));
     * call.setRemoteMediaView(document.getElementById('remote_video_element_id'));
     */
    const call = SendBirdCall.dial(dialParams, (call, error) => {
        if (error) {
            updateUI('LogError', 'Dial Failed!');
        } else {
            updateUI('LogSuccess', 'Dial Success');
        }    
    });    
    call.onEstablished = (call) => {
        currentCall = call;  
        updateUIMakeCallEstablished();    
    };
    call.onConnected = (call) => {
        updateUIMakeCallCallConnected();
    };
    call.onEnded = (call) => {
        currentCall = null;
        updateUIMakeCallEnded();
    };    
    call.onRemoteAudioSettingsChanged = (call) => {
        console.log('Remote user changed audio settings');
    };    
    call.onRemoteVideoSettingsChanged = (call) => {
        console.log('Remote user changed video settings');
    };
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
 * Once this application is invoked from Desk, we will have some infomration we can use.
 */
function fromUrlParametersToObject() {
    /**
     * Get values from URL
     */
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    /**
     * Parse them
     */
    if (urlParams) {
        const agent_id = urlParams.get('agent_id');
        const ticket_id = urlParams.get('ticket_id');
        const html_key = urlParams.get('html_key');
        URLPARAMS = {
            agent_id, ticket_id, html_key
        }
    } else {
        console.log('No URL parameters sent');
    }
}

/**
 * Use Platform API to get information about this Agent
 */
function getAgentInfo(callback) {
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
 * Use Platform API to get information about this ticket
 */
function getTicketInfo(callback) {
    const url = DESK_ENDPOINT + '/tickets/' + URLPARAMS.ticket_id;
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json, charset=utf8',
            'SENDBIRDDESKAPITOKEN': DESK_API_TOKEN
        }
    }).then((response) => {
        DESK_CURRENT_TICKET = response.data;
        console.dir(DESK_CURRENT_TICKET);
        redrawMakeCallButton();
        callback(true);
    }).catch((error) => {
        console.dir(error);
        callback(false);
    })
}

function redrawMakeCallButton() {
    document.getElementById('butMakeCall').innerHTML = 'Call ' + DESK_CURRENT_TICKET.customer.sendbirdId;
}

/**
 * Show Agent and Ticket information on screen
 */
function showAgentInfoOnScreen() {
    getElement('agent_info').html(`        
    <p style="margin-top:1rem;">
        Agent ID: ${ DESK_AGENT.sendbirdId } 
    </p>
    <p>
        Ticket ID: ${ URLPARAMS.ticket_id } 
    </p>`);
}


/**
 * ALL BEGINS HERE
 * ===============
 * Read URL params. This will work if you are called from Desk's IFRAME.
 */
if (DESK_CALLS_IFRAME) {
    /**
     * Grab parameters from URL (sent by Desk IFRAME)
     */
    fromUrlParametersToObject(); 
    /**
     * Get agent info using Platform API
     */
    getAgentInfo(() => {
        /**
         * Get ticket info
         */
        getTicketInfo(() => {
            /**
             * Set user ID to establish a connection
             */
            USER_ID = DESK_AGENT.sendbirdId;
            /**
             * Show info on screen
             */
            showAgentInfoOnScreen();
            /**
             * Connect to SendBird SDK
             */
            connect();
        })
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
function getMainMenuPanel() {
    return getElement('mainMenu');
}
function getVideoObjectCaller() {
    return document.getElementById('local_video_element_id');
}
function getVideoObjectCallee() {
    return document.getElementById('remote_video_element_id');
}
function updateUI(action, text = '') {
    console.log(action + '=>' + text);
    if (action === 'ShowMainPanel') {
        toggleVisibility('mainMenu', true);
    } else if (action === 'LogError') {
        getElement('logError').html(text);
    } else if (action === 'LogSuccess') {
        getElement('logSuccess').html(text);
    }
}
function updateUIWhenendingCall() {
    updateUI('LogSuccess', 'Call ended');
    toggleVisibility('makeCallPanel', true);
    toggleVisibility('butMakeCall', true);
    toggleVisibility('butEndCall', false);
}
function updateUIWhenCallEstablished() {
    updateUI('LogSuccess', 'Wait for call - Call established');
    toggleVisibility('makeCallPanel', false);
}
function updateUIMakeCallEstablished() {
    updateUI('LogSuccess', 'Make Call - Call established');
    toggleVisibility('butMakeCall', false);
    toggleVisibility('butEndCall', true);
}
function updateUIMakeCallEnded() {
    updateUI('LogSuccess', 'Call ended');
    toggleVisibility('butMakeCall', true);
    toggleVisibility('butEndCall', false);
}
function updateUIMakeCallCallEnded() {
    console('LogSuccess', 'Call ended');
}
function updateUIMakeCallCallConnected() {
    updateUI('LogSuccess', 'Call connected');
}
function toggleVisibility(id, show) {
    show ? getElement(id).show() : getElement(id).hide();
}

