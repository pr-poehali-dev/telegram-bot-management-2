import json
import os
import psycopg2
from datetime import datetime

def handler(event, context):
    """Webhook для приёма событий от Telegram бота на VDS — пользователи, сообщения, команды, импорт JSON"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Secret', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'POST only'})}

    req_headers = event.get('headers', {})
    secret = req_headers.get('X-Webhook-Secret', req_headers.get('x-webhook-secret', ''))
    expected = os.environ.get('WEBHOOK_SECRET', '')

    if not expected or secret != expected:
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Forbidden'})}

    body = json.loads(event.get('body', '{}'))
    event_type = body.get('type', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event_type == 'user':
        telegram_id = body.get('telegram_id')
        username = body.get('username', '')
        first_name = body.get('first_name', '')
        last_name = body.get('last_name', '')

        cur.execute("""
            INSERT INTO bot_users (telegram_id, username, first_name, last_name, last_active_at)
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT (telegram_id) DO UPDATE SET
                username = EXCLUDED.username,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                last_active_at = NOW()
        """, (telegram_id, username, first_name, last_name))
        conn.commit()

    elif event_type == 'message':
        telegram_id = body.get('telegram_id')
        direction = body.get('direction', 'in')
        text = body.get('text', '')

        cur.execute(
            "INSERT INTO bot_messages (telegram_id, direction, text) VALUES (%s, %s, %s)",
            (telegram_id, direction, text)
        )
        cur.execute(
            "UPDATE bot_users SET last_active_at = NOW() WHERE telegram_id = %s",
            (telegram_id,)
        )
        conn.commit()

    elif event_type == 'command':
        telegram_id = body.get('telegram_id')
        command = body.get('command', '')

        cur.execute(
            "INSERT INTO bot_commands_log (telegram_id, command) VALUES (%s, %s)",
            (telegram_id, command)
        )
        cur.execute(
            "UPDATE bot_users SET last_active_at = NOW() WHERE telegram_id = %s",
            (telegram_id,)
        )
        conn.commit()

    elif event_type == 'import_users':
        users = body.get('users', [])
        imported = 0
        for u in users:
            tid = u.get('telegram_id') or u.get('id') or u.get('user_id')
            if not tid:
                continue
            cur.execute("""
                INSERT INTO bot_users (telegram_id, username, first_name, last_name, is_blocked, joined_at, last_active_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (telegram_id) DO UPDATE SET
                    username = COALESCE(EXCLUDED.username, bot_users.username),
                    first_name = COALESCE(EXCLUDED.first_name, bot_users.first_name),
                    last_name = COALESCE(EXCLUDED.last_name, bot_users.last_name)
            """, (
                tid,
                u.get('username', ''),
                u.get('first_name', ''),
                u.get('last_name', ''),
                u.get('is_blocked', False),
                u.get('joined_at', datetime.utcnow().isoformat())
            ))
            imported += 1
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'imported': imported})}

    elif event_type == 'import_messages':
        messages = body.get('messages', [])
        imported = 0
        for m in messages:
            tid = m.get('telegram_id') or m.get('user_id') or m.get('from_id')
            if not tid:
                continue
            cur.execute(
                "INSERT INTO bot_messages (telegram_id, direction, text, created_at) VALUES (%s, %s, %s, %s)",
                (tid, m.get('direction', 'in'), m.get('text', ''), m.get('created_at', datetime.utcnow().isoformat()))
            )
            imported += 1
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'imported': imported})}

    elif event_type == 'ping':
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'ok', 'time': datetime.utcnow().isoformat()})}

    else:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': f'Unknown type: {event_type}'})}

    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}
