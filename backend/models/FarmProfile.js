const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const farmSchema = new Schema({
  userId: { type: String, required: true, unique: true },  // Simple user identifier (e.g., email or ID)
  location: { type: String },  // e.g., "Jaipur, Rajasthan"
  soilType: { type: String },  // e.g., "Sandy Loam"
  crops: [{ type: String }],   // Array e.g., ["Wheat", "Maize"]
  history: [{ 
    query: String, 
    response: String, 
    date: { type: Date, default: Date.now } 
  }]
});

module.exports = mongoose.model('FarmProfile', farmSchema);