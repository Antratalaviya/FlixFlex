# FlixFlex

FlixFlex is a video streaming backend application where user can register themselves, can post videos, comments, like the videos and comments, subscribe the channel they want, can search video on the basis of keyword.

##### Technologies Used
- Node.js
- Express
- Database Integration MongoDB

##### Hands on Experience with:
- firebase Integration
- multer
- swagger

##### Features
- register and login
- update user account
- upload, edit, update and delete video
- like, comment and subscribe the video

# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|CORS           | Cors accepted values            | "http://localhost:3000","http://localhost:30001"      |

---

# Pre-requisites

For development, you will only need Node.js installed in your environement.

### Node
- #### Node installation

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v20.11.1

    $ npm --version
    10.1.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install npm -g


## Installation

### local installation:
#### 1. clone the repo

    $ git clonehttps://github.com/Antratalaviya/FlixFlex.git <project_name>

#### 2. cd into cloned repo

    $ cd <project_name>

#### 3. install dependencies


    $ npm install   
    $ npm install -D typescript

## Running the project

    $ npm run start  

Navigate to `http://localhost:8080`

- API Document endpoints

swagger Endpoint : http://localhost:8080/api-docs 

