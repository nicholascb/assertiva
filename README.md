# assertiva

## Table of Contents

- [Installation](#installation)
- [Usage](#Importing Postman Collection)

## Installation

To run the project using Docker and Docker Compose, follow these steps:

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Clone the project repository:

   ```shell
   git clone https://github.com/nicholascb/assertiva.git
   ```

3. Navigate to the project directory:

   ```shell
   cd assertiva
   ```

4. Build and start the Docker containers:

   ```shell
   docker-compose up -d
   ```

   This command will build the necessary Docker images and start the containers in detached mode.

5. Access the project in your browser:

   ```shell
   http://localhost:6868
   ```

   You should now be able to access the project in your browser at the specified URL.

6. To stop the Docker containers, run the following command:

   ```shell
   docker-compose down
   ```

   This will stop and remove the containers.

## Importing Postman Collection

To use the `nicholas.postman_collection.json` file, follow these instructions:

1. Make sure you have Postman installed on your machine. If you don't have it, you can download and install it from the official website.

2. Open Postman and click on the "Import" button located in the top-left corner of the application.

3. In the import dialog, select the "File" tab and click on the "Choose Files" button.

4. Navigate to the location where the `nicholas.postman_collection.json` file is saved and select it.

5. Click on the "Import" button to import the collection into Postman.

6. Once the import is complete, you will see the collection listed in the left sidebar of Postman.

7. You can now explore the endpoints and requests defined in the collection and use them for testing and development purposes.

Please note that the `nicholas.postman_collection.json` file is a Postman collection file, which contains a set of API endpoints and requests.
