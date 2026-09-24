-- ============================================================
-- App de Orçamento Pessoal — Schema inicial
-- ============================================================
-- Este arquivo deve ser aplicado uma única vez. Se a versão anterior
-- já estiver aplicada no projeto remoto, crie uma migration de correção
-- em vez de alterar o histórico de migrations.

-- ============================================================
-- Schema privado para funções privilegiadas
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

-- ============================================================
-- Enum para tipo de transação/categoria
-- ============================================================
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- ============================================================
-- Tabela: profiles
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  currency    text NOT NULL DEFAULT 'BRL',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Tabela: categories
-- ============================================================
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text NOT NULL DEFAULT '💰',
  color       text NOT NULL DEFAULT '#7C3AED',
  type        public.transaction_type NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Tabela: transactions
-- ============================================================
CREATE TABLE public.transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id   uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  amount        numeric(12, 2) NOT NULL CHECK (amount > 0),
  type          public.transaction_type NOT NULL,
  description   text,
  date          date NOT NULL DEFAULT CURRENT_DATE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Índices usados pelas consultas e pelas políticas de RLS.
CREATE INDEX categories_user_id_idx
  ON public.categories (user_id);

CREATE INDEX transactions_user_id_idx
  ON public.transactions (user_id);

CREATE INDEX transactions_user_id_date_idx
  ON public.transactions (user_id, date);

CREATE INDEX transactions_category_id_idx
  ON public.transactions (category_id);

-- ============================================================
-- Permissões do Data API
-- ============================================================
-- Revoga os privilégios padrão e concede somente o necessário para
-- o cliente autenticado. O papel anon não deve acessar estas tabelas.
GRANT USAGE ON SCHEMA public TO authenticated;

REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.categories FROM anon, authenticated;
REVOKE ALL ON TABLE public.transactions FROM anon, authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transactions TO authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuário pode ler e atualizar somente o próprio perfil.
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Categories: políticas explícitas por operação.
CREATE POLICY "Users can view their own categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Transactions: políticas explícitas por operação.
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- Integridade: uma transação só pode usar categoria do próprio usuário
-- ============================================================
CREATE OR REPLACE FUNCTION private.validate_transaction_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.category_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.categories
    WHERE id = NEW.category_id
      AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'A categoria deve pertencer ao mesmo usuário da transação.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_transaction_category
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION private.validate_transaction_category();

-- ============================================================
-- Trigger: criar profile e categorias padrão após registro
-- ============================================================
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id uuid := NEW.id;
BEGIN
  -- Cria profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new_user_id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Categorias de despesa padrão
  INSERT INTO public.categories (user_id, name, icon, color, type) VALUES
    (new_user_id, 'Moradia',       '🏠', '#7C3AED', 'expense'),
    (new_user_id, 'Alimentação',   '🍔', '#EF4444', 'expense'),
    (new_user_id, 'Transporte',    '🚗', '#F59E0B', 'expense'),
    (new_user_id, 'Saúde',         '💊', '#10B981', 'expense'),
    (new_user_id, 'Lazer',         '🎮', '#3B82F6', 'expense'),
    (new_user_id, 'Educação',      '📚', '#8B5CF6', 'expense'),
    (new_user_id, 'Roupas',        '👕', '#EC4899', 'expense'),
    (new_user_id, 'Outros',        '📦', '#6B7280', 'expense');

  -- Categorias de receita padrão
  INSERT INTO public.categories (user_id, name, icon, color, type) VALUES
    (new_user_id, 'Salário',       '💼', '#10B981', 'income'),
    (new_user_id, 'Freelance',     '💻', '#06B6D4', 'income'),
    (new_user_id, 'Investimentos', '📈', '#F59E0B', 'income'),
    (new_user_id, 'Outros',        '💰', '#6B7280', 'income');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();

-- Funções privilegiadas não devem ser chamáveis pelo cliente.
REVOKE ALL ON FUNCTION private.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION private.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION private.validate_transaction_category() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.validate_transaction_category() FROM anon;
REVOKE ALL ON FUNCTION private.validate_transaction_category() FROM authenticated;
