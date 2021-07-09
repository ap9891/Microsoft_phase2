const socket = io('/')
const video_Box = document.getElementById('video_Box')
const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer()

const myPeer = new Peer(undefined, {
	path: '/peerjs',
	host: '/',
	port: '5000',
})

const peers = {}
let myVideoStream
navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream
		addVideoStream(myVideo, stream)

		socket.on('user-connected', (userId) => {
			connectToNewUser(userId, stream)
			alert('Someone is connected to the call', userId)
		})

		peer.on('call', (call) => {
			call.answer(stream)
			const video = document.createElement('video')
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream)
			})
		})

		let text = $('input')

		$('html').keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val())
				text.val('')
			}
		})

		socket.on('createMessage', (message, userId) => {
			$('ul').append(
				`<li >
		<span class="messageHeader" style ="color: #212529" >
			<span style ="color: #212529">
				From 
				<span class="messageSender" >Someone</span> 
				to 
				<span  style ="color: #212529">Everyone:</span>
			</span>

			${new Date().toLocaleString('en-US', {
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			})}
		</span>

		<span class="message" style ="color: #212529">${message}</span>
	
	</li>`)
			scrollToBottom()
		})
	})
//Disconnet user from call
socket.on('user-disconnected', (userId) => {
	if (peers[userId]) peers[userId].close()
})
//for joining room
peer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id)
})
// answering the call and sending your stream
const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream)
	const video = document.createElement('video')
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream)
	})
	call.on('close', () => {
		video.remove()
	})

	peers[userId] = call
}
// connect your video and append to grid
const addVideoStream = (video, stream) => {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	video_Box.append(video)
}
//scrooling down of chat box
const scrollToBottom = () => {
	var d = $('.Chat_Box')
	d.scrollTop(d.prop('scrollHeight'))
}
//the mute and unmute functionality
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false
		setUnmuteButton()
	} else {
		setMuteButton()
		myVideoStream.getAudioTracks()[0].enabled = true
	}
}
// mute
const setMuteButton = () => {
	const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
	document.querySelector('.Mute_Button').innerHTML = html
}
// unmute
const setUnmuteButton = () => {
	const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
	document.querySelector('.Mute_Button').innerHTML = html
}
//the camera on and off functionality
const playStop = () => {
	console.log('object')
	let enabled = myVideoStream.getVideoTracks()[0].enabled
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false
		setPlayVideo()
	} else {
		setStopVideo()
		myVideoStream.getVideoTracks()[0].enabled = true
	}
}
// video off
const setStopVideo = () => {
	const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
	document.querySelector('.Video_Button').innerHTML = html
}
// video on
const setPlayVideo = () => {
	const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
	document.querySelector('.Video_Button').innerHTML = html
}
