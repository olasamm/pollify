// Script to fix database indexes
// Run: node fixDatabase.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if polls collection has mail index (it shouldn't)
    const pollsCollection = db.collection('polls');
    const pollsIndexes = await pollsCollection.indexes();
    
    console.log('Current indexes on polls collection:');
    pollsIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Remove mail index from polls collection if it exists
    const mailIndex = pollsIndexes.find(idx => idx.key && idx.key.mail);
    if (mailIndex) {
      console.log('\nRemoving incorrect mail index from polls collection...');
      await pollsCollection.dropIndex(mailIndex.name);
      console.log('✓ Mail index removed from polls collection');
    } else {
      console.log('\n✓ No mail index found on polls collection');
    }

    // Ensure users collection has mail index
    const usersCollection = db.collection('users');
    const usersIndexes = await usersCollection.indexes();
    
    console.log('\nCurrent indexes on users collection:');
    usersIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Clean up documents with null or empty mail
    console.log('\nCleaning up invalid user documents...');
    const deleteResult = await usersCollection.deleteMany({ 
      $or: [
        { mail: null },
        { mail: '' },
        { mail: { $exists: false } }
      ]
    });
    if (deleteResult.deletedCount > 0) {
      console.log(`✓ Removed ${deleteResult.deletedCount} invalid user document(s)`);
    } else {
      console.log('✓ No invalid user documents found');
    }

    const usersMailIndex = usersIndexes.find(idx => idx.key && idx.key.mail);
    if (!usersMailIndex) {
      console.log('\nCreating mail index on users collection...');
      // Use sparse index to allow null values but ensure uniqueness for non-null values
      await usersCollection.createIndex({ mail: 1 }, { unique: true, sparse: true });
      console.log('✓ Mail index created on users collection');
    } else {
      console.log('\n✓ Mail index already exists on users collection');
    }

    console.log('\n✓ Database indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

fixDatabase();

