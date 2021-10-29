
var APP_ID = '';
var USER_ID = '';
var URLPARAMS;
var sb;
var currentCall;
var DESK_ENDPOINT;
var DESK_API_TOKEN;
var TICKET;

function startAll() {    
    var appId = document.getElementById('appId').value;
    var userId = document.getElementById('userId').value;
    var message = isCustomer ? document.getElementById('message').value : 'No message needed';
    if (!appId || !userId || !message) {
        showLog('Missing data');
        return;
    }
    APP_ID = appId;
    USER_ID = userId;
    if (!isCustomer) {
        DESK_ENDPOINT = 'https://desk-api-' + APP_ID + '.sendbird.com/platform/v1';
        DESK_API_TOKEN = document.getElementById('deskApiKey').value;
    }
    sb = new SendBird({
        appId: APP_ID
    });
    sb.connect(USER_ID, (user, error) => {
        if (error) {
            showLog('Error connecting to sendbird:' + error); 
        } else {
            document.getElementById('loginDiv').style.display = 'none';
            if (isCustomer) {
                // CUSTOMER
                connectToDesk();
            } else {
                // AGENT
                getTIcketInfo(() => {
                    showTicketInfo();
                    connectToCalls();
                })
            }
        }
    });
}

function connectToDesk() {
    SendBirdDesk.init(SendBird);
    SendBirdDesk.authenticate(USER_ID, (res, err) => {
        if (err) {
            showLog('Error connecting to SendBird Desk: ' + err);
        } else {
            createTicket(() => {
                connectToCalls();
            })    
        }
    });
}

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

function showTicketInfo() {
    var out = `
    <div class="small">
        <b>${ TICKET.channelName }</b> <br>
        ${ TICKET.customer.displayName } <br>
        User ID: ${ TICKET.customer.sendbirdId } 
    </div>
    `;
    document.getElementById('ticketId').innerHTML = out;
}

function createTicket(callback) {
    var message = document.getElementById('message').value;
    if (!message) {
        return;
    }
    SendBirdDesk.Ticket.create(
        'Customer testing SB Calls from IFRAME',
        USER_ID,
        "group-web-app",
        (ticket, err) => {
            if (err) {
                console.log('Unable to create this ticket!', err);
            } else {
                console.log(ticket);
                if (!ticket.channel) {
                    console.log('Your name must match our created users in Desk');
                } else {
                    sendMessageToTicket(ticket.channel, message, callback);
                }    
            }
        }
    );
}

function sendMessageToTicket(channel, msg, callback) {
    channel.sendUserMessage(msg, (message, error) => {
        callback();
    })
}

function connectToCalls() {
    SendBirdCall.init(APP_ID)
    askBrowserPermission();
    authorizeSignedUser();
}

function askBrowserPermission() {
    SendBirdCall.useMedia({ audio: true, video: true });
}

function authorizeSignedUser() {
    const authOption = { 
        userId: USER_ID
    };
    SendBirdCall.authenticate(authOption, (res, error) => {
        if (error) {
            console.log("Calls Authentication failed: " + error);
        } else {
            SendBirdCall.connectWebSocket().then(() => {
                console.log('Connected to SendBird Calls');
                if (isCustomer) {
                    // CUSTOMER
                    document.getElementById('waitForCallDiv').style.display = 'block';
                    waitForCalls();
                } else {
                    // AGENT
                    document.getElementById('makeCallDiv').style.display = 'block';
                    document.getElementById('butMakeCall').style.display = 'block';
                }
            })
            .catch((err) => {
                console.log('Failed to connect to Socket server', err);
            });
        }
    });
}

/**
 * Wait for calls once authorized with Calls SDK
 */
function waitForCalls() {
    SendBirdCall.addListener('UNIQUE_HANDLER_ID', {
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
            document.getElementById('butAcceptCall').style.display = 'block';
            document.getElementById('butHangup').style.display = 'block';
        },
    });
}

function acceptCall() {
    if (currentCall) {
        const acceptParams = {
            callOption: {
                localMediaView: getVideoObjectCaller(),
                remoteMediaView: getVideoObjectCallee(),
                audioEnabled: true,
                videoEnabled: true
            }
        };    
        currentCall.accept(acceptParams);
        document.getElementById('butAcceptCall').style.display = 'none';
    }
}

function makeCall() {
    const dialParams = {
        userId: TICKET.customer.sendbirdId,
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
        document.getElementById('butHangup').style.display = 'block';
        document.getElementById('butMakeCall').style.display = 'none';
    };
    call.onConnected = (call) => {
    };
    call.onEnded = (call) => {
        currentCall = null;
        document.getElementById('butHangup').style.display = 'none';
        document.getElementById('butMakeCall').style.display = 'block';
    };    
    call.onRemoteAudioSettingsChanged = (call) => {
    };    
    call.onRemoteVideoSettingsChanged = (call) => {
    };
}

function hangupCall() {
    if (currentCall) {
        currentCall.end();
    }
    if (isCustomer) {
        // CUSTOMER
        document.getElementById('butHangup').style.display = 'none';
        document.getElementById('butAcceptCall').style.display = 'none';
    } else {
        // AGENT
        document.getElementById('butHangup').style.display = 'none';
        document.getElementById('butMakeCall').style.display = 'block';
    }
}

function fromUrlParametersToObject() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams) {
        const agent_id = urlParams.get('agent_id');
        const ticket_id = urlParams.get('ticket_id');  //'7455139';
        const html_key = urlParams.get('html_key');
        URLPARAMS = {
            agent_id, ticket_id, html_key
        }
        console.dir(URLPARAMS);
    } else {
        console.log('No URL parameters sent');
    }
}

function getVideoObjectCaller() {
    return document.getElementById('local_video_element_id');
}
function getVideoObjectCallee() {
    return document.getElementById('remote_video_element_id');
}

function showLog(text) {
    document.getElementById('log').innerHTML = text;
}


fromUrlParametersToObject();

