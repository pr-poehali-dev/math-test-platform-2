import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Чаты (с учителем и общий школьный чат)"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            params = event.get('queryStringParameters') or {}
            chat_type = params.get('type', 'school')
            limit = int(params.get('limit', 100))
            
            cursor.execute(
                """
                SELECT * FROM chat_messages 
                WHERE chat_type = %s 
                ORDER BY created_at DESC 
                LIMIT %s
                """,
                (chat_type, limit)
            )
            messages = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': [dict(m) for m in reversed(messages)]}, default=str),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            chat_type = body.get('chat_type', 'school')
            sender_login = body.get('sender_login', '')
            sender_name = body.get('sender_name', '')
            message_text = body.get('message_text', '').strip()
            
            if not message_text or not sender_login:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Message and sender required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                """
                INSERT INTO chat_messages (chat_type, sender_login, sender_name, message_text)
                VALUES (%s, %s, %s, %s)
                RETURNING id, chat_type, sender_login, sender_name, message_text, created_at
                """,
                (chat_type, sender_login, sender_name, message_text)
            )
            new_message = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': dict(new_message)}, default=str),
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
