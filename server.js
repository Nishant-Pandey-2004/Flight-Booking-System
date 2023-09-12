const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

const url = "mongodb://127.0.0.1:27017";
const dbName = "esd";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

async function createUser(req, res) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbName);
    const collection = db.collection("user");

    const { first_name, last_name, email, gender, phone, age, password } = req.body;

    const newUser = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      gender: gender,
      phone: phone,
      age: age,
      password: password
    };

    const result = await collection.insertOne(newUser);
    console.log("Created document:", result.insertedId);

    res.send(result.insertedId);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Disconnected from the database");
  }
}

async function loginDocument(req, res) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbName);
    const collection = db.collection("user");
    const { email, password } = req.body;

    const user = await collection.findOne({ email: email });
    if (user && user.password === password) {
      console.log("Login successful");

      // Send user data as response
      res.json(user);
    } else {
      console.log("Invalid email or password");
      res.status(401).send("Invalid email or password");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred during login");
  } finally {
    await client.close();
    console.log("Disconnected from the database");
  }
}

async function searchFlights(req, res) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbName);
    const collection = db.collection("flights");

    const { origin, destination, departure, returnDate } = req.body;

    // Prepare the search criteria
    const searchCriteria = {
      origin: origin,
      destination: destination,
      departure: departure,
      return: returnDate,
    };

    // Perform the search query based on the provided criteria
    const result = await collection.find(searchCriteria).toArray();

    if (result.length > 0) {
      console.log("Retrieved matching flights:", result);
      res.json(result);
    } else {
      console.log("No flights found for the given criteria");
      res.status(404).send("No flights found for the given criteria");
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("An error occurred during flight search");
  } finally {
    await client.close();
    console.log("Disconnected from the database");
  }
}


async function updateDocument(req, res) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log("Connected to the database");

    const db = client.db(dbName);
    const collection = db.collection("user");

    const phone = req.body.phone;
    const password = req.body.password;

    const filter = { phone: phone };
    const update = { $set: { password: password } };

    const result = await collection.updateOne(filter, update);
    console.log("Updated document:", result.modifiedCount);

    if (result.modifiedCount === 1) {
      res.send("Password changed");
    } else {
      res.send("Unsuccessfull");
    }
  } catch (err) {
    console.error("Error:", err);
    res.send("An error occurred during the update operation");
  } finally {
    await client.close();
    console.log("Disconnected from the database");
  }
}

app.post("/create", (req, res) => {
  createUser(req, res);
});

app.post("/login", (req, res) => {
  loginDocument(req, res);
});


app.put("/update", (req, res) => {
  updateDocument(req, res);
});

app.post("/search", (req, res) => {
  searchFlights(req, res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
