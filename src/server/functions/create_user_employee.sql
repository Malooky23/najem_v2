CREATE OR REPLACE FUNCTION create_user_employee(
    p_email VARCHAR(255),
    p_password TEXT,
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_is_admin BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
    password_salt TEXT;
    password_hash TEXT;
BEGIN
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = LOWER(p_email)) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    -- Generate salt and hash password
    password_salt := gen_salt('bf');
    password_hash := crypt(p_password, password_salt);

    -- Insert new user
    INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        is_admin,
        user_type
    ) VALUES (
        LOWER(p_email),
        password_hash,
        INITCAP(p_first_name),
        INITCAP(p_last_name),
        p_is_admin,
        'EMPLOYEE'::user_type
    )
    RETURNING user_id INTO v_user_id;

    -- Return new user ID
    RETURN v_user_id;

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Email address already exists';
    WHEN others THEN
        RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;