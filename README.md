# Glamour ShotZ
A physical, interactive, multi filter video photo booth.

[![Photo Booth!](https://raw.githubusercontent.com/MoonshotLab/Glamour-Shotz/master/public/documentation/video-preview.png)](https://www.dropbox.com/s/3yhcydq6vd00mks/holiday-party.mp4?dl=0)

Participants enter a physical photo booth with props and a live preview. Before recording starts, they're prompted to apply filters to their future video via physical push buttons. Once the participant(s) decide on a filter, they pull a lever to begin recording.

![Photo Booth!](https://raw.githubusercontent.com/MoonshotLab/Glamour-Shotz/master/public/documentation/front.jpg)

After 15 seconds of capture, participants leave the booth and watch their filtered video on a separate screen. The video is automatically uploaded to a Facebook event where they can publicly share their experience.

You can view the output of the booth's first usage at a party [here](https://www.youtube.com/watch?v=QtiYtNgy874&list=PLOHQarD_3VlHDLZBgypxjeUhYAf2WGAVi).

![Drinking](http://s3.amazonaws.com/glamour-shotz/1449787703503.gif)


## Setting up
Necessary hardware for this project includes a computer, a [phidget](www.phidgets.com), some physical SPST buttons, wire, and a Sony DSLR.

[![In the mouth](http://img.youtube.com/vi/HdupX33crIY/0.jpg)](http://www.youtube.com/watch?v=HdupX33crIY)



## Consuming Multiple Wifi Networks
Originally, the plan was to consume a computer's wifi network via a crossover cable. This would allow the photo processing machine to upload videos AND work off the Sony Camera's wifi API. This didn't work :(.



### Client Side Dependencies
The only client side dependency is [jquery](http://code.jquery.com/jquery-2.1.4.min.js). I didn't want to add an extra layer of complexity by adding a client package manager, and I didn't want to commit the lib to the repo. You'll have to manually download them and drop it in the `/public/vendor` directory.

[![Licking Faces](http://img.youtube.com/vi/ryC9pBLhD4k/0.jpg)](http://www.youtube.com/watch?v=ryC9pBLhD4k)

### Environment variables
Videos and posters are automatically uploaded to Amazon S3 and published on Facebook. The following environment variables are required:

* S3_KEY
* S3_SECRET
* S3_BUCKET
* FB_CLIENT_ID
* FB_SECRET

### Camera
1. Follow the [instructions](https://www.playmemoriescameraapps.com/portal/) provided by sony to register your camera device. This will allow you to install new apps on the camera.
2. The installed *Smart Remote Control* provides an insufficient API for this project. You must install the updated remote control app located [here](https://www.playmemoriescameraapps.com/portal/usbdetail.php?eid=IS9104-NPIA09014_00-F00002).
3. For best results, tune the camera to the following settings: 120 fps. 240 shutter speed, auto video mode, variable iso.
4. Launch the new *Smart Remote Control* app from the camera.



### Computer
1. `npm install`
2. `brew install ffmpeg`
3. Hook SPST inputs to the phidget. Details on which inputs are used can be found at `/lib/phidget.js`.
4. Find the appropriate [phidget driver](http://www.phidgets.com/docs/Operating_System_Support) for your machine.
5. [Turn on the phidget web service](http://www.phidgets.com/docs/OS_-_OS_X#WebService).
6. Use the development computer to join to the Camera's provided wifi network.
7. Use a cross over ethernet cable to connect your development machine, to your wifi machine. A useful guide can be found [here](http://www.mactip.net/share-internet-connection-mac/).
8. `node .`



## Additional References
Documentation for Sony Cameras is actively managed by Sony. It is available as a [downloadable .pdf](https://developer.sony.com/downloads/all/sony-camera-remote-api-beta-sdk/).
