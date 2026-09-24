-- ============================================================
-- App de Orçamento Pessoal — Schema Inicial
-- ============================================================

-- Enum para tipo de transação/categoria
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- ============================================================
-- Tabela: profiles
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  currency    text NOT NULL DEFAULT 'BRL',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- Tabela: categories
-- ============================================================
CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text NOT NULL DEFAULT '💰',
  color       text NOT NULL DEFAULT '#7C3AED',
  type        transaction_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Tabela: transactions
-- ============================================================
CREATE TABLE transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  amount        numeric(12, 2) NOT NULL CHECK (amount > 0),
  type          transaction_type NOT NULL,
  description   text,
  date          date NOT NULL DEFAULT CURRENT_DATE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: criar profile e categorias padrão após registro
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid := NEW.id;
BEGIN
  -- Cria profile
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    new_user_id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Categorias de despesa padrão
  INSERT INTO categories (user_id, name, icon, color, type) VALUES
    (new_user_id, 'Moradia',       '🏠', '#7C3AED', 'expense'),
    (new_user_id, 'Alimentação',   '🍔', '#EF4444', 'expense'),
    (new_user_id, 'Transporte',    '🚗', '#F59E0B', 'expense'),
    (new_user_id, 'Saúde',         '💊', '#10B981', 'expense'),
    (new_user_id, 'Lazer',         '🎮', '#3B82F6', 'expense'),
    (new_user_id, 'Educação',      '📚', '#8B5CF6', 'expense'),
    (new_user_id, 'Roupas',        '👕', '#EC4899', 'expense'),
    (new_user_id, 'Outros',        '📦', '#6B7280', 'expense');

  -- Categorias de receita padrão
  INSERT INTO categories (user_id, name, icon, color, type) VALUES
    (new_user_id, 'Salário',       '💼', '#10B981', 'income'),
    (new_user_id, 'Freelance',     '💻', '#06B6D4', 'income'),
    (new_user_id, 'Investimentos', '📈', '#F59E0B', 'income'),
    (new_user_id, 'Outros',        '💰', '#6B7280', 'income');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
