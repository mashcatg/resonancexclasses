-- Create transactions table for payment tracking
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  enrollment_id UUID REFERENCES enrollments(id),
  
  -- bKash Payment Details
  payment_id TEXT,
  trx_id TEXT,
  merchant_invoice_number TEXT UNIQUE NOT NULL,
  
  -- Payment Info
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'BDT',
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'bkash',
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Error Tracking
  error_message TEXT,
  
  -- Additional Metadata
  bkash_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_merchant_invoice ON transactions(merchant_invoice_number);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Students can view their own transactions
CREATE POLICY "Students can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Students can insert their own transactions
CREATE POLICY "Students can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Admins can update transactions (for refunds, status changes)
CREATE POLICY "Admins can update transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();