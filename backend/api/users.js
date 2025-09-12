const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Database configuration
const dbConfig = {
  server: process.env.DB_SERVER || 'psctech-rg.database.windows.net',
  database: process.env.DB_NAME || 'psctech_main',
  user: process.env.DB_USER || 'psctechadmin',
  password: process.env.DB_PASSWORD || 'Rluthando@12',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

// Helper function to get database connection
async function getConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

// GET /api/users - Get all users (with filtering)
router.get('/', async (req, res) => {
  try {
    const { role, institution_id, is_active } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        up.phone,
        i.name as institution_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN institution_details i ON u.institution_id = i.institution_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (role) {
      query += ` AND u.role = @role`;
      params.push({ name: 'role', value: role });
    }
    
    if (institution_id) {
      query += ` AND u.institution_id = @institution_id`;
      params.push({ name: 'institution_id', value: institution_id });
    }
    
    if (is_active !== undefined) {
      query += ` AND u.is_active = @is_active`;
      params.push({ name: 'is_active', value: is_active === 'true' ? 1 : 0 });
    }
    
    query += ` ORDER BY u.created_at DESC`;
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.value));
    
    const result = await request.query(query);
    
    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users',
      message: error.message 
    });
  }
});

// GET /api/users/:id - Get user details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const query = `
      SELECT 
        u.*,
        up.first_name,
        up.last_name,
        up.phone,
        up.address,
        up.profile_picture,
        up.preferences,
        i.name as institution_name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN institution_details i ON u.institution_id = i.institution_id
      WHERE u.id = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(query);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { id, username, email, role, institution_id, first_name, last_name, phone } = req.body;
    
    // Validation
    if (!id || !username || !email || !role || !institution_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    if (!['principal', 'teacher', 'parent', 'learner', 'sgb'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }
    
    const pool = await getConnection();
    
    // Check if user already exists
    const existingUser = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT id FROM users WHERE id = @id');
    
    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Insert user
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('role', sql.NVarChar, role)
      .input('institution_id', sql.VarChar, institution_id)
      .query(`
        INSERT INTO users (id, username, email, role, institution_id)
        VALUES (@id, @username, @email, @role, @institution_id)
      `);
    
    // Insert user profile if provided
    if (first_name || last_name || phone) {
      await pool.request()
        .input('user_id', sql.VarChar, id)
        .input('first_name', sql.NVarChar, first_name || '')
        .input('last_name', sql.NVarChar, last_name || '')
        .input('phone', sql.NVarChar, phone || '')
        .query(`
          INSERT INTO user_profiles (user_id, first_name, last_name, phone)
          VALUES (@user_id, @first_name, @last_name, @phone)
        `);
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id, username, email, role, institution_id }
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, is_active, first_name, last_name, phone } = req.body;
    
    const pool = await getConnection();
    
    // Update user
    if (username || email || role || is_active !== undefined) {
      let updateQuery = 'UPDATE users SET ';
      const params = [];
      
      if (username) {
        updateQuery += 'username = @username, ';
        params.push({ name: 'username', value: username });
      }
      
      if (email) {
        updateQuery += 'email = @email, ';
        params.push({ name: 'email', value: email });
      }
      
      if (role) {
        updateQuery += 'role = @role, ';
        params.push({ name: 'role', value: role });
      }
      
      if (is_active !== undefined) {
        updateQuery += 'is_active = @is_active, ';
        params.push({ name: 'is_active', value: is_active ? 1 : 0 });
      }
      
      updateQuery += 'updated_at = GETUTCDATE() WHERE id = @id';
      params.push({ name: 'id', value: id });
      
      const request = pool.request();
      params.forEach(param => request.input(param.name, param.value));
      
      await request.query(updateQuery);
    }
    
    // Update user profile
    if (first_name || last_name || phone) {
      const profileExists = await pool.request()
        .input('user_id', sql.VarChar, id)
        .query('SELECT id FROM user_profiles WHERE user_id = @user_id');
      
      if (profileExists.recordset.length > 0) {
        // Update existing profile
        let profileQuery = 'UPDATE user_profiles SET ';
        const profileParams = [];
        
        if (first_name) {
          profileQuery += 'first_name = @first_name, ';
          profileParams.push({ name: 'first_name', value: first_name });
        }
        
        if (last_name) {
          profileQuery += 'last_name = @last_name, ';
          profileParams.push({ name: 'last_name', value: last_name });
        }
        
        if (phone) {
          profileQuery += 'phone = @phone, ';
          profileParams.push({ name: 'phone', value: phone });
        }
        
        profileQuery += 'updated_at = GETUTCDATE() WHERE user_id = @user_id';
        profileParams.push({ name: 'user_id', value: id });
        
        const profileRequest = pool.request();
        profileParams.forEach(param => profileRequest.input(param.name, param.value));
        
        await profileRequest.query(profileQuery);
      } else {
        // Create new profile
        await pool.request()
          .input('user_id', sql.VarChar, id)
          .input('first_name', sql.NVarChar, first_name || '')
          .input('last_name', sql.NVarChar, last_name || '')
          .input('phone', sql.NVarChar, phone || '')
          .query(`
            INSERT INTO user_profiles (user_id, first_name, last_name, phone)
            VALUES (@user_id, @first_name, @last_name, @phone)
          `);
      }
    }
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// GET /api/users/stats/overview - Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { institution_id } = req.query;
    const pool = await getConnection();
    
    let whereClause = '';
    const params = [];
    
    if (institution_id) {
      whereClause = 'WHERE institution_id = @institution_id';
      params.push({ name: 'institution_id', value: institution_id });
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'principal' THEN 1 ELSE 0 END) as principals,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers,
        SUM(CASE WHEN role = 'parent' THEN 1 ELSE 0 END) as parents,
        SUM(CASE WHEN role = 'learner' THEN 1 ELSE 0 END) as learners,
        SUM(CASE WHEN role = 'sgb' THEN 1 ELSE 0 END) as sgb_members,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users
      FROM users
      ${whereClause}
    `;
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.value));
    
    const result = await request.query(statsQuery);
    const stats = result.recordset[0];
    
    res.json({
      success: true,
      data: {
        total_users: parseInt(stats.total_users),
        principals: parseInt(stats.principals),
        teachers: parseInt(stats.teachers),
        parents: parseInt(stats.parents),
        learners: parseInt(stats.learners),
        sgb_members: parseInt(stats.sgb_members),
        active_users: parseInt(stats.active_users),
        inactive_users: parseInt(stats.inactive_users)
      }
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
});

module.exports = router;


