import json
import os
import psycopg2
import urllib.request

def handler(event, context):
    """Рассылка сообщений пользователям бота и получение истории рассылок"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if event.get('httpMethod') == 'GET':
        cur.execute("SELECT id, text, sent_count, failed_count, status, created_at FROM bot_broadcasts ORDER BY created_at DESC LIMIT 20")
        broadcasts = []
        for row in cur.fetchall():
            broadcasts.append({
                'id': row[0],
                'text': row[1],
                'sentCount': row[2],
                'failedCount': row[3],
                'status': row[4],
                'createdAt': row[5].isoformat()
            })
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'broadcasts': broadcasts})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        text = body.get('text', '').strip()

        if not text:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Текст сообщения обязателен'})}

        if not token:
            cur.close()
            conn.close()
            return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': 'Токен бота не настроен'})}

        cur.execute("INSERT INTO bot_broadcasts (text, status) VALUES (%s, 'sending') RETURNING id", (text,))
        broadcast_id = cur.fetchone()[0]
        conn.commit()

        cur.execute("SELECT telegram_id FROM bot_users WHERE is_blocked = FALSE")
        users = [row[0] for row in cur.fetchall()]

        sent = 0
        failed = 0

        for user_id in users:
            try:
                payload = json.dumps({'chat_id': user_id, 'text': text, 'parse_mode': 'HTML'}).encode()
                req = urllib.request.Request(
                    f'https://api.telegram.org/bot{token}/sendMessage',
                    data=payload,
                    headers={'Content-Type': 'application/json'}
                )
                urllib.request.urlopen(req, timeout=10)
                sent += 1
            except Exception:
                failed += 1

        cur.execute(
            "UPDATE bot_broadcasts SET sent_count = %s, failed_count = %s, status = 'done' WHERE id = %s",
            (sent, failed, broadcast_id)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'broadcastId': broadcast_id,
            'sentCount': sent,
            'failedCount': failed,
            'status': 'done'
        })}

    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}
