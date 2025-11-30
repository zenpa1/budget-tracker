-- Migration: Auto-update budget spentAmount on expense changes
-- This trigger automatically recalculates and updates the spentAmount 
-- in the budgets table whenever expenses are inserted, updated, or deleted

-- Function to recalculate budget spent amount
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
DECLARE
  affected_budget_id UUID;
  new_spent_amount DECIMAL;
  budget_allocated DECIMAL;
  new_status TEXT;
BEGIN
  -- Determine which budget to update
  IF TG_OP = 'DELETE' THEN
    affected_budget_id := OLD."budgetId";
  ELSE
    affected_budget_id := NEW."budgetId";
  END IF;

  -- Calculate total spent amount for this budget
  SELECT COALESCE(SUM(amount), 0)
  INTO new_spent_amount
  FROM expenses
  WHERE "budgetId" = affected_budget_id;

  -- Get the allocated amount for status calculation
  SELECT "allocatedAmount"
  INTO budget_allocated
  FROM budgets
  WHERE id = affected_budget_id;

  -- Determine new status
  IF new_spent_amount > budget_allocated THEN
    new_status := 'exceeded';
  ELSE
    -- Keep existing status unless it was exceeded (then set to active)
    SELECT CASE 
      WHEN status = 'exceeded' THEN 'active'
      ELSE status
    END
    INTO new_status
    FROM budgets
    WHERE id = affected_budget_id;
  END IF;

  -- Update the budget with new spent amount and status
  UPDATE budgets
  SET 
    "spentAmount" = new_spent_amount,
    status = new_status
  WHERE id = affected_budget_id;

  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_budget_spent ON expenses;

-- Create trigger for INSERT
CREATE TRIGGER trigger_update_budget_spent
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_budget_spent_amount();

-- Create index on expenses.budgetId for performance
CREATE INDEX IF NOT EXISTS idx_expenses_budget_id ON expenses("budgetId");

-- Optional: Create a function to check for anomalies and create notifications
CREATE OR REPLACE FUNCTION check_budget_anomaly()
RETURNS TRIGGER AS $$
DECLARE
  exceeded_amount DECIMAL;
  percentage_over DECIMAL;
BEGIN
  -- Only check if status changed to exceeded
  IF NEW.status = 'exceeded' AND (OLD.status IS NULL OR OLD.status != 'exceeded') THEN
    exceeded_amount := NEW."spentAmount" - NEW."allocatedAmount";
    percentage_over := ((NEW."spentAmount" - NEW."allocatedAmount") / NEW."allocatedAmount") * 100;

    -- Insert anomaly record if it doesn't exist
    INSERT INTO anomalies (
      id,
      "budgetId",
      "eventName",
      team,
      "allocatedAmount",
      "exceededAmount",
      "percentageOver",
      "detectedAt",
      status
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW."eventName",
      NEW.team,
      NEW."allocatedAmount",
      exceeded_amount,
      percentage_over,
      NOW(),
      'pending'
    )
    ON CONFLICT ("budgetId") DO UPDATE
    SET 
      "exceededAmount" = EXCLUDED."exceededAmount",
      "percentageOver" = EXCLUDED."percentageOver",
      "detectedAt" = EXCLUDED."detectedAt";

    -- Create notification
    INSERT INTO notifications (
      id,
      type,
      title,
      message,
      "createdAt",
      read,
      "budgetId"
    )
    VALUES (
      gen_random_uuid(),
      'alert',
      'Budget Exceeded',
      'Budget "' || NEW."eventName" || '" has exceeded its allocated amount by $' || exceeded_amount::TEXT,
      NOW(),
      false,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_check_budget_anomaly ON budgets;

-- Create trigger for budget anomaly detection
CREATE TRIGGER trigger_check_budget_anomaly
AFTER UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION check_budget_anomaly();

COMMENT ON FUNCTION update_budget_spent_amount() IS 'Automatically updates budget spentAmount when expenses change';
COMMENT ON FUNCTION check_budget_anomaly() IS 'Detects and creates anomaly records when budgets are exceeded';
