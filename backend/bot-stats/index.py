import json
import os
import psycopg2
from datetime import datetime, timedelta

def handler(event, context):
    """Получение статистики Telegram бота — пользователи, сообщения, команды"""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    now = datetime.utcnow()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    yesterday = now - timedelta(days=1)

    cur.execute("SELECT COUNT(*) FROM bot_users")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_users WHERE joined_at >= %s", (yesterday,))
    new_users_today = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_users WHERE joined_at >= %s AND joined_at < %s", (yesterday - timedelta(days=1), yesterday))
    new_users_prev = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_messages WHERE created_at >= %s", (today,))
    messages_today = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_messages WHERE created_at >= %s AND created_at < %s", (today - timedelta(days=1), today))
    messages_yesterday = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_commands_log WHERE created_at >= %s", (today,))
    commands_today = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_users WHERE last_active_at >= %s", (now - timedelta(hours=1),))
    active_sessions = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM bot_users WHERE is_blocked = TRUE")
    blocked_users = cur.fetchone()[0]

    weekly_activity = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        cur.execute("SELECT COUNT(*) FROM bot_messages WHERE created_at >= %s AND created_at < %s", (day_start, day_end))
        count = cur.fetchone()[0]
        day_names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        weekly_activity.append({
            'day': day_names[day_start.weekday()],
            'value': count
        })

    cur.execute("""
        SELECT command, COUNT(*) as cnt 
        FROM bot_commands_log 
        WHERE created_at >= %s 
        GROUP BY command 
        ORDER BY cnt DESC 
        LIMIT 5
    """, (week_ago,))
    top_commands = [{'name': row[0], 'count': row[1]} for row in cur.fetchall()]

    if top_commands:
        max_count = top_commands[0]['count']
        for cmd in top_commands:
            cmd['percentage'] = round((cmd['count'] / max_count) * 100) if max_count > 0 else 0

    def calc_change(current, previous):
        if previous == 0:
            return "+100%" if current > 0 else "0%"
        change = ((current - previous) / previous) * 100
        return f"+{change:.1f}%" if change >= 0 else f"{change:.1f}%"

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'totalUsers': total_users,
            'newUsersToday': new_users_today,
            'usersChange': calc_change(new_users_today, new_users_prev),
            'messagesToday': messages_today,
            'messagesChange': calc_change(messages_today, messages_yesterday),
            'commandsToday': commands_today,
            'activeSessions': active_sessions,
            'blockedUsers': blocked_users,
            'weeklyActivity': weekly_activity,
            'topCommands': top_commands
        })
    }
