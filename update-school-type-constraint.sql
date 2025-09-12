-- Update the school type constraint to include "Combined School"
-- Run this in Azure Portal Query Editor

PRINT '🔧 Updating school type constraint to include "Combined School"...';

-- Drop the existing constraint
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_institutions_type_new')
BEGIN
    ALTER TABLE institutions DROP CONSTRAINT CK_institutions_type_new;
    PRINT '✅ Dropped existing constraint CK_institutions_type_new';
END

-- Add the new constraint with "Combined School"
ALTER TABLE institutions ADD CONSTRAINT CK_institutions_type_new 
CHECK (type IN ('Primary School', 'Secondary School', 'Combined School', 'University', 'College', 'Technical Institute', 'Vocational School'));

PRINT '✅ Added new constraint with "Combined School" included';
PRINT '🎯 School type constraint updated successfully!';









