const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates on the html script tag
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
    console.log(message);
    // this stores the final html that we will be rendering on the browser 
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:m:a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) =>{
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h: m: a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// /this gets the text value in the input
$messageForm.addEventListener('submit', (e) =>{
    e.preventDefault()
    //here we are disabling the button onsubmit
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value //getting the inputed value in the index.html file
    socket.emit('sendMessage', message, (error) =>{
        //enable button 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if (error) {
            return console.log(error);
        }
        console.log('The message was delivered');
    })//emmiting the message in input
    
})


$sendLocationButton.addEventListener('click', () =>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
        $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () =>{
            console.log('Location shared');
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

// here we expect the server to setup a listener for join and to do what it needs to do so the event actually occurs
socket.emit('join', { username, room })