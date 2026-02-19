import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

def hash_password(password):
    salt = "panel_salt_2026"
    return hashlib.sha256(f"{salt}:{password}".encode()).hexdigest()

def generate_token():
    return secrets.token_hex(32)

def get_user_by_token(cur, token):
    if not token:
        return None
    cur.execute("""
        SELECT pu.id, pu.login, pu.display_name, pu.role, pu.is_active
        FROM panel_sessions ps
        JOIN panel_users pu ON ps.user_id = pu.id
        WHERE ps.token = %s AND ps.expires_at > NOW() AND pu.is_active = TRUE
    """, (token,))
    row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'login': row[1], 'displayName': row[2], 'role': row[3], 'isActive': row[4]}

def handler(event, context):
    """Авторизация панели — логин, регистрация админов, управление сессиями"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    req_headers = event.get('headers', {})
    token = req_headers.get('X-Auth-Token', req_headers.get('x-auth-token', ''))

    if action == 'setup':
        cur.execute("SELECT COUNT(*) FROM panel_users WHERE role = 'owner'")
        has_owner = cur.fetchone()[0] > 0
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'hasOwner': has_owner})}

    if action == 'register_owner':
        if event.get('httpMethod') != 'POST':
            cur.close()
            conn.close()
            return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'POST only'})}

        cur.execute("SELECT COUNT(*) FROM panel_users WHERE role = 'owner'")
        if cur.fetchone()[0] > 0:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Владелец уже создан'})}

        body = json.loads(event.get('body', '{}'))
        login = body.get('login', '').strip()
        password = body.get('password', '')
        name = body.get('name', '').strip() or login

        if not login or not password or len(password) < 6:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Логин и пароль (мин. 6 символов) обязательны'})}

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO panel_users (login, password_hash, display_name, role) VALUES (%s, %s, %s, 'owner') RETURNING id",
            (login, pwd_hash, name)
        )
        user_id = cur.fetchone()[0]

        tk = generate_token()
        cur.execute(
            "INSERT INTO panel_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, tk, datetime.utcnow() + timedelta(days=30))
        )
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'token': tk,
            'user': {'id': user_id, 'login': login, 'displayName': name, 'role': 'owner'}
        })}

    if action == 'login':
        if event.get('httpMethod') != 'POST':
            cur.close()
            conn.close()
            return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'POST only'})}

        body = json.loads(event.get('body', '{}'))
        login = body.get('login', '').strip()
        password = body.get('password', '')

        pwd_hash = hash_password(password)
        cur.execute(
            "SELECT id, login, display_name, role, is_active FROM panel_users WHERE login = %s AND password_hash = %s",
            (login, pwd_hash)
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Неверный логин или пароль'})}

        if not row[4]:
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Аккаунт деактивирован'})}

        user_id = row[0]
        tk = generate_token()
        cur.execute(
            "INSERT INTO panel_sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, tk, datetime.utcnow() + timedelta(days=30))
        )
        cur.execute("UPDATE panel_users SET last_login_at = NOW() WHERE id = %s", (user_id,))
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'token': tk,
            'user': {'id': row[0], 'login': row[1], 'displayName': row[2], 'role': row[3]}
        })}

    if action == 'me':
        user = get_user_by_token(cur, token)
        cur.close()
        conn.close()
        if not user:
            return {'statusCode': 401, 'headers': headers, 'body': json.dumps({'error': 'Не авторизован'})}
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'user': user})}

    if action == 'logout':
        if token:
            cur.execute("UPDATE panel_sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    if action == 'create_admin':
        user = get_user_by_token(cur, token)
        if not user or user['role'] != 'owner':
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Только владелец может создавать админов'})}

        body = json.loads(event.get('body', '{}'))
        login = body.get('login', '').strip()
        password = body.get('password', '')
        name = body.get('name', '').strip() or login

        if not login or not password or len(password) < 6:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Логин и пароль (мин. 6 символов) обязательны'})}

        cur.execute("SELECT id FROM panel_users WHERE login = %s", (login,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Логин уже занят'})}

        pwd_hash = hash_password(password)
        cur.execute(
            "INSERT INTO panel_users (login, password_hash, display_name, role, created_by) VALUES (%s, %s, %s, 'admin', %s) RETURNING id",
            (login, pwd_hash, name, user['id'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'admin': {'id': new_id, 'login': login, 'displayName': name, 'role': 'admin'}
        })}

    if action == 'list_admins':
        user = get_user_by_token(cur, token)
        if not user or user['role'] != 'owner':
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Только владелец'})}

        cur.execute("SELECT id, login, display_name, role, is_active, created_at, last_login_at FROM panel_users ORDER BY created_at")
        admins = []
        for row in cur.fetchall():
            admins.append({
                'id': row[0], 'login': row[1], 'displayName': row[2], 'role': row[3],
                'isActive': row[4], 'createdAt': row[5].isoformat(), 'lastLoginAt': row[6].isoformat() if row[6] else None
            })
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'admins': admins})}

    if action == 'toggle_admin':
        user = get_user_by_token(cur, token)
        if not user or user['role'] != 'owner':
            cur.close()
            conn.close()
            return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Только владелец'})}

        body = json.loads(event.get('body', '{}'))
        admin_id = body.get('adminId')
        active = body.get('active', True)

        cur.execute("UPDATE panel_users SET is_active = %s WHERE id = %s AND role != 'owner'", (active, admin_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Unknown action'})}
