#!/bin/bash

# PSC Tech Voucher System Test Runner
echo "🚀 Starting PSC Tech Voucher System Tests..."

# Set environment variables
export NODE_ENV=test
export TEST_DATABASE=psctech_test

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create test database if it doesn't exist
echo "🗄️ Setting up test database..."
echo "Note: Ensure Azure SQL test database 'psctech_test' exists"

# Run database setup scripts
echo "🔧 Running database setup scripts..."
# Note: These would need to be run manually in Azure SQL Management Studio
echo "Please run the following SQL scripts in Azure SQL:"
echo "1. azure-sql-deployment/01-create-master-database.sql"
echo "2. azure-sql-deployment/02-create-institution-database.sql"

# Run tests
echo "🧪 Running voucher system tests..."
npm run test:voucher

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Some tests failed. Check the output above for details."
    exit 1
fi

echo "🎉 Test run completed!"


