const mongoose = require('mongoose');

// A generic schema that maps to the existing "Schema" collection.
// We don't know the structure ahead of time so allow any fields (strict:false).
// Third argument specifies the exact collection name to avoid pluralization.

const schemaSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('Schema', schemaSchema, 'Schema');
