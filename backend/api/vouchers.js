const express = require('express');
const router = express.Router();
const sql = require('mssql');
const crypto = require('crypto');

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

// Generate voucher code
function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Hash voucher code
function hashVoucherCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Generate salt
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

// =====================================================
// VOUCHER ENDPOINTS
// =====================================================

// GET /api/vouchers - Get all vouchers (with filtering)
router.get('/', async (req, res) => {
  try {
    const { status, institution_id, issued_by } = req.query;
    const pool = await getConnection();
    
    let query = `
      SELECT 
        v.*,
        u.username as issued_by_username,
        i.name as institution_name
      FROM vouchers v
      LEFT JOIN users u ON v.issued_by_user_id = u.id
      LEFT JOIN institution_details i ON v.institution_id = i.institution_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND v.status = @status`;
      params.push({ name: 'status', value: status });
    }
    
    if (institution_id) {
      query += ` AND v.institution_id = @institution_id`;
      params.push({ name: 'institution_id', value: institution_id });
    }
    
    if (issued_by) {
      query += ` AND v.issued_by_user_id = @issued_by`;
      params.push({ name: 'issued_by', value: issued_by });
    }
    
    query += ` ORDER BY v.created_at DESC`;
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.value));
    
    const result = await request.query(query);
    
    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length
    });
    
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch vouchers',
      message: error.message 
    });
  }
});

// POST /api/vouchers - Generate new voucher
router.post('/', async (req, res) => {
  try {
    const { denomination, parent_guardian_name, learner_count, institution_id, issued_by_user_id } = req.body;
    
    // Validation
    if (!denomination || !parent_guardian_name || !learner_count || !institution_id || !issued_by_user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    if (![5, 10, 15, 20, 25, 30, 35, 40, 45].includes(denomination)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid denomination'
      });
    }
    
    if (learner_count < 1 || learner_count > 10) {
      return res.status(400).json({
        success: false,
        error: 'Learner count must be between 1 and 10'
      });
    }
    
    const pool = await getConnection();
    
    // Generate voucher code
    const voucherCode = generateVoucherCode();
    const codeHash = hashVoucherCode(voucherCode);
    const codeSalt = generateSalt();
    
    // Insert voucher
    const insertQuery = `
      INSERT INTO vouchers (
        code_hash, code_salt, denomination, parent_guardian_name, 
        learner_count, status, institution_id, issued_by_user_id, 
        issued_date, is_active
      ) VALUES (
        @code_hash, @code_salt, @denomination, @parent_guardian_name,
        @learner_count, 'active', @institution_id, @issued_by_user_id,
        GETUTCDATE(), 1
      );
      
      SELECT SCOPE_IDENTITY() as id;
    `;
    
    const request = pool.request()
      .input('code_hash', sql.NVarChar, codeHash)
      .input('code_salt', sql.NVarChar, codeSalt)
      .input('denomination', sql.Int, denomination)
      .input('parent_guardian_name', sql.NVarChar, parent_guardian_name)
      .input('learner_count', sql.Int, learner_count)
      .input('institution_id', sql.VarChar, institution_id)
      .input('issued_by_user_id', sql.VarChar, issued_by_user_id);
    
    const result = await request.query(insertQuery);
    const voucherId = result.recordset[0].id;
    
    // Log audit
    await pool.request()
      .input('voucher_id', sql.VarChar, voucherId)
      .input('action', sql.NVarChar, 'created')
      .input('user_id', sql.VarChar, issued_by_user_id)
      .input('details', sql.NVarChar, `Voucher generated: R${denomination} for ${learner_count} learner(s)`)
      .query(`
        INSERT INTO voucher_audits (voucher_id, action, user_id, details)
        VALUES (@voucher_id, @action, @user_id, @details)
      `);
    
    res.status(201).json({
      success: true,
      message: 'Voucher generated successfully',
      data: {
        id: voucherId,
        code: voucherCode, // This is the visible code for the user
        denomination,
        parent_guardian_name,
        learner_count,
        status: 'active',
        institution_id,
        issued_by_user_id,
        issued_date: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating voucher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate voucher',
      message: error.message
    });
  }
});

