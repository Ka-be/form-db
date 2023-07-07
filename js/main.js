const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors"); // To allow submit from different local URL



const app = express();
const port = 3000;

app.use(cors({ // To debug
  origin: "http://127.0.0.1:5500/index.html"
}));

async function getMongoDataBaseClient() {
  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);
  const dbName = "form-db";

  try {
    await client.connect();
    return client.db(dbName);
  } catch (error) {
    console.error("Erreur de connexion à la base de données", error);
    throw error;
  }
}

app.get("/api/survey", async function (req, res) {
  try {
    const dataBaseClient = await getMongoDataBaseClient();
    const surveyCollection = dataBaseClient.collection("survey");
    const surveyCursor = await surveyCollection.find();
    const surveyData = await surveyCursor.toArray();
    res.json(surveyData);
  } catch (error) {
    console.error("Erreur lors de la récupération des données", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération des données" });
  }
});

app.get("/api/survey/:id", async function (req, res) {
  const surveyId = req.params.id;

  try {
    const dataBaseClient = await getMongoDataBaseClient();
    const surveyCollection = dataBaseClient.collection("survey");
    const survey = await surveyCollection.findOne({ _id: ObjectId(surveyId) });

    if (survey) {
      res.json(survey);
    } else {
      res.status(404).json({ error: "Enquête non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'enquête", error);
    res.status(500).json({ error: "Une erreur est survenue lors de la récupération de l'enquête" });
  }
});

app.listen(port, function () {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});


// ENREGISTREMENT DATA

app.use(express.urlencoded({ extended: true })); // Middleware pour analyser les données du formulaire

app.post("/api/survey", async function (req, res) {
  const { firstname, lastname, music } = req.body;

  try {
    const dataBaseClient = await getMongoDataBaseClient();
    const surveyCollection = dataBaseClient.collection("survey");

    const surveyData = {
      firstname: firstname,
      lastname: lastname,
      music: music
    };

    const result = await surveyCollection.insertOne(surveyData);

    res.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données", error);
    res.status(500).json({ error: "Une erreur est survenue lors de l'enregistrement des données" });
  }
});
