-- ============================================================
-- Backfill de usuários criados antes da migration inicial
-- ============================================================
-- A migration 001 cria o trigger para novos usuários, mas não
-- processa usuários que já existiam quando ela foi aplicada.

-- Garante o perfil dos usuários existentes sem duplicar registros.
INSERT INTO public.profiles (id, full_name, avatar_url)
SELECT
  u.id,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'avatar_url'
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;

-- Cria as categorias padrão somente para usuários sem nenhuma categoria.
INSERT INTO public.categories (user_id, name, icon, color, type)
SELECT
  u.id,
  defaults.name,
  defaults.icon,
  defaults.color,
  defaults.type::public.transaction_type
FROM auth.users AS u
CROSS JOIN (
  VALUES
    ('Moradia', '🏠', '#7C3AED', 'expense'),
    ('Alimentação', '🍔', '#EF4444', 'expense'),
    ('Transporte', '🚗', '#F59E0B', 'expense'),
    ('Saúde', '💊', '#10B981', 'expense'),
    ('Lazer', '🎮', '#3B82F6', 'expense'),
    ('Educação', '📚', '#8B5CF6', 'expense'),
    ('Roupas', '👕', '#EC4899', 'expense'),
    ('Outros', '📦', '#6B7280', 'expense'),
    ('Salário', '💼', '#10B981', 'income'),
    ('Freelance', '💻', '#06B6D4', 'income'),
    ('Investimentos', '📈', '#F59E0B', 'income'),
    ('Outros', '💰', '#6B7280', 'income')
) AS defaults(name, icon, color, type)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.categories AS existing_category
  WHERE existing_category.user_id = u.id
);
