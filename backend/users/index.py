import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    """Управление пользователями (создание, редактирование)"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cursor.execute(
                "SELECT id, login, display_name, role, grade, created_at FROM users ORDER BY created_at DESC"
            )
            users = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': [dict(u) for u in users]}, default=str),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            login = body.get('login', '').strip()
            display_name = body.get('display_name', '').strip()
            role = body.get('role', 'student')
            grade = body.get('grade')
            created_by = body.get('created_by', 'admin')
            
            if not login or not display_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Login and display_name required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """
                INSERT INTO users (login, display_name, role, grade, created_by)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, login, display_name, role, grade
                """,
                (login, display_name, role, grade, created_by)
            )
            new_user = cursor.fetchone()
            conn.commit()
            
            if role == 'student':
                cursor.execute(
                    """
                    INSERT INTO student_time_limits (student_login, daily_limit_minutes)
                    VALUES (%s, 80)
                    ON CONFLICT (student_login) DO NOTHING
                    """,
                    (login,)
                )
                conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict(new_user)}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
