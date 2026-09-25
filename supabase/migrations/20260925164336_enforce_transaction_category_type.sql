-- ============================================================
-- Integridade na fonte: tipo da transação deve bater com o da categoria
-- ============================================================
-- O formulário já filtra as categorias pelo tipo da transação, mas isso é
-- validação de cliente e pode ser contornado chamando a Data API direto. A
-- regra de segurança do projeto exige que a integridade morra na camada de
-- persistência, e não apenas na interface.
--
-- Sem esta trava, dava para anexar uma categoria de despesa a uma transação
-- de receita: o dashboard contaria aquela receita como despesa e o saldo
-- ficaria errado. Agora o banco recusa.

CREATE OR REPLACE FUNCTION private.validate_transaction_category()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_category public.categories%ROWTYPE;
BEGIN
  IF NEW.category_id IS NOT NULL THEN
    SELECT * INTO target_category
    FROM public.categories
    WHERE id = NEW.category_id
      AND user_id = NEW.user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A categoria deve pertencer ao mesmo usuário da transação.'
        USING ERRCODE = '23514';
    END IF;

    IF target_category.type <> NEW.type THEN
      RAISE EXCEPTION
        'A categoria (%) é do tipo %, mas a transação é do tipo %.',
        target_category.name,
        target_category.type,
        NEW.type
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- O gatilho validate_transaction_category (BEFORE INSERT OR UPDATE) já existe
-- e é reaproveitado: só a corpo da função mudou.
