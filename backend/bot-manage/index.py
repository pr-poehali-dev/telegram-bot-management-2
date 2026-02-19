import json
import os
import psycopg2
import urllib.request

def handler(event, context):
    """Управление ботом — пользователи, настройки, модерация, информация о боте"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'info')

    if action == 'info':
        if token:
            try:
                req = urllib.request.Request(f'https://api.telegram.org/bot{token}/getMe')
                resp = urllib.request.urlopen(req, timeout=10)
                bot_data = json.loads(resp.read())
                bot_info = bot_data.get('result', {})
            except Exception:
                bot_info = {'error': 'Не удалось подключиться к боту'}
        else:
            bot_info = {'error': 'Токен не настроен'}

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'bot': bot_info})}

    if action == 'users':
        page = int(params.get('page', '1'))
        limit = 20
        offset = (page - 1) * limit
        search = params.get('search', '')

        if search:
            cur.execute(
                "SELECT COUNT(*) FROM bot_users WHERE username ILIKE %s OR first_name ILIKE %s",
                (f'%{search}%', f'%{search}%')
            )
        else:
            cur.execute("SELECT COUNT(*) FROM bot_users")
        total = cur.fetchone()[0]

        if search:
            cur.execute(
                """SELECT telegram_id, username, first_name, last_name, is_blocked, joined_at, last_active_at
                FROM bot_users WHERE username ILIKE %s OR first_name ILIKE %s
                ORDER BY joined_at DESC LIMIT %s OFFSET %s""",
                (f'%{search}%', f'%{search}%', limit, offset)
            )
        else:
            cur.execute(
                """SELECT telegram_id, username, first_name, last_name, is_blocked, joined_at, last_active_at
                FROM bot_users ORDER BY joined_at DESC LIMIT %s OFFSET %s""",
                (limit, offset)
            )

        users = []
        for row in cur.fetchall():
            users.append({
                'telegramId': row[0],
                'username': row[1],
                'firstName': row[2],
                'lastName': row[3],
                'isBlocked': row[4],
                'joinedAt': row[5].isoformat(),
                'lastActiveAt': row[6].isoformat() if row[6] else None
            })

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'users': users, 'total': total, 'page': page, 'pages': (total + limit - 1) // limit
        })}

    if action == 'block_user' and event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        telegram_id = body.get('telegramId')
        block = body.get('block', True)

        cur.execute("UPDATE bot_users SET is_blocked = %s WHERE telegram_id = %s", (block, telegram_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

    if action == 'settings':
        if event.get('httpMethod') == 'GET':
            cur.execute("SELECT key, value FROM bot_settings")
            settings = {row[0]: row[1] for row in cur.fetchall()}
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'settings': settings})}

        if event.get('httpMethod') == 'POST':
            body = json.loads(event.get('body', '{}'))
            for key, value in body.items():
                cur.execute(
                    "INSERT INTO bot_settings (key, value, updated_at) VALUES (%s, %s, NOW()) ON CONFLICT (key) DO UPDATE SET value = %s, updated_at = NOW()",
                    (key, str(value), str(value))
                )
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'success': True})}

    if action == 'logs':
        cur.execute("""
            SELECT m.id, m.telegram_id, u.username, u.first_name, m.direction, m.text, m.created_at
            FROM bot_messages m
            LEFT JOIN bot_users u ON m.telegram_id = u.telegram_id
            ORDER BY m.created_at DESC LIMIT 50
        """)
        logs = []
        for row in cur.fetchall():
            logs.append({
                'id': row[0],
                'telegramId': row[1],
                'username': row[2],
                'firstName': row[3],
                'direction': row[4],
                'text': row[5],
                'createdAt': row[6].isoformat()
            })
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'logs': logs})}

    if action == 'send_message' and event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        chat_id = body.get('chatId')
        text = body.get('text', '')

        if not token or not chat_id or not text:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Недостаточно данных'})}

        try:
            payload = json.dumps({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}).encode()
            req = urllib.request.Request(
                f'https://api.telegram.org/bot{token}/sendMessage',
                data=payload,
                headers={'Content-Type': 'application/json'}
            )
            resp = urllib.request.urlopen(req, timeout=10)
            result = json.loads(resp.read())

            cur.execute(
                "INSERT INTO bot_messages (telegram_id, direction, text) VALUES (%s, 'out', %s)",
                (chat_id, text)
            )
            conn.commit()
        except Exception as e:
            result = {'error': str(e)}

        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'result': result})}

    cur.close()
    conn.close()
    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Unknown action'})}
