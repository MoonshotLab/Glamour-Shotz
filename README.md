# Glamour ShotZ
A physical, interactive, multi filter video photo booth.

Participants enter a physical photo booth with props and a live preview. Before recording starts, they're prompted to apply filters to their future video via physical push buttons. Once the participant(s) decide on a filter, they pull a lever to begin recording.

After 15 seconds of capture, participants leave the booth and watch their filtered video on a separate screen. The video is automatically uploaded to a Facebook event where they can publicly share their experience.



## Setting up
Necessary hardware for this project includes 2 computers, a [phidget](www.phidgets.com), some physical SPST buttons, wire, and a Sony DSLR.

One computer is used as the application server and preforms the video processing work (the development computer). The other computer acts as a wifi consumer and makes it's own internet connection available to the development computer via a crossover cable. This is necessary because the DSLR provides it's API via rest routing which is only available when joining it's wifi network.

## Environment variables
Videos and posters are automatically uploaded to Amazon S3 and published on Facebook. The following environment variables are required:

* S3_KEY
* S3_SECRET
* S3_BUCKET
* FB_CLIENT_ID
* FB_SECRET

### Camera
1. Follow the [instructions](https://www.playmemoriescameraapps.com/portal/) provided by sony to register your camera device. This will allow you to install new apps on the camera.
2. The installed *Smart Remote Control* provides an insufficient API for this project. You must install the updated remote control app located [here](https://www.playmemoriescameraapps.com/portal/usbdetail.php?eid=IS9104-NPIA09014_00-F00002).
3. Launch the new *Smart Remote Control* app from the camera.

### Computer
1. `npm install`
2. `brew install ffmpeg`
3. Hook SPST inputs to the phidget. Details on which inputs are used can be found at `/lib/phidget.js`.
4. Find the appropriate [phidget driver](http://www.phidgets.com/docs/Operating_System_Support) for your machine.
5. [Turn on the phidget web service](http://www.phidgets.com/docs/OS_-_OS_X#WebService).
6. Use the development computer to join to the Camera's provided wifi network.
7. Use a cross over ethernet cable to connect your development machine, to your wifi machine.
8. `node .`



## Additional References
Documentation for Sony Cameras is actively managed by Sony. It is available as a [downloadable .pdf](https://developer.sony.com/downloads/all/sony-camera-remote-api-beta-sdk/).
