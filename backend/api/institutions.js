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

// GET /api/institutions - Get all institutions
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    
    const query = `
      SELECT 
        institution_id,
        name,
        code,
        type,
        district,
        province,
        country,
        address,
        phone,
        email,
        website,
        logo_url,
        created_at,
        updated_at
      FROM institution_details
      ORDER BY name
    `;
    
    const result = await pool.request().query(query);
    
    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
    
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch institutions',
      message: error.message 
    });
  }
});

// GET /api/institutions/:id - Get institution details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const query = `
      SELECT 
        institution_id,
        name,
        code,
        type,
        district,
        province,
        country,
        address,
        phone,
        email,
        website,
        logo_url,
        created_at,
        updated_at
      FROM institution_details
      WHERE institution_id = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(query);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Institution not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
    
  } catch (error) {
    console.error('Error fetching institution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch institution',
      message: error.message
    });
  }
});

// POST /api/institutions - Create new institution
router.post('/', async (req, res) => {
  try {
    const { 
      institution_id, 
      name, 
      code, 
      type, 
      district, 
      province, 
      country = 'South Africa',
      address,
      phone,
      email,
      website,
      logo_url
    } = req.body;
    
    // Validation
    if (!institution_id || !name || !code || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    if (!['primary', 'secondary', 'combined'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid institution type'
      });
    }
    
    const pool = await getConnection();
    
    // Check if institution already exists
    const existingInstitution = await pool.request()
      .input('institution_id', sql.VarChar, institution_id)
      .query('SELECT institution_id FROM institution_details WHERE institution_id = @institution_id');
    
    if (existingInstitution.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Institution already exists'
      });
    }
    
    // Insert institution
    await pool.request()
      .input('institution_id', sql.VarChar, institution_id)
      .input('name', sql.NVarChar, name)
      .input('code', sql.NVarChar, code)
      .input('type', sql.NVarChar, type)
      .input('district', sql.NVarChar, district || '')
      .input('province', sql.NVarChar, province || '')
      .input('country', sql.NVarChar, country)
      .input('address', sql.NVarChar, address || '')
      .input('phone', sql.NVarChar, phone || '')
      .input('email', sql.NVarChar, email || '')
      .input('website', sql.NVarChar, website || '')
      .input('logo_url', sql.NVarChar, logo_url || '')
      .query(`
        INSERT INTO institution_details (
          institution_id, name, code, type, district, province, country,
          address, phone, email, website, logo_url
        ) VALUES (
          @institution_id, @name, @code, @type, @district, @province, @country,
          @address, @phone, @email, @website, @logo_url
        )
      `);
    
    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      data: { 
        institution_id, 
        name, 
        code, 
        type, 
        district, 
        province, 
        country 
      }
    });
    
  } catch (error) {
    console.error('Error creating institution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create institution',
      message: error.message
    });
  }
});

// PUT /api/institutions/:id - Update institution
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      code, 
      type, 
      district, 
      province, 
      country,
      address,
      phone,
      email,
      website,
      logo_url
    } = req.body;
    
    const pool = await getConnection();
    
    // Check if institution exists
    const existingInstitution = await pool.request()
      .input('id', sql.VarChar, id)
      .query('SELECT institution_id FROM institution_details WHERE institution_id = @id');
    
    if (existingInstitution.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Institution not found'
      });
    }
    
    // Build update query
    let updateQuery = 'UPDATE institution_details SET ';
    const params = [];
    
    if (name) {
      updateQuery += 'name = @name, ';
      params.push({ name: 'name', value: name });
    }
    
    if (code) {
      updateQuery += 'code = @code, ';
      params.push({ name: 'code', value: code });
    }
    
    if (type) {
      updateQuery += 'type = @type, ';
      params.push({ name: 'type', value: type });
    }
    
    if (district !== undefined) {
      updateQuery += 'district = @district, ';
      params.push({ name: 'district', value: district });
    }
    
    if (province !== undefined) {
      updateQuery += 'province = @province, ';
      params.push({ name: 'province', value: province });
    }
    
    if (country) {
      updateQuery += 'country = @country, ';
      params.push({ name: 'country', value: country });
    }
    
    if (address !== undefined) {
      updateQuery += 'address = @address, ';
      params.push({ name: 'address', value: address });
    }
    
    if (phone !== undefined) {
      updateQuery += 'phone = @phone, ';
      params.push({ name: 'phone', value: phone });
    }
    
    if (email !== undefined) {
      updateQuery += 'email = @email, ';
      params.push({ name: 'email', value: email });
    }
    
    if (website !== undefined) {
      updateQuery += 'website = @website, ';
      params.push({ name: 'website', value: website });
    }
    
    if (logo_url !== undefined) {
      updateQuery += 'logo_url = @logo_url, ';
      params.push({ name: 'logo_url', value: logo_url });
    }
    
    updateQuery += 'updated_at = GETUTCDATE() WHERE institution_id = @id';
    params.push({ name: 'id', value: id });
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.value));
    
    await request.query(updateQuery);
    
    res.json({
      success: true,
      message: 'Institution updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating institution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update institution',
      message: error.message
    });
  }
});

// GET /api/institutions/stats/overview - Get institution statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const pool = await getConnection();
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_institutions,
        SUM(CASE WHEN type = 'primary' THEN 1 ELSE 0 END) as primary_schools,
        SUM(CASE WHEN type = 'secondary' THEN 1 ELSE 0 END) as secondary_schools,
        SUM(CASE WHEN type = 'combined' THEN 1 ELSE 0 END) as combined_schools,
        COUNT(DISTINCT province) as provinces_covered,
        COUNT(DISTINCT district) as districts_covered
      FROM institution_details
    `;
    
    const result = await pool.request().query(statsQuery);
    const stats = result.recordset[0];
    
    res.json({
      success: true,
      data: {
        total_institutions: parseInt(stats.total_institutions),
        primary_schools: parseInt(stats.primary_schools),
        secondary_schools: parseInt(stats.secondary_schools),
        combined_schools: parseInt(stats.combined_schools),
        provinces_covered: parseInt(stats.provinces_covered),
        districts_covered: parseInt(stats.districts_covered)
      }
    });
    
  } catch (error) {
    console.error('Error fetching institution stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch institution statistics',
      message: error.message
    });
  }
});

module.exports = router;


