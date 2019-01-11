# Dependencies
This application runs inside of docker containers.
to install docker simply run:

```
sudo apt-get install docker
```

If you want to run the server outside of docker for debugging purposes you will also need to have node installed.

```
sudo apt-get install node
```

# Building the docker image

To build the docker container for this application, navigate to the webapp folder and run buildDockerContainer.sh with super user privileges. 

```
sudo chmod +x buildDockerContainer.sh
./buildDockerContainer.sh
```
this will create a Schuelerverwaltung.tar docker image in the docker folder of this application.

# Running the  server

To run the image and set up the mongo database backend run the run.sh executable inside of the docker folder with super user privileges.
```
sudo chmod +x run.sh
sudo ./run.sh
```
This will create two docker containers and a bridged virtual network. The node container running the web application is exposing the 443 Https port.

the page should now be accessible under the URL


https://\<ip or hostname of the server>

# Development and debugging
As the application needs a database backend in order to function you first need to start a mongodb server.

```
docker run -d -e MONGO_INITDB_DATABASE=test mongo:latest -p 27017:27017
```

As soon as the server is properly running and all node dependencies are installed you can start the server from the webapp folder.
```
cd webapp
npm run start
```