// POST /api/vouchers/:id/redeem - Redeem voucher
router.post('/:id/redeem', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, parent_guardian_name, learner_count } = req.body;
    
    if (!user_id || !parent_guardian_name || !learner_count) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const pool = await getConnection();
    
    // Get voucher details
    const voucherQuery = `
      SELECT * FROM vouchers 
      WHERE id = @id AND status = 'active' AND is_active = 1
    `;
    
    const voucherResult = await pool.request()
      .input('id', sql.VarChar, id)
      .query(voucherQuery);
    
    if (voucherResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found or not available'
      });
    }
    
    const voucher = voucherResult.recordset[0];
    
    // Check if voucher matches parent/guardian name
    if (voucher.parent_guardian_name !== parent_guardian_name) {
      return res.status(400).json({
        success: false,
        error: 'Parent/guardian name does not match voucher'
      });
    }
    
    // Check if learner count matches
    if (voucher.learner_count !== learner_count) {
      return res.status(400).json({
        success: false,
        error: 'Learner count does not match voucher'
      });
    }
    
    // Calculate expiry date (30 days from redemption)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Update voucher status
    await pool.request()
      .input('id', sql.VarChar, id)
      .input('redeemed_by_user_id', sql.VarChar, user_id)
      .input('redeemed_date', sql.DateTime2, new Date())
      .input('expiry_date', sql.DateTime2, expiryDate)
      .input('status', sql.NVarChar, 'redeemed')
      .query(`
        UPDATE vouchers 
        SET redeemed_by_user_id = @redeemed_by_user_id,
            redeemed_date = @redeemed_date,
            expiry_date = @expiry_date,
            status = @status,
            updated_at = GETUTCDATE()
        WHERE id = @id
      `);
    
    // Create redemption record
    await pool.request()
      .input('voucher_id', sql.VarChar, id)
      .input('user_id', sql.VarChar, user_id)
      .input('learner_count', sql.Int, learner_count)
      .input('parent_guardian_name', sql.NVarChar, parent_guardian_name)
      .input('expiry_date', sql.DateTime2, expiryDate)
      .query(`
        INSERT INTO voucher_redemptions (
          voucher_id, user_id, learner_count, parent_guardian_name, expiry_date
        ) VALUES (
          @voucher_id, @user_id, @learner_count, @parent_guardian_name, @expiry_date
        )
      `);
    
    // Log audit
    await pool.request()
      .input('voucher_id', sql.VarChar, id)
      .input('action', sql.NVarChar, 'redeemed')
      .input('user_id', sql.VarChar, user_id)
      .input('details', sql.NVarChar, `Voucher redeemed for ${learner_count} learner(s)`)
      .query(`
        INSERT INTO voucher_audits (voucher_id, action, user_id, details)
        VALUES (@voucher_id, @action, @user_id, @details)
      `);
    
    res.json({
      success: true,
      message: 'Voucher redeemed successfully',
      data: {
        voucher_id: id,
        denomination: voucher.denomination,
        learner_count,
        parent_guardian_name,
        expiry_date: expiryDate.toISOString(),
        status: 'redeemed'
      }
    });
    
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem voucher',
      message: error.message
    });
  }
});

// GET /api/vouchers/:id - Get voucher details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const query = `
      SELECT 
        v.*,
        u.username as issued_by_username,
        ru.username as redeemed_by_username,
        i.name as institution_name
      FROM vouchers v
      LEFT JOIN users u ON v.issued_by_user_id = u.id
      LEFT JOIN users ru ON v.redeemed_by_user_id = ru.id
      LEFT JOIN institution_details i ON v.institution_id = i.institution_id
      WHERE v.id = @id
    `;
    
    const result = await pool.request()
      .input('id', sql.VarChar, id)
      .query(query);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
    
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voucher',
      message: error.message
    });
  }
});

// GET /api/vouchers/stats - Get voucher statistics
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
        COUNT(*) as total_vouchers,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_vouchers,
        SUM(CASE WHEN status = 'redeemed' THEN 1 ELSE 0 END) as redeemed_vouchers,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_vouchers,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_vouchers,
        SUM(denomination) as total_value,
        SUM(CASE WHEN status = 'active' THEN denomination ELSE 0 END) as active_value,
        SUM(CASE WHEN status = 'redeemed' THEN denomination ELSE 0 END) as redeemed_value
      FROM vouchers
      ${whereClause}
    `;
    
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.value));
    
    const result = await request.query(statsQuery);
    const stats = result.recordset[0];
    
    res.json({
      success: true,
      data: {
        ...stats,
        total_vouchers: parseInt(stats.total_vouchers),
        active_vouchers: parseInt(stats.active_vouchers),
        redeemed_vouchers: parseInt(stats.redeemed_vouchers),
        expired_vouchers: parseInt(stats.expired_vouchers),
        cancelled_vouchers: parseInt(stats.cancelled_vouchers),
        total_value: parseInt(stats.total_value || 0),
        active_value: parseInt(stats.active_value || 0),
        redeemed_value: parseInt(stats.redeemed_value || 0)
      }
    });
    
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch voucher statistics',
      message: error.message
    });
  }
});

module.exports = router;


