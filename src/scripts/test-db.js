const { testConnection, executeQuery, closeConnections } = require('../config/database');

const testDatabase = async () => {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test basic connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('\n🔍 Testing database queries...');
      
      // Test query to check table structure
      const tableInfo = await executeQuery('DESCRIBE urls');
      console.log('📋 URLs table structure:');
      console.table(tableInfo);
      
      // Test query to count records
      const [countResult] = await executeQuery('SELECT COUNT(*) as total FROM urls');
      console.log(`📊 Total URLs in database: ${countResult.total}`);
      
      console.log('\n✅ All database tests passed!');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    closeConnections();
    process.exit(0);
  }
};

// Run the test
testDatabase();
