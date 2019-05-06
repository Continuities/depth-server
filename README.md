# depth-server
## Requirements
1. NodeJS 0.10.24
2. OpenNI 2.2
3. NiTE 2.2
4. Python 2.7.2

Note: Old node requires old node-gyp requires old Python. Recommend using pyenv to run python 2.7.2.

## Installation
_Mostly stolen from https://blog.gordonturner.com/2014/02/22/kinect-openni-nite-and-nuimotion-setup-for-osx/_

These instructions are out of date. You no longer need OpenNI or NiTE.

1. `brew install libfreenect`
2. Download latest OpenNI and NiTE from http://download.dahoo.fr/Ressources/openNi/
3. Extract OpenNI, run sudo ./install.sh
4. Same for NiTE
5. copy `/usr/local/lib/libFreenectDriver.dylib` to `./OpenNI-MacOSX-x64-2.2/Redist/OpenNI2/Drivers/`
6. Recursively copy `./OpenNI-MacOSX-x64-2.2/Redist/*` to `/usr/local/lib/`
7. Recursively copy `./NiTE-MacOSX-x64-2.2/Redist/*` to `/usr/local/lib/`
8. Run `cat ./OpenNI-MacOSX-x64-2.2/OpenNIDevEnvironment >> ~/.bash_profile`
9. Run `cat ./NiTE-MacOSX-x64-2.2/NiTEDevEnvironment >> ~/.bash_profile >> ~/.bash_profile`
10. Add OPENNI2 and NITE2 environment variables, pointing to the install dirs
11. Make sure you're using Node 0.10.24 (nvm is your friend!). It will fail in newer versions.
12. Finally, run `npm install` 

### It's different on the Pi!
1. Install libfreenect as described https://github.com/OpenKinect/libfreenect
2. Install OpenNI as described here https://gist.github.com/chatchavan/990d3c0a5b085dc7bae1
3. `sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev`
4. `npm install`???

### Modern instructions for the NUC
1. Install Ubuntu
2. Install nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash`
3. `nvm install 0.10.24`
4. `npm config set strict-ssl false`
5. `git clone https://github.com/Continuities/depth-server.git`
6. `cd depth-server`
7. `sudo apt-get install python make build-essential libudev-dev`
8. Annoying things to make node-kinect build:
    a. `sudo mkdir /usr/include/libfreenect && sudo cp /usr/include/libfreenect.h /usr/include/libfreenect`
    b. Change `libfreenect.a` in `node-kinect/binding.gyp` to `/usr/lib/x86_64-linux-gnu/libfreenect.so`
9. `npm install`
