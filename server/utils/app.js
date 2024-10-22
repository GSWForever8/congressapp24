// Existing imports...
const express = require('express');
const cors = require('cors'); 
const fetch = require('node-fetch');
// Existing imports...
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure node-fetch is installed
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { ORIGIN } = require('../constants'); // Ensure this exists
require('dotenv').config(); // Ensure dotenv is installed and a .env file exists

// Initialize app
const app = express();
const { API_KEY, ACCOUNT_ID, MONGO_URI } = process.env;

// Connect to MongoDB using Mongoose
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define the User model
const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String }
});
const User = mongoose.model('User', UserSchema);

// Middleware
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: false }));

// Helper function to call external APIs (e.g., Cloudflare)
async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  return response.json();
}

// API route for response generation
app.post('/api/study-aid', async (req, res) => {
  try {
    const input = {
      messages: [
        { role: "system", content: "You are a friendly assistant that helps students improve their grades." },
        { role: "user", content: req.body.question || "How do I study for an English test?" },
      ],
      max_tokens: 2048
    };

    const result = await run("@cf/meta/llama-3-8b-instruct", input);
    res.json(result); // Send back the generated response
  } catch (error) {
    console.error("Error during API call:", error);
    res.status(500).json({ error: "An error occurred while generating the response." });
  }
});

// API route for trend analysis
app.post('/trendanalyze', async (req, res) => {
  const { dates, grades, subject } = req.body;

  if (!dates || !grades || !subject) {
    return res.status(400).json({ error: "Dates, grades, and subject are required." });
  }

  const input = { dates, grades };

  try {
    // Call the Flask server to analyze trends
    const flaskResponse = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json();
      return res.status(500).json({ error: errorData.error });
    }

    const result = await flaskResponse.json();
    const plotUrl = `http://127.0.0.1:5000/static/${result.plot}`; // Construct plot URL

    // Fetch the image buffer from the Flask server
    const imageBuffer = await fetch(plotUrl).then(res => {
      if (!res.ok) throw new Error('Failed to fetch the image.');
      return res.buffer();
    });

    const imagePath = path.join(__dirname, '../../analyze/static', 'grade_trend_plot.png');

    // Save the image to the server
    fs.writeFileSync(imagePath, imageBuffer);

    // Prepare question for study aid
    const questionForStudyAid = `What can you say about the grades for ${subject} based on the following data: Dates - ${dates}, Grades - ${grades}?`;

    // Generate study aid response
    const studyAidInput = {
      messages: [
        { role: "system", content: "Given the data, construct a detailed study plan with goals to achieve an A." },
        { role: "user", content: questionForStudyAid },
      ],
      max_tokens: 2048,
    };

    const studyAidResult = await run("@cf/meta/llama-3-8b-instruct", studyAidInput);

    // Send back the analysis and the response from study aid
    res.json({
      message: 'Grade data updated successfully',
      analysis: result, // Analysis data from Flask
      plot: plotUrl, // Include the plot URL in the response
      studyAid: studyAidResult // Include the response from study-aid
    });

  } catch (error) {
    console.error("Error during trend analysis:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "An error occurred while analyzing trends." });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send();
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;

