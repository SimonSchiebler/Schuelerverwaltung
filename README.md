# what is the Schuelerverwaltung Project?
This full stack Application is a candidate project for a competition at the HSS (hubert Sternberg Schule) School intended to facilitate the registration process for new students. 
Students will be able to enter their private information needed for the registration and teachers will be able to review and export that data for further processing by the schools secretary. 

Students gain permission to provide their data with an registration code that they obtain from a teacher. 

The web interface provided by this Application lets teachers generate, delete and manage registration codes. 
# Getting Started
## Dependencies
This application runs inside of docker containers.
to install docker simply run:

```
sudo apt-get install docker
```

If you want to run the server outside of docker for debugging purposes you will also need to have node installed.

```
sudo apt-get install node
```

## Building the docker image

To build the docker container for this application, navigate to the webapp folder and run buildDockerContainer.sh with super user privileges. 

```
sudo chmod +x buildDockerContainer.sh
./buildDockerContainer.sh
```
this will create a Schuelerverwaltung.tar docker image in the docker folder of this application.

## Running the  server

To run the image and set up the mongo database backend run the run.sh executable inside of the docker folder with super user privileges.
```
sudo chmod +x run.sh
sudo ./run.sh
```
This will create two docker containers inside of a bridged virtual network. The node container running the web application will expose the 443 Https port to connections from outside.

the page should now be accessible under the URL

https://\<ip or hostname of the server>

The default administrator has the following username and password:

Username: admin

Password: admin

It is very important to change the Password as soon as possible.

## Development and debugging
As the application needs a database backend in order to function you first need to start a mongodb server.

```
docker run -d -e MONGO_INITDB_DATABASE=test mongo:latest -p 27017:27017
```

As soon as the server is properly running and all node dependencies are installed you can start the server from the webapp folder.
```
cd webapp
npm run start
```

# Using the page
## Types of users
There are two types of users.

1. Teachers
2. Admins

Teachers have permission to create and delete registration codes, delete specific students and generate csv exports.

The administrator can create/delete Teachers, change their passwords and upload ssl certificates. He is the onlz person who has access to the `/admin` pages.

## Creating and managing registration codes

registration codes are used to provide students with privileges to deposit data through the web interface. these codes are a mandatory Field in the students registration form located at `/schueler`

after successful login as a teacher or admin you are presented with the registration code management page. Here you can add and delete registratio codes, delete specific students and download all data to a specific registration code in csv format.

Registration codes can be set active and inactive. Upon review of the data provided by the students it best practive to set the registration code to inactive to prevent new data to be added while you reviev.

## Managing teachers

Only the admin user can manage teachers. This menu is located at `/admin`.

## Uploading ssl certificates
Only the admin user can upload certificates. The key and crt file can be uploaded in the `/admin` menu.

Be aware that after uploading new certificates the server will restart. Any open connection to the server will be closed, so make sure that nobody else accesses the server while you change certificates.

## Uploading student data
Students can enter their information on the `/schueler` page. in order to do so they need an active registration code. This code is entered at the bottom of the page.
